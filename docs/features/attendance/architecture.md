# Technical Architecture: Classroom & Activity Attendance Tracking

## 1. Directory Structure
```
src/features/attendance/
├── index.ts                # Public types and constants
├── server.ts               # Server data loaders
├── actions.ts              # Server Actions (checkIn, createSession, updateRecord)
├── permissions.ts          # ATTENDANCE_P & permissions definitions
├── messages.ts             # Thai / English i18n dictionaries
└── _internal/
    ├── validations.ts      # Zod validation schemas
    ├── validations.test.ts # Unit tests for schemas
    ├── services.ts         # Attendance calculations & database services
    └── actions.ts          # Action implementations
```

## 2. Route Mapping
- Public / Student Portal:
  - `src/app/(portal)/checkin/page.tsx` -> PIN & QR Fast Check-in Interface
  - `src/app/(portal)/attendance/page.tsx` -> Student Personal Attendance Log
- Admin / Lecturer Console:
  - `src/app/(admin)/admin/attendance/page.tsx` -> Session Management & Live Projector Mode
  - `src/app/(admin)/admin/attendance/_components/attendance-admin-client.tsx` -> Live Roster & Manual Check-in

## 3. Permissions
- `attendance:read` -> View attendance records and history.
- `attendance:checkin` -> Submit check-in for enrolled classes.
- `attendance:manage` -> Create sessions, run live QR projector, override attendance statuses.
