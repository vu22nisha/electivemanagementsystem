const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
  }
  return res.json();
}

export const api = {
  login: (role: string, username: string, password: string) =>
    request<{ access_token: string; role: string; display_name: string; user_id: string }>(
      '/login',
      { method: 'POST', body: JSON.stringify({ role, username, password }) }
    ),

  getStudentDashboard: () => request<import('./types').StudentDashboard>('/student/dashboard'),
  getAvailableElectives: () => request<import('./types').BranchElectivesGroup[]>('/student/electives'),
  checkPrerequisites: (elective_1_id: number, elective_2_id: number) =>
    request<{ all_passed: boolean; results: import('./types').PrerequisiteCheckResult[] }>(
      '/student/check-prerequisites',
      { method: 'POST', body: JSON.stringify({ elective_1_id, elective_2_id, accept_terms: false }) }
    ),
  selectElectives: (elective_1_id: number, elective_2_id: number) =>
    request<{ message: string }>('/student/select-electives', {
      method: 'POST',
      body: JSON.stringify({ elective_1_id, elective_2_id, accept_terms: true }),
    }),
  getElectiveFaculty: (electiveId: number) =>
    request<import('./types').FacultyMember[]>(`/student/faculty/${electiveId}`),
  getPendingRegistration: () =>
    request<{ elective_1: import('./types').Elective; elective_2: import('./types').Elective }>(
      '/student/pending-registration'
    ),
  submitRegistration: (elective_1_prefs: string[], elective_2_prefs: string[]) =>
    request<{ message: string }>('/student/submit-registration', {
      method: 'POST',
      body: JSON.stringify({ elective_1_prefs, elective_2_prefs }),
    }),

  getFacultyDashboard: () => request<import('./types').FacultyDashboard>('/faculty/dashboard'),
  getAdminStats: () => request<import('./types').AdminStats>('/admin/stats'),
  getAdminStudents: () => request<import('./types').AdminStudent[]>('/admin/students'),
};
