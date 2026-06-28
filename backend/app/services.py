from typing import List

from sqlalchemy.orm import Session

from app.models import Branch, Elective, FacultyElective, Prerequisite, StudentElective
from app.schemas import ElectiveOut, PrerequisiteOut


def get_enrolled_count(db: Session, elective_id: int) -> int:
    count = 0
    registrations = db.query(StudentElective).all()
    for reg in registrations:
        if reg.elective_1_id == elective_id or reg.elective_2_id == elective_id:
            count += 1
    return count


def elective_to_out(db: Session, elective: Elective) -> ElectiveOut:
    branch = db.query(Branch).filter(Branch.branch_id == elective.branch_id).first()
    prereqs = [PrerequisiteOut.model_validate(p) for p in elective.prerequisites]
    return ElectiveOut(
        elective_id=elective.elective_id,
        elective_name=elective.elective_name,
        branch_id=elective.branch_id,
        branch_name=branch.branch_name if branch else "",
        semester=elective.semester,
        number_of_seats=elective.number_of_seats,
        enrolled_count=get_enrolled_count(db, elective.elective_id),
        prerequisites=prereqs,
    )


def get_faculty_for_elective(db: Session, elective_id: int) -> List[dict]:
    assignments = (
        db.query(FacultyElective)
        .filter(FacultyElective.elective_id == elective_id)
        .all()
    )
    return [
        {
            "faculty_id": a.faculty.faculty_id,
            "faculty_name": a.faculty.faculty_name,
        }
        for a in assignments
    ]
