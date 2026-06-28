from sqlalchemy.orm import Session

from app.auth import hash_password, verify_password
from app.models import (
    Admin,
    Branch,
    Elective,
    Faculty,
    FacultyElective,
    Prerequisite,
    Student,
    StudentElective,
    elective_prerequisites,
    student_prerequisites,
)


def seed_database(db: Session) -> None:
    if db.query(Branch).first():
        return

    branches = [
        Branch(branch_id=1, branch_name="Computer Science & Engineering"),
        Branch(branch_id=2, branch_name="Electronics & Communication"),
        Branch(branch_id=3, branch_name="Mechanical Engineering"),
        Branch(branch_id=4, branch_name="Electrical & Electronics"),
        Branch(branch_id=5, branch_name="Information Science"),
    ]
    db.add_all(branches)

    prerequisites = [
        Prerequisite(prereq_id=1, prereq_name="Data Structures"),
        Prerequisite(prereq_id=2, prereq_name="Object Oriented Programming"),
        Prerequisite(prereq_id=3, prereq_name="Digital Logic Design"),
        Prerequisite(prereq_id=4, prereq_name="Engineering Mathematics"),
        Prerequisite(prereq_id=5, prereq_name="Computer Networks"),
    ]
    db.add_all(prerequisites)
    db.flush()

    electives = [
        # CSE - Semester 7
        Elective(elective_id=1, elective_name="Machine Learning", branch_id=1, semester=7, number_of_seats=60),
        Elective(elective_id=2, elective_name="Cloud Computing", branch_id=1, semester=7, number_of_seats=50),
        Elective(elective_id=3, elective_name="Cyber Security", branch_id=1, semester=7, number_of_seats=45),
        # ECE - Semester 7
        Elective(elective_id=4, elective_name="VLSI Design", branch_id=2, semester=7, number_of_seats=40),
        Elective(elective_id=5, elective_name="Embedded Systems", branch_id=2, semester=7, number_of_seats=55),
        Elective(elective_id=6, elective_name="Wireless Communication", branch_id=2, semester=7, number_of_seats=50),
        # ME - Semester 7
        Elective(elective_id=7, elective_name="Robotics", branch_id=3, semester=7, number_of_seats=35),
        Elective(elective_id=8, elective_name="Automotive Engineering", branch_id=3, semester=7, number_of_seats=40),
        # EEE - Semester 7
        Elective(elective_id=9, elective_name="Power Systems", branch_id=4, semester=7, number_of_seats=45),
        Elective(elective_id=10, elective_name="Renewable Energy", branch_id=4, semester=7, number_of_seats=40),
        # ISE - Semester 7
        Elective(elective_id=11, elective_name="Big Data Analytics", branch_id=5, semester=7, number_of_seats=55),
        Elective(elective_id=12, elective_name="Software Architecture", branch_id=5, semester=7, number_of_seats=50),
    ]
    db.add_all(electives)
    db.flush()

    # Cross-department elective prerequisites
    db.execute(
        elective_prerequisites.insert(),
        [
            {"elective_id": 1, "prereq_id": 1},
            {"elective_id": 1, "prereq_id": 2},
            {"elective_id": 2, "prereq_id": 1},
            {"elective_id": 3, "prereq_id": 1},
            {"elective_id": 3, "prereq_id": 5},
            {"elective_id": 4, "prereq_id": 3},
            {"elective_id": 5, "prereq_id": 3},
            {"elective_id": 11, "prereq_id": 1},
            {"elective_id": 11, "prereq_id": 4},
            {"elective_id": 12, "prereq_id": 2},
        ],
    )

    faculty_members = [
        Faculty(faculty_id="FAC001", faculty_name="Dr. Rajesh Kumar", password=hash_password("faculty123")),
        Faculty(faculty_id="FAC002", faculty_name="Dr. Priya Sharma", password=hash_password("faculty123")),
        Faculty(faculty_id="FAC003", faculty_name="Dr. Anil Mehta", password=hash_password("faculty123")),
        Faculty(faculty_id="FAC004", faculty_name="Dr. Sunita Rao", password=hash_password("faculty123")),
        Faculty(faculty_id="FAC005", faculty_name="Dr. Vikram Singh", password=hash_password("faculty123")),
        Faculty(faculty_id="FAC006", faculty_name="Dr. Meera Nair", password=hash_password("faculty123")),
        Faculty(faculty_id="FAC007", faculty_name="Dr. Karthik Reddy", password=hash_password("faculty123")),
        Faculty(faculty_id="FAC008", faculty_name="Dr. Lakshmi Devi", password=hash_password("faculty123")),
    ]
    db.add_all(faculty_members)
    db.flush()

    faculty_elective_map = [
        FacultyElective(faculty_id="FAC001", elective_id=1),
        FacultyElective(faculty_id="FAC002", elective_id=1),
        FacultyElective(faculty_id="FAC003", elective_id=2),
        FacultyElective(faculty_id="FAC001", elective_id=3),
        FacultyElective(faculty_id="FAC004", elective_id=4),
        FacultyElective(faculty_id="FAC005", elective_id=5),
        FacultyElective(faculty_id="FAC006", elective_id=6),
        FacultyElective(faculty_id="FAC007", elective_id=7),
        FacultyElective(faculty_id="FAC008", elective_id=8),
        FacultyElective(faculty_id="FAC002", elective_id=11),
        FacultyElective(faculty_id="FAC003", elective_id=12),
        FacultyElective(faculty_id="FAC004", elective_id=9),
        FacultyElective(faculty_id="FAC005", elective_id=10),
    ]
    db.add_all(faculty_elective_map)

    students = [
        Student(
            srn="PES1UG22CS001",
            student_name="Arjun Patel",
            section="A",
            semester=7,
            branch_id=1,
            phone_number="9876543210",
            email="arjun.patel@pes.edu",
            cgpa=8.75,
            registration_status="Not Registered",
            password=hash_password("student123"),
        ),
        Student(
            srn="PES1UG22ME015",
            student_name="Rahul Sharma",
            section="B",
            semester=7,
            branch_id=3,
            phone_number="9876543211",
            email="rahul.sharma@pes.edu",
            cgpa=7.90,
            registration_status="Not Registered",
            password=hash_password("student123"),
        ),
        Student(
            srn="PES1UG22EC008",
            student_name="Sneha Reddy",
            section="A",
            semester=7,
            branch_id=2,
            phone_number="9876543212",
            email="sneha.reddy@pes.edu",
            cgpa=9.10,
            registration_status="Registered",
            password=hash_password("student123"),
        ),
    ]
    db.add_all(students)
    db.flush()

    # Student prerequisites completed
    db.execute(
        student_prerequisites.insert(),
        [
            {"srn": "PES1UG22CS001", "prereq_id": 1},
            {"srn": "PES1UG22CS001", "prereq_id": 2},
            {"srn": "PES1UG22CS001", "prereq_id": 4},
            {"srn": "PES1UG22CS001", "prereq_id": 5},
            {"srn": "PES1UG22ME015", "prereq_id": 1},
            {"srn": "PES1UG22ME015", "prereq_id": 2},
            {"srn": "PES1UG22ME015", "prereq_id": 4},
            {"srn": "PES1UG22EC008", "prereq_id": 3},
            {"srn": "PES1UG22EC008", "prereq_id": 4},
        ],
    )

    # Pre-registered student
    db.add(
        StudentElective(
            srn="PES1UG22EC008",
            elective_1_id=4,
            elective_2_id=6,
            faculty_elective_1_pref_1="FAC004",
            faculty_elective_1_pref_2="FAC005",
            faculty_elective_2_pref_1="FAC006",
            faculty_elective_2_pref_2="FAC004",
        )
    )

    db.add(
        Admin(
            admin_id="admin",
            admin_name="System Administrator",
            password=hash_password("admin123"),
        )
    )

    db.commit()
