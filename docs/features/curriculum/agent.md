# Agent Guidance: Curriculum & Programs Feature

## 1. Domain Overview
ฟีเจอร์ Curriculum & Programs ทำหน้าที่จัดการข้อมูลหลักสูตรการศึกษาและแผนการเรียนของคณะ ประกอบด้วยระดับการศึกษา:
- `BACHELOR`: ปริญญาตรี (4 ปี)
- `MASTER`: ปริญญาโท (2 ปี)
- `DOCTORAL`: ปริญญาเอก (3 ปี)
- `DIPLOMA`: ประกาศนียบัตร / อบรมระยะสั้น

## 2. Architecture & File Structure
```text
src/features/curriculum/
├── index.ts                 # Public client exports (types, helpers)
├── server.ts                # Server-only data queries
├── actions.ts               # Server Actions (create, update, delete)
├── permissions.ts           # Permission definitions (curriculum:read, curriculum:manage)
├── messages.ts              # i18n dictionaries (th / en)
└── _internal/
    ├── validations.ts       # Zod schemas (createProgramSchema, updateProgramSchema)
    ├── validations.test.ts  # Unit tests for Zod schemas
    ├── services.ts          # Pure business logic and DB operations
    └── types.ts             # Internal domain types
```

## 3. UI Routes
- Public Portal:
  - `src/app/(portal)/programs/page.tsx` (Program Directory)
  - `src/app/(portal)/programs/[code]/page.tsx` (Program Detail View)
- Admin Console:
  - `src/app/(admin)/admin/programs/page.tsx` (Program Management Table)
  - `src/app/(admin)/admin/programs/_components/program-client.tsx` (Interactive DataTable & Form Dialog)

## 4. Key Rules
- Always use `tenantId` from session context (`ctx.tenantId`).
- Validate `code` uniqueness per tenant.
- Audit all mutations using `writeAudit(...)`.
- Proxy router in `src/proxy.ts` must allow public access to `/programs`.
