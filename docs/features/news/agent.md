# AI Coding Instructions & Rules
## ฟีเจอร์: ระบบจัดการข่าวสารประชาสัมพันธ์ (News & Announcements)

กฎระเบียบนี้ยึดถือตาม `AGENTS.md` และข้อกำหนดของระบบสถาปัตยกรรม Modular Monolith ห้ามละเมิดโดยเด็ดขาด:

### 1. ขอบเขตโมดูลและโครงสร้างไฟล์ (Feature Boundaries)
- โค้ดทั้งหมดของฟีเจอร์นี้ต้องอยู่ภายใต้ `src/features/news/`
- โครงสร้างที่อนุญาตให้เปิดเผยสู่ภายนอก (Public API):
  - `src/features/news/index.ts` (Client-safe types, constants, helpers)
  - `src/features/news/server.ts` (Data queries สำหรับ Server Components)
  - `src/features/news/actions.ts` (Server Actions สำหรับ mutations)
  - `src/features/news/permissions.ts` (Permission codes & definitions)
  - `src/features/news/messages.ts` (คำแปลสองภาษา TH/EN)
- การทำงานภายในทั้งหมดต้องอยู่ใน `src/features/news/_internal/` เท่านั้น (เช่น `services.ts`, `validations.ts`)
- **ห้ามเด็ดขาด:** ห้าม import ข้ามเข้าไปยัง `_internal` ของโมดูลอื่น (ตรวจสอบด้วย `npm run deps:check`)

### 2. Multi-Tenancy & Security
- ทุกการ query หรือ mutate ในตารางข่าวสาร ต้องมีเงื่อนไข `where: { tenantId }` เสมอ
- ห้ามรับ `tenantId` จากฝั่ง Client โดยตรง ให้ดึงจาก Session (`ctx.tenantId`) ผ่าน `requirePermission(...)`
- บันทึกการกระทำที่สำคัญลงใน `audit_logs` ผ่านฟังก์ชัน `writeAudit` หรือ Prisma transaction

### 3. Internationalization (i18n)
- ห้ามฮาร์ดโค้ดข้อความภาษาไทยหรือภาษาอังกฤษในส่วน UI
- ใช้ `t("key")` เสมอ โดยประกาศคีย์ทั้งหมดใน `src/features/news/messages.ts` และนำไปลงทะเบียนใน `src/i18n/index.ts`

### 4. UI & Components (Liyon System)
- ใช้ UI Component พื้นฐานจาก `@/shared/components/liyon` เท่านั้น (เช่น `Button`, `Dialog`, `StatusPill`, `DataTable`, `Field`, `Input`, `Textarea`, `Select`)
- หน้าจอฝั่งหลังบ้านอยู่ใน `src/app/(admin)/news/`
- หน้าจอฝั่งหน้าบ้านอยู่ใน `src/app/(portal)/news/`

### 5. Quality Gate
- ก่อนส่งมอบงาน ต้องรันคำสั่งตรวจสอบ:
  1. `npm run type-check`
  2. `npm run lint`
  3. `npm run deps:check`
  4. `npm run test`
  และต้องผ่าน 100% (Zero Error)
