# Product Requirements Document (PRD): Student Services & Credential Verification

## 1. Executive Summary & Objective
The **Student Services & Credential Verification System (ระบบการบริการนิสิตและหนังสือรับรอง)** provides a centralized digital gateway for students of the Faculty to request academic certificates, conduct endorsements, and student status documents. 

It provides a hybrid delivery model:
1. **Verifiable Digital Credentials:** Generates secure certificates with tamper-resistant verification codes (`CERT-YYYYMM-XXXX`) and QR codes that anyone (employers, embassies, scholarship funds) can scan and instantly verify on the public verification portal (`/verify/[code]`).
2. **Hardcopy Counter Pickup:** Enables students to schedule physical document pickups with official faculty wax/embossed seals at the student affairs office.

---

## 2. User Personas & Roles

| Persona | Role | Key Responsibilities / Workflows |
|---|---|---|
| **Student / Requester** | `authenticated user` | Browses service catalog, submits certificate request, selects delivery method (Digital / Hardcopy / Both), tracks real-time progress, downloads issued e-certificate. |
| **Faculty Registrar / Student Affairs Officer** | `services:manage` | Reviews applications, inspects attached eligibility proofs, issues digital certificates with verification hashes, marks hardcopies ready for pickup. |
| **External Verifier (Employer / Embassy / Public)** | `public / guest` | Scans QR code or visits `/verify/[code]` to verify authenticity, validity status, and issue timestamp of a certificate without logging in. |

---

## 3. Functional Requirements

### 3.1 Service Catalog
- Pre-configured catalog of certificate types:
  - `CERT_STUDENT_STATUS`: หนังสือรับรองสถานภาพการเป็นนิสิต (TH/EN)
  - `CERT_ACADEMIC_RECORD`: หนังสือรับรองผลการเรียนและการจัดอันดับ
  - `CERT_GOOD_CONDUCT`: หนังสือรับรองความประพฤติ
  - `CERT_INTERNSHIP`: หนังสือขอความอนุเคราะห์ฝึกงาน / สหกิจศึกษา
  - `CERT_GRADUATION_CANDIDATE`: หนังสือรับรองว่าคาดว่าจะสำเร็จการศึกษา

### 3.2 Certificate Issuance & Verification
- **Unique Verification Code:** Format `CERT-YYYYMM-XXXX` (e.g. `CERT-202609-0042`).
- **Cryptographic Verification Hash:** SHA-256 hash verifying the student's name, student code, certificate type, issue date, and issuing authority.
- **Public Verification Endpoint:** `/verify/[code]` rendering:
  - Official faculty crest and certification badge (`VERIFIED` / `EXPIRED` / `REVOKED`)
  - Recipient full name (masked slightly for privacy if needed)
  - Degree & Curriculum
  - Date of issue & Expiration date
  - Issuing Officer Name & Title

### 3.3 Hybrid Delivery Tracking
- Digital delivery: instant PDF download link on portal once approved.
- Hardcopy delivery: status progression (`PENDING` -> `PROCESSING` -> `READY_FOR_PICKUP` -> `COMPLETED`). Notification of counter location and operating hours.

---

## 4. Acceptance Criteria
1. Unauthenticated users can view service catalog and verify authentic certificates via `/verify/[code]`.
2. Authenticated students can submit requests with delivery preferences.
3. Officers with `services:manage` can review, approve, reject, or mark requests ready for pickup.
4. All database queries isolate data by `tenantId`.
5. Passes 100% of VibeCore quality gates (`npm run check`).
