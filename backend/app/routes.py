import re

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, verify_password
from app.database import get_db
from app.models import Admin, Branch, Elective, Faculty, Student, StudentElective
from app.schemas import (
    AdminStatsOut,
    BranchElectivesGroup,
    ElectiveSelectionRequest,
    FacultyDashboardOut,
    FacultyOut,
    FacultyPreferenceRequest,
    LoginRequest,
    PrerequisiteCheckResponse,
    PrerequisiteCheckResult,
    StudentDashboardOut,
    TokenResponse,
)
from app.services import elective_to_out, get_faculty_for_elective, get_enrolled_count

router = APIRouter()


def clean_student_name(name: str) -> str:
    sanitized = re.sub(r'\d+', '', name).strip()
    parts = sanitized.split()
    return " ".join(parts[:2]) if parts else sanitized


def derive_section_from_srn(srn: str) -> str:
    match = re.search(r'(\d+)$', srn)
    if not match:
        return ""
    index = int(match.group(1))
    sections = ["A", "B", "C", "D", "E"]
    return sections[(index - 1) % len(sections)]


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    role = payload.role.lower()
    display_name = ""
    user_id = payload.username

    if role == "student":
        user = db.query(Student).filter(Student.srn == payload.username).first()
        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        display_name = clean_student_name(user.student_name)

    elif role == "faculty":
        user = db.query(Faculty).filter(
            Faculty.faculty_id == payload.username
        ).first()
        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        display_name = user.faculty_name

    elif role == "admin":
        user = db.query(Admin).filter(
            Admin.admin_id == payload.username
        ).first()
        if not user or not verify_password(payload.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        display_name = user.admin_name

    else:
        raise HTTPException(status_code=400, detail="Invalid role")

    token = create_access_token({"sub": user_id, "role": role})

    return TokenResponse(
        access_token=token,
        role=role,
        display_name=display_name,
        user_id=user_id,
    )


@router.get("/student/dashboard", response_model=StudentDashboardOut)
def student_dashboard(
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")
    student = current["user"]
    branch = db.query(Branch).filter(Branch.branch_id == student.branch_id).first()
    registration = (
        db.query(StudentElective).filter(StudentElective.srn == student.srn).first()
    )

    elective_1 = elective_2 = None
    if registration:
        if registration.elective_1_id:
            e1 = db.query(Elective).filter(Elective.elective_id == registration.elective_1_id).first()
            if e1:
                elective_1 = elective_to_out(db, e1)
        if registration.elective_2_id:
            e2 = db.query(Elective).filter(Elective.elective_id == registration.elective_2_id).first()
            if e2:
                elective_2 = elective_to_out(db, e2)

    return StudentDashboardOut(
        srn=student.srn,
        student_name=clean_student_name(student.student_name),
        section=student.section or derive_section_from_srn(student.srn),
        semester=student.semester,
        branch_id=student.branch_id,
        branch_name=branch.branch_name if branch else "",
        phone_number=student.phone_number,
        email=student.email,
        cgpa=student.cgpa,
        registration_status=student.registration_status,
        elective_1=elective_1,
        elective_2=elective_2,
    )


@router.get("/student/electives", response_model=list[BranchElectivesGroup])
def get_available_electives(
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")
    student = current["user"]
    electives = (
        db.query(Elective)
        .filter(Elective.semester == student.semester)
        .order_by(Elective.branch_id, Elective.elective_name)
        .all()
    )

    branches_map: dict[int, BranchElectivesGroup] = {}
    for elective in electives:
        if elective.branch_id not in branches_map:
            branch = db.query(Branch).filter(Branch.branch_id == elective.branch_id).first()
            branches_map[elective.branch_id] = BranchElectivesGroup(
                branch_id=elective.branch_id,
                branch_name=branch.branch_name if branch else "",
                electives=[],
            )
        branches_map[elective.branch_id].electives.append(elective_to_out(db, elective))

    return list(branches_map.values())


@router.post("/student/check-prerequisites", response_model=PrerequisiteCheckResponse)
def check_prerequisites(
    payload: ElectiveSelectionRequest,
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")
    student = current["user"]

    if payload.elective_1_id == payload.elective_2_id:
        raise HTTPException(status_code=400, detail="Electives must be different")

    results = []
    for elective_id in [payload.elective_1_id, payload.elective_2_id]:
        elective = db.query(Elective).filter(Elective.elective_id == elective_id).first()
        if not elective:
            raise HTTPException(status_code=404, detail=f"Elective {elective_id} not found")
        if elective.semester != student.semester:
            raise HTTPException(status_code=400, detail="Elective not available for your semester")

        branch = db.query(Branch).filter(Branch.branch_id == elective.branch_id).first()
        is_cross = elective.branch_id != student.branch_id

        if not is_cross:
            results.append(
                PrerequisiteCheckResult(
                    elective_id=elective.elective_id,
                    elective_name=elective.elective_name,
                    branch_name=branch.branch_name if branch else "",
                    is_cross_department=False,
                    passed=True,
                    missing_prerequisites=[],
                )
            )
            continue

        completed_ids = {p.prereq_id for p in student.completed_prerequisites}
        required = elective.prerequisites
        missing = [p.prereq_name for p in required if p.prereq_id not in completed_ids]

        results.append(
            PrerequisiteCheckResult(
                elective_id=elective.elective_id,
                elective_name=elective.elective_name,
                branch_name=branch.branch_name if branch else "",
                is_cross_department=True,
                passed=len(missing) == 0,
                missing_prerequisites=missing,
            )
        )

    return PrerequisiteCheckResponse(
        all_passed=all(r.passed for r in results),
        results=results,
    )


@router.post("/student/select-electives")
def select_electives(
    payload: ElectiveSelectionRequest,
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")
    if not payload.accept_terms:
        raise HTTPException(status_code=400, detail="You must accept terms and conditions")

    student = current["user"]
    if student.registration_status == "Registered":
        raise HTTPException(status_code=400, detail="Already registered")

    check = check_prerequisites(payload, current, db)
    if not check.all_passed:
        raise HTTPException(status_code=400, detail="Prerequisite requirements not met")

    e1 = db.query(Elective).filter(Elective.elective_id == payload.elective_1_id).first()
    e2 = db.query(Elective).filter(Elective.elective_id == payload.elective_2_id).first()
    if not e1 or not e2:
        raise HTTPException(status_code=404, detail="Selected elective not found")
    if e1.elective_id == e2.elective_id:
        raise HTTPException(status_code=400, detail="Electives must be different")

    registration = (
        db.query(StudentElective).filter(StudentElective.srn == student.srn).first()
    )
    if registration:
        registration.elective_1_id = payload.elective_1_id
        registration.elective_2_id = payload.elective_2_id
    else:
        registration = StudentElective(
            srn=student.srn,
            elective_1_id=payload.elective_1_id,
            elective_2_id=payload.elective_2_id,
        )
        db.add(registration)

    db.commit()
    return {
        "message": "Electives selected. Proceed to faculty preference.",
        "elective_1_id": payload.elective_1_id,
        "elective_2_id": payload.elective_2_id,
    }


@router.get("/student/faculty/{elective_id}", response_model=list[FacultyOut])
def get_elective_faculty(
    elective_id: int,
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")
    faculty_list = get_faculty_for_elective(db, elective_id)
    return [FacultyOut(**f) for f in faculty_list]


@router.get("/student/pending-registration")
def get_pending_registration(
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")
    registration = (
        db.query(StudentElective)
        .filter(StudentElective.srn == current["id"])
        .first()
    )
    if not registration or not registration.elective_1_id or not registration.elective_2_id:
        raise HTTPException(status_code=404, detail="No pending elective selection")

    e1 = elective_to_out(db, registration.elective_1)
    e2 = elective_to_out(db, registration.elective_2)
    return {"elective_1": e1, "elective_2": e2}


@router.post("/student/submit-registration")
def submit_registration(
    payload: FacultyPreferenceRequest,
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    student = current["user"]
    registration = (
        db.query(StudentElective).filter(StudentElective.srn == student.srn).first()
    )
    if not registration or not registration.elective_1_id or not registration.elective_2_id:
        raise HTTPException(status_code=400, detail="Complete elective selection first")

    def validate_prefs(prefs: list[str], elective_id: int, label: str):
        if len(prefs) != len(set(prefs)):
            raise HTTPException(status_code=400, detail=f"Duplicate faculty in {label}")
        valid_faculty = {f["faculty_id"] for f in get_faculty_for_elective(db, elective_id)}
        for pref in prefs:
            if pref not in valid_faculty:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid faculty {pref} for {label}",
                )

    validate_prefs(payload.elective_1_prefs, registration.elective_1_id, "Elective 1")
    validate_prefs(payload.elective_2_prefs, registration.elective_2_id, "Elective 2")

    registration.faculty_elective_1_pref_1 = payload.elective_1_prefs[0]
    registration.faculty_elective_1_pref_2 = (
        payload.elective_1_prefs[1] if len(payload.elective_1_prefs) > 1 else None
    )
    registration.faculty_elective_1_pref_3 = (
        payload.elective_1_prefs[2] if len(payload.elective_1_prefs) > 2 else None
    )
    registration.faculty_elective_2_pref_1 = payload.elective_2_prefs[0]
    registration.faculty_elective_2_pref_2 = (
        payload.elective_2_prefs[1] if len(payload.elective_2_prefs) > 1 else None
    )
    registration.faculty_elective_2_pref_3 = (
        payload.elective_2_prefs[2] if len(payload.elective_2_prefs) > 2 else None
    )

    student.registration_status = "Registered"
    db.commit()
    return {"message": "Registration completed successfully"}


@router.get("/faculty/dashboard", response_model=FacultyDashboardOut)
def faculty_dashboard(
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Faculty only")
    faculty = current["user"]
    from app.models import FacultyElective

    assignments = (
        db.query(FacultyElective)
        .filter(FacultyElective.faculty_id == faculty.faculty_id)
        .all()
    )
    electives = [elective_to_out(db, a.elective) for a in assignments]

    elective_ids = [e.elective_id for e in electives]
    student_count = 0
    for reg in db.query(StudentElective).all():
        if reg.elective_1_id in elective_ids or reg.elective_2_id in elective_ids:
            student_count += 1

    return FacultyDashboardOut(
        faculty_id=faculty.faculty_id,
        faculty_name=faculty.faculty_name,
        electives=electives,
        student_count=student_count,
    )


@router.get("/admin/stats", response_model=AdminStatsOut)
def admin_stats(
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "admin":
        raise HTTPException(status_code=403, detail="Administrators only")

    total_students = db.query(Student).count()
    registered = db.query(Student).filter(Student.registration_status == "Registered").count()
    return AdminStatsOut(
        total_students=total_students,
        registered_students=registered,
        total_faculty=db.query(Faculty).count(),
        total_electives=db.query(Elective).count(),
        total_branches=db.query(Branch).count(),
    )


@router.get("/admin/students")
def admin_students(
    current=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current["role"] != "admin":
        raise HTTPException(status_code=403, detail="Administrators only")

    students = db.query(Student).all()
    result = []
    for s in students:
        branch = db.query(Branch).filter(Branch.branch_id == s.branch_id).first()
        reg = db.query(StudentElective).filter(StudentElective.srn == s.srn).first()
        result.append(
            {
                "srn": s.srn,
                "student_name": s.student_name,
                "section": s.section,
                "branch_name": branch.branch_name if branch else "",
                "cgpa": s.cgpa,
                "registration_status": s.registration_status,
                "elective_1": reg.elective_1.elective_name if reg and reg.elective_1 else None,
                "elective_2": reg.elective_2.elective_name if reg and reg.elective_2 else None,
            }
        )
    return result
