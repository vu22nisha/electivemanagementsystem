export interface AuthUser {
  token: string;
  role: 'student' | 'faculty' | 'admin';
  displayName: string;
  userId: string;
}

export interface Elective {
  elective_id: number;
  elective_name: string;
  branch_id: number;
  branch_name: string;
  semester: number;
  number_of_seats: number;
  enrolled_count: number;
  prerequisites: { prereq_id: number; prereq_name: string }[];
}

export interface StudentDashboard {
  srn: string;
  student_name: string;
  section: string;
  semester: number;
  branch_id: number;
  branch_name: string;
  phone_number?: string;
  email?: string;
  cgpa: number;
  registration_status: string;
  elective_1?: Elective | null;
  elective_2?: Elective | null;
}

export interface BranchElectivesGroup {
  branch_id: number;
  branch_name: string;
  electives: Elective[];
}

export interface FacultyMember {
  faculty_id: string;
  faculty_name: string;
}

export interface PrerequisiteCheckResult {
  elective_id: number;
  elective_name: string;
  branch_name: string;
  is_cross_department: boolean;
  passed: boolean;
  missing_prerequisites: string[];
}

export interface FacultyDashboard {
  faculty_id: string;
  faculty_name: string;
  electives: Elective[];
  student_count: number;
}

export interface AdminStats {
  total_students: number;
  registered_students: number;
  total_faculty: number;
  total_electives: number;
  total_branches: number;
}

export interface AdminStudent {
  srn: string;
  student_name: string;
  section: string;
  branch_name: string;
  cgpa: number;
  registration_status: string;
  elective_1?: string | null;
  elective_2?: string | null;
}
