# Agent Guidance: Document & Workflow Management

## 1. Domain Overview
ระบบ Document & Workflow Management ทำหน้าที่จัดการวงจรชีวิตคำร้อง (Petition Lifecycle):
`SUBMITTED` -> `IN_REVIEW` -> `APPROVED` | `REJECTED` | `CANCELLED`

## 2. Architecture & File Structure
```text
src/features/documents/
├── index.ts                     # Public client exports (types, helpers)
├── server.ts                    # Server-only data queries
├── actions.ts                   # Server Actions (submit, review, cancel)
├── permissions.ts               # Permissions definition
├── messages.ts                  # i18n dictionaries
└── _internal/
    ├── validations.ts           # Zod schemas (createDocumentSchema, reviewDocumentSchema)
    ├── validations.test.ts      # Unit tests for schemas
    ├── services.ts              # Business logic & Prisma queries
    └── types.ts                 # Domain types
```

## 3. UI Routes
- Public/Student Portal:
  - `src/app/(portal)/requests/page.tsx` (My Requests & Tracking Code Search)
  - `src/app/(portal)/requests/new/page.tsx` (Submit Request Form)
  - `src/app/(portal)/requests/[code]/page.tsx` (Request Details & Timeline)
- Admin Console:
  - `src/app/(admin)/admin/documents/page.tsx` (Document Approvals Management Table)
  - `src/app/(admin)/admin/documents/_components/document-client.tsx` (Review Dialog & Actions)

## 4. Architectural Rules
- Always enforce `tenantId` from authenticated context (`ctx.tenantId`).
- Use `runAction(...)` with Zod validation and localized errors.
- Record all approvals in `DocumentApproval` with foreign key to reviewer and document.
