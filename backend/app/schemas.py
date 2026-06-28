from typing import List, Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    role: str
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    display_name: str
    user_id: str


class BranchOut(BaseModel):
    branch_id: int
    branch_name: str

    class Config:
        from_attributes = True


class PrerequisiteOut(BaseModel):
    prereq_id: int
    prereq_name: str

    class Config:
        from_attributes = True


class ElectiveOut(BaseModel):
    elective_id: int
    elective_name: str
    branch_id: int
    branch_name: str
    semester: int
    number_of_seats: int
    enrolled_count: int = 0
    prerequisites: List[PrerequisiteOut] = []

    class Config:
        from_attributes = True


class FacultyOut(BaseModel):
    faculty_id: str
    faculty_name: str

    class Config:
        from_attributes = True


class StudentDashboardOut(BaseModel):
    srn: str
    student_name: str
    section: str
    semester: int
    branch_id: int
    branch_name: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    cgpa: float
    registration_status: str
    elective_1: Optional[ElectiveOut] = None
    elective_2: Optional[ElectiveOut] = None


class BranchElectivesGroup(BaseModel):
    branch_id: int
    branch_name: str
    electives: List[ElectiveOut]


class ElectiveSelectionRequest(BaseModel):
    elective_1_id: int
    elective_2_id: int
    accept_terms: bool = Field(..., description="Must be true to proceed")


class PrerequisiteCheckResult(BaseModel):
    elective_id: int
    elective_name: str
    branch_name: str
    is_cross_department: bool
    passed: bool
    missing_prerequisites: List[str] = []


class PrerequisiteCheckResponse(BaseModel):
    all_passed: bool
    results: List[PrerequisiteCheckResult]


class FacultyPreferenceRequest(BaseModel):
    elective_1_prefs: List[str] = Field(..., min_length=1, max_length=3)
    elective_2_prefs: List[str] = Field(..., min_length=1, max_length=3)


class FacultyDashboardOut(BaseModel):
    faculty_id: str
    faculty_name: str
    electives: List[ElectiveOut]
    student_count: int


class AdminStatsOut(BaseModel):
    total_students: int
    registered_students: int
    total_faculty: int
    total_electives: int
    total_branches: int
