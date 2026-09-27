# Step-by-step Implementation Plan
## ฟีเจอร์: ระบบจัดการบุคลากร (Staff & Faculty Directory)

### Task Breakdown & Checklist

- [ ] **Step 1: Database Model & Migration**
  - [ ] 1.1 เพิ่มโมเดล `Department` และ `StaffProfile` ใน `prisma/schema.prisma`
  - [ ] 1.2 เพิ่มความสัมพันธ์ใน `Tenant` และ `User`
  - [ ] 1.3 รัน `npx prisma db push` และ `npx prisma generate`

- [ ] **Step 2: Internal Services & Validations**
  - [ ] 2.1 สร้าง Zod schemas ใน `src/features/staff/_internal/validations.ts`
  - [ ] 2.2 สร้าง Unit Test ใน `src/features/staff/_internal/validations.test.ts`
  - [ ] 2.3 สร้าง Services ใน `src/features/staff/_internal/services.ts`

- [ ] **Step 3: Server Actions & Central Registration**
  - [ ] 3.1 สร้าง Permissions ใน `src/features/staff/permissions.ts`
  - [ ] 3.2 ลงทะเบียนสิทธิ์ใน `src/permissions.ts`
  - [ ] 3.3 สร้างคำแปลสองภาษาใน `src/features/staff/messages.ts`
  - [ ] 3.4 ลงทะเบียนคำแปลใน `src/i18n/index.ts`
  - [ ] 3.5 สร้าง Server Actions ใน `src/features/staff/_internal/actions.ts`
  - [ ] 3.6 Export Public API ใน `index.ts`, `server.ts`, `actions.ts`

- [ ] **Step 4: UI Development (Portal & Admin)**
  - [ ] 4.1 สร้างหน้า Admin ใน `src/app/(admin)/admin/staff/page.tsx` และ client component
  - [ ] 4.2 สร้างหน้า Public Portal ใน `src/app/(portal)/staff/page.tsx`
  - [ ] 4.3 อัปเดต `src/proxy.ts` ให้ `/staff` เข้าถึงได้แบบสาธารณะ
  - [ ] 4.4 เพิ่มเมนูใน Admin Sidebar

- [ ] **Step 5: Quality Gate & Verification**
  - [ ] 5.1 ตรวจสอบ Types: `npm run type-check`
  - [ ] 5.2 ตรวจสอบ Lint & Dependencies: `npm run lint && npm run deps:check`
  - [ ] 5.3 รัน Unit Tests: `npm run test`
