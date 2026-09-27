# AI Coding Instructions & Rules
## ฟีเจอร์: ระบบจัดการบุคลากร (Staff & Faculty Directory)

กฎระเบียบนี้ยึดถือตาม `AGENTS.md` และสถาปัตยกรรม Modular Monolith:

### 1. ขอบเขตโมดูลและโครงสร้างไฟล์ (Feature Boundaries)
- โค้ดทั้งหมดของฟีเจอร์นี้ต้องอยู่ภายใต้ `src/features/staff/`
- โครงสร้างที่อนุญาตให้เปิดเผยสู่ภายนอก (Public API):
  - `src/features/staff/index.ts` (Client-safe types, constants)
  - `src/features/staff/server.ts` (Data queries สำหรับ Server Components)
  - `src/features/staff/actions.ts` (Server Actions สำหรับ mutations)
  - `src/features/staff/permissions.ts` (Permission codes & definitions)
  - `src/features/staff/messages.ts` (คำแปลสองภาษา TH/EN)
- การทำงานภายในทั้งหมดต้องอยู่ใน `src/features/staff/_internal/` เท่านั้น (เช่น `services.ts`, `validations.ts`)
- **ห้ามเด็ดขาด:** ห้าม import ข้ามเข้าไปยัง `_internal` ของโมดูลอื่น

### 2. Multi-Tenancy & Security
- ทุกการ query ในตารางบุคลากรและภาควิชา ต้องมีเงื่อนไข `where: { tenantId }` เสมอ
- ห้ามรับ `tenantId` จากฝั่ง Client ให้ดึงจาก Session (`ctx.tenantId`) ผ่าน `requirePermission(...)`

### 3. Internationalization (i18n)
- ห้ามฮาร์ดโค้ดข้อความใน UI เด็ดขาด
- ใช้ `t("key")` เสมอ โดยประกาศคีย์ทั้งหมดใน `src/features/staff/messages.ts` และนำไปลงทะเบียนใน `src/i18n/index.ts`

### 4. UI & Components (Liyon System)
- ใช้ UI Component พื้นฐานจาก `@/shared/components/liyon` (DataTable, StatusPill, LiyonDialog, LiyonField, LiyonSelect, LiyonSwitchRow)
- หน้าจอฝั่งหลังบ้านอยู่ที่ `src/app/(admin)/admin/staff/`
- หน้าจอฝั่งหน้าบ้านอยู่ที่ `src/app/(portal)/staff/`
