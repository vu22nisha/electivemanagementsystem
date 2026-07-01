# PES University Elective Management System

A full-stack web portal for managing elective course registration at PES University, supporting **Student**, **Faculty**, and **Administrator** roles.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | SQLite |
| Auth | JWT tokens with bcrypt password hashing |

## Features

- **Unified login** with role selection (Student / Faculty / Administrator)
- **Light & dark mode** toggle
- **Student dashboard** with info cards (details, CGPA, registration status) and elective summary
- **Elective registration** grouped by branch with radio selection (one per branch, two total)
- **Smart prerequisite verification** — skipped for same-department electives, enforced for cross-department
- **Faculty preference ranking** (up to 3 preferences per elective)
- **Faculty dashboard** showing assigned electives and student counts
- **Admin dashboard** with system statistics and registration overview

## Quick Start

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

API docs: http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Portal: 

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Student (CSE) | `PES1UG22CS001` | `student123` |
| Student (ME) | `PES1UG22ME015` | `student123` |
| Student (ECE, pre-registered) | `PES1UG22EC008` | `student123` |
| Faculty | `FAC001` | `faculty123` |
| Admin | `admin` | `admin123` |

## Database Schema

- `students` — SRN, name, section, semester, branch, CGPA, registration status, password
- `branches` — branch ID and name
- `electives` — elective details with seat capacity per semester
- `faculty` — faculty ID, name, password
- `faculty_electives` — which faculty teach which electives
- `student_electives` — elective selections and faculty preferences
- `prerequisites` / `elective_prerequisites` / `student_prerequisites` — prerequisite tracking

## Student Registration Flow

1. Login → Student Dashboard
2. Click **Register Electives** → select one elective from each of two different branches
3. Verify prerequisites (auto-skipped for own department)
4. Accept terms & conditions
5. Rank faculty preferences for each elective
6. Submit → dashboard shows registered electives

## Scaling Notes

The architecture supports 1200–1500 students via:
- SQLite with indexed primary keys (can migrate to PostgreSQL for production)
- Stateless JWT authentication
- Efficient seat counting and semester-filtered elective queries
