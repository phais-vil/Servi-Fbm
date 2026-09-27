# Agent Coding Rules: Classroom & Activity Attendance Tracking

## 1. Modular Monolith Architecture
- Code belongs under `src/features/attendance/`.
- Entry points:
  - `src/features/attendance/index.ts`
  - `src/features/attendance/server.ts`
  - `src/features/attendance/actions.ts`
- Internal implementations under `src/features/attendance/_internal/`.
- No cross-feature imports from other `_internal/` directories.

## 2. Security & Multi-Tenancy
- Check-in mutations require active session context (`ctx.userId`, `ctx.tenantId`).
- Session administration and roster modifications require `attendance:manage` permission.

## 3. UI & Design System (Liyon)
- Use standard Liyon components: `DataTable`, `StatusPill`, `LiyonDialog`, `LiyonField`, `LiyonSelect`.
- Bilingual i18n required for all labels and error messages.
