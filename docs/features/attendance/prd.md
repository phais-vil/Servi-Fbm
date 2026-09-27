# Product Requirements Document (PRD): Classroom & Activity Attendance Tracking

## 1. Executive Summary & Objective
The **Classroom & Activity Attendance Tracking System (ระบบตรวจเช็คการเข้าเรียนและกิจกรรม)** provides faculty lecturers, teaching assistants, and students with an efficient, reliable check-in and attendance recording platform.

It combines two flexible check-in methods:
1. **Dynamic Live QR Code & Numeric PIN:** Lecturers open a classroom projector mode on `/admin/attendance` displaying an auto-expiring QR code alongside a 4-6 digit numeric PIN. Students scan the code or enter the PIN on their mobile device at `/checkin` to log their attendance instantly.
2. **Interactive Lecturer Roster & Manual Override:** Lecturers can view the live roster of attendees, mark attendance manually for students without phones, and adjust statuses (`PRESENT`, `LATE`, `ABSENT`, `EXCUSED`).

---

## 2. User Personas & Roles

| Persona | Role | Key Responsibilities / Workflows |
|---|---|---|
| **Student** | `authenticated user` | Navigates to `/checkin` to scan class QR or input PIN, views personal attendance records & percentage statistics on `/attendance`. |
| **Lecturer / Course Instructor** | `attendance:manage` | Creates attendance sessions, projects live dynamic QR code and PIN, takes manual attendance, adjusts student records, exports attendance reports. |
| **Department Head / Academic Admin** | `attendance:manage` | Views faculty-wide classroom attendance compliance and analytics. |

---

## 3. Functional Requirements

### 3.1 Session Creation & Management
- Each session contains: Course Code, Course Name, Session Title, Date, Start Time, End Time, Late Cutoff (e.g. 15 minutes after start).
- Statuses: `SCHEDULED`, `ACTIVE`, `CLOSED`.
- Dynamic QR & PIN generation with real-time countdown timer.

### 3.2 Check-in Engine
- Check-in via `/checkin` using student session authentication.
- Verification of PIN or valid QR token.
- Automatic status calculation:
  - Check-in before or at late cutoff -> `PRESENT`
  - Check-in after late cutoff -> `LATE`
- Prevention of duplicate check-ins for the same student and session.

### 3.3 Lecturer Roster & Attendance Analytics
- Live roster showing real-time check-in stream (student name, code, time, status).
- Quick toggle buttons: Present (มาเรียน), Late (มาสาย), Absent (ขาด), Excused (ลา).
- Overall attendance rate calculation.

---

## 4. Acceptance Criteria
1. Lecturers can create class sessions and open projector mode.
2. Students can submit check-in via PIN/QR and have attendance recorded with timestamp.
3. Lecturers can override any student's status with immediate update.
4. Passes all VibeCore quality gates (`npm run check`).
