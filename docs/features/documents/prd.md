# Product Requirements Document (PRD)
## ระบบบริหารจัดการและอนุมัติเอกสารคำร้อง (Document & Workflow Management)

### 1. วัตถุประสงค์ (Objective)
เพื่อยกระดับกระบวนการบริการงานวิชาการและธุรการของคณะ ให้เป็นระบบดิจิทัลที่ไร้กระดาษ (Paperless) โดยรองรับการยื่นคำร้องของนิสิตและบุคลากรผ่านเว็บ พร้อมระบบติดตามสถานะแบบเรียลไทม์ด้วย Tracking Code และระบบจัดการสายการอนุมัติตามลำดับขั้น (Multi-step Approval Workflow) เพื่อความโปร่งใส รวดเร็ว และตรวจสอบย้อนหลังได้ (Audit Trail)

### 2. กลุ่มผู้ใช้งาน (User Personas & Roles)
1. **ผู้ยื่นคำร้อง (Requester - นักศึกษา / อาจารย์ / บุคลากร):**
   - ยื่นคำร้องออนไลน์ตามประเภทที่ระบบรองรับ (คำร้องทั่วไป, ขอเปิดวิชาเพิ่ม, ขอลาพักการศึกษา, ขอลงทะเบียนเกินกำหนด)
   - แนบไฟล์เอกสารหลักฐาน (เช่น ใบรับรองแพทย์, หนังสือยินยอม)
   - ตรวจสอบสถานะคำร้องของตนเอง หรือค้นหาด้วย Tracking Code
   - ดูประวัติความเห็นและผลการพิจารณาของผู้อนุมัติในแต่ละขั้นตอน
2. **ผู้พิจารณาอนุมัติ (Reviewer / Approver - อาจารย์ที่ปรึกษา / หัวหน้าภาค / คณบดี / เจ้าหน้าที่):**
   - ตรวจสอบรายการคำร้องที่ส่งเข้ามาในกล่องงานรอพิจารณา (Pending Inbox)
   - ดำเนินการอนุมัติ (Approve), ขอให้แก้ไขเพิ่มเติม (Request Changes), หรือไม่อนุมัติ (Reject) พร้อมบันทึกความเห็น
3. **ผู้ดูแลระบบ / เจ้าหน้าที่สารบรรณ (Registrar / Admin):**
   - ดูภาพรวมและค้นหาคำร้องทั้งหมดในระบบ
   - ติดตามระยะเวลาดำเนินการและประวัติการทำงาน (Audit Trail)

### 3. Functional Requirements
- **FR-01 (Online Petition Submission):** รองรับการยื่นคำร้อง 4 หมวดหลัก (GENERAL, COURSE_ADD, LEAVE_ABSENCE, OVERLOAD_CREDITS, OTHER)
- **FR-02 (Unique Tracking Code Generator):** ระบบออกรหัสติดตามคำร้องอัตโนมัติ (เช่น `REQ-2026-0001`) ที่ไม่ซ้ำซ้อนในแต่ละ Tenant
- **FR-03 (Workflow Decision Engine):** ผู้อนุมัติสามารถบันทึกผลการพิจารณา (`APPROVED`, `REJECTED`, `CHANGES_REQUESTED`) พร้อมความเห็นประกอบ
- **FR-04 (Visual Status Timeline):** แสดงขั้นตอนและลำดับการพิจารณาเป็นกราฟิก Timeline ทั้งในหน้า Portal และ Admin
- **FR-05 (Multi-Tenancy & Data Isolation):** ข้อมูลคำร้องต้องแยกตาม `tenantId` อย่างเข้มงวด
- **FR-06 (Audit Logging):** บันทึกการยื่นคำร้องและการพิจารณาอนุมัติลงใน `audit_logs`

### 4. Non-Functional Requirements & Security
- **Security:** ตรวจสอบสิทธิ์การยื่นคำร้อง (`document:create`), การดูคำร้อง (`document:read`), การพิจารณา (`document:review`) และการจัดการ (`document:manage`)
- **i18n:** รองรับภาษาไทยและภาษาอังกฤษอย่างสมบูรณ์
- **Design System:** ยึดตามมาตรฐาน Liyon Design System
