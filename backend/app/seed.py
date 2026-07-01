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
        # CSE - Semester 
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

    students = []
    # Create 720 dummy CSE students
    student_names = [
        "Arjun Patel", "Bhavna Singh", "Chetan Kumar", "Diya Nair", "Eshwar Reddy",
        "Farha Khan", "Gagan Verma", "Hema Iyer", "Isha Gupta", "Jatin Sharma",
        "Kavya Desai", "Laxmi Menon", "Mohan Das", "Nisha Patel", "Omkar Kulkarni",
        "Priya Sharma", "Qasim Ahmed", "Ravi Kumar", "Sneha Roy", "Teja Srinivas",
        "Usha Malik", "Varun Singh", "Waqar Hassan", "Yash Kapoor", "Zara Khan",
        "Aditya Banerjee", "Bhanu Prakash", "Chandni Gupta", "Deepak Verma", "Eesha Reddy",
    ]
    sections = ["A", "B", "C", "D", "E"]
    hashed_pwd = hash_password("student123")  # Hash once, reuse for all

    for index in range(1, 721):
        srn = f"PES1UG25CS{index:03d}"
        name = student_names[(index - 1) % len(student_names)]
        section = sections[(index - 1) % len(sections)]
        cgpa = 7.0 + ((index % 31) * 0.1)
        students.append(
            Student(
                srn=srn,
                student_name=name,
                section=section,
                semester=7,
                branch_id=1,
                phone_number=f"987650{index:04d}",
                email=f"cs{index}@pes.edu",
                cgpa=min(cgpa, 10.0),
                registration_status="Not Registered",
                password=hashed_pwd,
            )
        )

    db.add_all(students)
    db.flush()

    # Student prerequisites completed - add for first 100 students
    prereq_data = []
    for i in range(1, 101):
        srn = f"PES1UG25CS{i:03d}"
        if i % 3 == 0:
            prereq_data.extend([
                {"srn": srn, "prereq_id": 1},
                {"srn": srn, "prereq_id": 2},
                {"srn": srn, "prereq_id": 4},
                {"srn": srn, "prereq_id": 5},
            ])
        elif i % 3 == 1:
            prereq_data.extend([
                {"srn": srn, "prereq_id": 1},
                {"srn": srn, "prereq_id": 2},
                {"srn": srn, "prereq_id": 4},
            ])
        else:
            prereq_data.extend([
                {"srn": srn, "prereq_id": 3},
                {"srn": srn, "prereq_id": 4},
            ])
    
    db.execute(student_prerequisites.insert(), prereq_data)

    # Pre-registered student from the 720
    db.add(
        StudentElective(
            srn="PES1UG25CS010",
            elective_1_id=1,
            elective_2_id=2,
            faculty_elective_1_pref_1="FAC001",
            faculty_elective_1_pref_2="FAC002",
            faculty_elective_2_pref_1="FAC003",
            faculty_elective_2_pref_2="FAC001",
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
