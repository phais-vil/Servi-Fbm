# Step-by-step Implementation Plan
## ฟีเจอร์: ระบบจัดการข่าวสารประชาสัมพันธ์ (News & Announcements)

### Task Breakdown & Checklist

- [ ] **Step 1: Database Model & Migration**
  - [ ] 1.1 เพิ่มโมเดล `NewsArticle` และ Enums ใน `prisma/schema.prisma`
  - [ ] 1.2 เพิ่มความสัมพันธ์ในโมเดล `Tenant` (`newsArticles NewsArticle[]`)
  - [ ] 1.3 รันคำสั่ง `npx prisma migrate dev --name add_news_feature` หรือ `prisma db push` / `prisma migrate deploy`
  - [ ] 1.4 รัน `npx prisma generate`

- [ ] **Step 2: Internal Services & Validations**
  - [ ] 2.1 สร้าง Zod validation schemas ใน `src/features/news/_internal/validations.ts`
  - [ ] 2.2 สร้าง Unit Test สำหรับ validation ใน `src/features/news/_internal/validations.test.ts`
  - [ ] 2.3 สร้าง Service functions ใน `src/features/news/_internal/services.ts` (list, get, create, update, delete, togglePin)

- [ ] **Step 3: Server Actions & Central Registration**
  - [ ] 3.1 สร้าง Permissions ใน `src/features/news/permissions.ts`
  - [ ] 3.2 ลงทะเบียนสิทธิ์ใน `src/permissions.ts`
  - [ ] 3.3 สร้างคำแปลสองภาษาใน `src/features/news/messages.ts`
  - [ ] 3.4 ลงทะเบียนคำแปลใน `src/i18n/index.ts`
  - [ ] 3.5 สร้าง Server Actions ใน `src/features/news/_internal/actions.ts`
  - [ ] 3.6 Export Public API ใน `index.ts`, `server.ts`, `actions.ts`

- [ ] **Step 4: UI Development (Portal & Admin)**
  - [ ] 4.1 สร้างหน้า Admin ใน `src/app/(admin)/news/page.tsx` และ Client component
  - [ ] 4.2 สร้างหน้า Public Portal หน้ารวมข่าวใน `src/app/(portal)/news/page.tsx`
  - [ ] 4.3 สร้างหน้ารายละเอียดข่าวใน `src/app/(portal)/news/[slug]/page.tsx`
  - [ ] 4.4 ตรวจสอบการใช้งาน `t("key")` ทุกจุด

- [ ] **Step 5: Quality Gate & Verification**
  - [ ] 5.1 ตรวจสอบ Types: `npm run type-check`
  - [ ] 5.2 ตรวจสอบ Lint & Dependencies: `npm run lint && npm run deps:check`
  - [ ] 5.3 รัน Unit Tests: `npm run test`
  - [ ] 5.4 ทดสอบเปิดใช้งานบนเบราว์เซอร์จริง
