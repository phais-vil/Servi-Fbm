# Task Tracking & Quality Gates
## ฟีเจอร์: ระบบจัดการบุคลากร (Staff & Faculty Directory)

### สรุปความคืบหน้า (Progress Tracker)

| ขั้นตอน (Step) | งาน (Tasks) | สถานะ (Status) | หมายเหตุ |
| :--- | :--- | :---: | :--- |
| **Step 0: Specification** | สร้าง 6 ไฟล์พิมพ์เขียวใน `docs/features/staff/` | ✅ เสร็จสิ้น | PRD, Agent, Architecture, Schema, Plan, Progress |
| **Step 1: Database & Model** | Schema Prisma + Migration + Prisma Generate | ✅ เสร็จสิ้น | โมเดล `Department`, `StaffProfile`, Enum `StaffType` |
| **Step 2: Logic & Validations** | Zod Schemas + Unit Tests + Services | ✅ เสร็จสิ้น | `validations.ts`, `services.ts`, `validations.test.ts` |
| **Step 3: Central Registration** | Permissions + i18n Messages + Server Actions | ✅ เสร็จสิ้น | `STAFF_PERMISSIONS`, `messages.ts`, actions, seed สำเร็จ |
| **Step 4: UI Development** | Admin Page + Portal Staff Page | ✅ เสร็จสิ้น | `/admin/staff`, `/staff`, proxy, sidebar nav |
| **Step 5: Quality Gate** | type-check, lint, deps:check, test | ⏳ กำลังตรวจสอบ | |

### Quality Gate Checklist (VibeCore Standard)
- [ ] `npm run type-check` ผ่าน 100%
- [ ] `npm run type-check:tests` ผ่าน 100%
- [ ] `npm run lint` ผ่าน 100%
- [ ] `npm run deps:check` ผ่าน 100%
- [ ] `npm run test` ผ่าน 100%
