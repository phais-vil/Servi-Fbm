# Data Schema & Validations: Student Services & Credential Verification

## 1. Prisma Enums & Models

```prisma
enum ServiceCategory {
  ACADEMIC_CERT
  STUDENT_STATUS
  CONDUCT
  INTERNSHIP
  OTHER
}

enum DeliveryMethod {
  DIGITAL_ONLY
  HARDCOPY_PICKUP
  BOTH
}

enum ServiceRequestStatus {
  PENDING
  PROCESSING
  APPROVED
  REJECTED
  READY_FOR_PICKUP
  COMPLETED
  CANCELLED
}

model ServiceType {
  id              String          @id @default(uuid()) @db.Uuid
  tenantId        String          @map("tenant_id") @db.Uuid
  code            String          @db.VarChar(50)
  category        ServiceCategory @default(ACADEMIC_CERT)
  nameTh          String          @map("name_th") @db.VarChar(255)
  nameEn          String          @map("name_en") @db.VarChar(255)
  description     String?         @db.Text
  fee             Decimal         @default(0) @db.Decimal(10, 2)
  processingDays  Int             @default(3) @map("processing_days")
  requiredDocs    String?         @map("required_docs") @db.Text
  isActive        Boolean         @default(true) @map("is_active")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  tenant          Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  requests        ServiceRequest[]

  @@unique([tenantId, code])
  @@map("service_types")
}

model ServiceRequest {
  id                String               @id @default(uuid()) @db.Uuid
  tenantId          String               @map("tenant_id") @db.Uuid
  serviceTypeId     String               @map("service_type_id") @db.Uuid
  requesterId       String               @map("requester_id") @db.Uuid
  trackingCode      String               @unique @map("tracking_code") @db.VarChar(50)
  deliveryMethod    DeliveryMethod       @default(DIGITAL_ONLY) @map("delivery_method")
  status            ServiceRequestStatus @default(PENDING)
  studentCode       String               @map("student_code") @db.VarChar(50)
  studentName       String               @map("student_name") @db.VarChar(255)
  facultyMajor      String               @map("faculty_major") @db.VarChar(255)
  reason            String?              @db.Text
  attachmentUrl     String?              @map("attachment_url") @db.VarChar(500)
  copiesCount       Int                  @default(1) @map("copies_count")
  
  // Certificate / Credential Issuance Fields
  certificateNumber String?              @unique @map("certificate_number") @db.VarChar(100)
  verificationHash  String?              @map("verification_hash") @db.VarChar(255)
  issuedAt          DateTime?            @map("issued_at")
  expiresAt         DateTime?            @map("expires_at")
  issuerName        String?              @map("issuer_name") @db.VarChar(255)
  
  // Hardcopy Pickup Fields
  pickupDate        DateTime?            @map("pickup_date")
  pickupLocation    String?              @map("pickup_location") @db.VarChar(255)
  
  reviewNote        String?              @map("review_note") @db.Text
  createdAt         DateTime             @default(now()) @map("created_at")
  updatedAt         DateTime             @updatedAt @map("updated_at")

  tenant            Tenant               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  serviceType       ServiceType          @relation(fields: [serviceTypeId], references: [id])
  requester         User                 @relation(fields: [requesterId], references: [id])

  @@index([tenantId, status])
  @@index([requesterId])
  @@map("service_requests")
}
```

## 2. Validation Rules (Zod)
- `createServiceRequestSchema`:
  - `serviceTypeId`: UUID
  - `deliveryMethod`: enum (`DIGITAL_ONLY`, `HARDCOPY_PICKUP`, `BOTH`)
  - `studentCode`: string (min 3)
  - `studentName`: string (min 2)
  - `facultyMajor`: string (min 2)
  - `copiesCount`: int min 1 max 10
  - `reason`: string optional
  - `attachmentUrl`: string url optional
- `reviewServiceRequestSchema`:
  - `requestId`: UUID
  - `status`: enum (`APPROVED`, `REJECTED`, `READY_FOR_PICKUP`, `COMPLETED`)
  - `reviewNote`: string optional
  - `pickupLocation`: string optional
