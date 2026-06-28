from sqlalchemy import (
    Column,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base

student_prerequisites = Table(
    "student_prerequisites",
    Base.metadata,
    Column("srn", String, ForeignKey("students.srn"), primary_key=True),
    Column("prereq_id", Integer, ForeignKey("prerequisites.prereq_id"), primary_key=True),
)

elective_prerequisites = Table(
    "elective_prerequisites",
    Base.metadata,
    Column("elective_id", Integer, ForeignKey("electives.elective_id"), primary_key=True),
    Column("prereq_id", Integer, ForeignKey("prerequisites.prereq_id"), primary_key=True),
)


class Branch(Base):
    __tablename__ = "branches"

    branch_id = Column(Integer, primary_key=True, index=True)
    branch_name = Column(String, nullable=False, unique=True)

    students = relationship("Student", back_populates="branch")
    electives = relationship("Elective", back_populates="branch")


class Student(Base):
    __tablename__ = "students"

    srn = Column(String, primary_key=True, index=True)
    student_name = Column(String, nullable=False)
    section = Column(String, nullable=False)
    semester = Column(Integer, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.branch_id"), nullable=False)
    phone_number = Column(String)
    email = Column(String)
    cgpa = Column(Float, default=0.0)
    registration_status = Column(String, default="Not Registered")
    password = Column(String, nullable=False)

    branch = relationship("Branch", back_populates="students")
    elective_registration = relationship(
        "StudentElective", back_populates="student", uselist=False
    )
    completed_prerequisites = relationship(
        "Prerequisite", secondary=student_prerequisites, backref="students"
    )


class Elective(Base):
    __tablename__ = "electives"

    elective_id = Column(Integer, primary_key=True, index=True)
    elective_name = Column(String, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.branch_id"), nullable=False)
    semester = Column(Integer, nullable=False)
    number_of_seats = Column(Integer, default=60)

    branch = relationship("Branch", back_populates="electives")
    faculty_assignments = relationship("FacultyElective", back_populates="elective")
    prerequisites = relationship(
        "Prerequisite", secondary=elective_prerequisites, backref="electives"
    )


class Faculty(Base):
    __tablename__ = "faculty"

    faculty_id = Column(String, primary_key=True, index=True)
    faculty_name = Column(String, nullable=False)
    password = Column(String, nullable=False)

    elective_assignments = relationship("FacultyElective", back_populates="faculty")


class FacultyElective(Base):
    __tablename__ = "faculty_electives"
    __table_args__ = (UniqueConstraint("faculty_id", "elective_id"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    faculty_id = Column(String, ForeignKey("faculty.faculty_id"), nullable=False)
    elective_id = Column(Integer, ForeignKey("electives.elective_id"), nullable=False)

    faculty = relationship("Faculty", back_populates="elective_assignments")
    elective = relationship("Elective", back_populates="faculty_assignments")


class StudentElective(Base):
    __tablename__ = "student_electives"

    srn = Column(String, ForeignKey("students.srn"), primary_key=True)
    elective_1_id = Column(Integer, ForeignKey("electives.elective_id"), nullable=True)
    elective_2_id = Column(Integer, ForeignKey("electives.elective_id"), nullable=True)
    faculty_elective_1_pref_1 = Column(String, ForeignKey("faculty.faculty_id"), nullable=True)
    faculty_elective_1_pref_2 = Column(String, ForeignKey("faculty.faculty_id"), nullable=True)
    faculty_elective_1_pref_3 = Column(String, ForeignKey("faculty.faculty_id"), nullable=True)
    faculty_elective_2_pref_1 = Column(String, ForeignKey("faculty.faculty_id"), nullable=True)
    faculty_elective_2_pref_2 = Column(String, ForeignKey("faculty.faculty_id"), nullable=True)
    faculty_elective_2_pref_3 = Column(String, ForeignKey("faculty.faculty_id"), nullable=True)

    student = relationship("Student", back_populates="elective_registration")
    elective_1 = relationship("Elective", foreign_keys=[elective_1_id])
    elective_2 = relationship("Elective", foreign_keys=[elective_2_id])


class Prerequisite(Base):
    __tablename__ = "prerequisites"

    prereq_id = Column(Integer, primary_key=True, index=True)
    prereq_name = Column(String, nullable=False, unique=True)


class Admin(Base):
    __tablename__ = "admins"

    admin_id = Column(String, primary_key=True, index=True)
    admin_name = Column(String, nullable=False)
    password = Column(String, nullable=False)
