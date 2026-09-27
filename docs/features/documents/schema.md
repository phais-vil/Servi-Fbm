# Database Schema: Document & Workflow Management

## Enums

```prisma
enum DocumentType {
  GENERAL
  COURSE_ADD
  LEAVE_ABSENCE
  OVERLOAD_CREDITS
  OTHER
}

enum DocumentStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  REJECTED
  CANCELLED
}

enum ApprovalDecision {
  APPROVED
  REJECTED
  CHANGES_REQUESTED
}
```

## Models

```prisma
model DocumentRequest {
  id            String         @id @default(uuid()) @db.Uuid
  tenantId      String         @map("tenant_id") @db.Uuid
  trackingCode  String         @map("tracking_code") @db.VarChar(50)
  documentType  DocumentType   @default(GENERAL) @map("document_type")
  title         String         @db.VarChar(255)
  reason        String         @db.Text
  formData      Json           @default("{}") @map("form_data") @db.JsonB
  attachmentUrl String?        @map("attachment_url") @db.VarChar(500)
  status        DocumentStatus @default(SUBMITTED)
  currentStep   Int            @default(1) @map("current_step")
  requesterId   String         @map("requester_id") @db.Uuid
  createdAt     DateTime       @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt     DateTime       @updatedAt @map("updated_at") @db.Timestamptz()

  tenant        Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  requester     User               @relation("DocumentRequester", fields: [requesterId], references: [id], onDelete: Cascade)
  approvals     DocumentApproval[]

  @@unique([tenantId, trackingCode])
  @@index([tenantId, status])
  @@index([tenantId, requesterId])
  @@map("document_requests")
}

model DocumentApproval {
  id         String           @id @default(uuid()) @db.Uuid
  tenantId   String           @map("tenant_id") @db.Uuid
  documentId String           @map("document_id") @db.Uuid
  step       Int              @default(1)
  decision   ApprovalDecision
  comment    String?          @db.Text
  reviewerId String           @map("reviewer_id") @db.Uuid
  reviewedAt DateTime         @default(now()) @map("reviewed_at") @db.Timestamptz()

  tenant     Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  document   DocumentRequest  @relation(fields: [documentId], references: [id], onDelete: Cascade)
  reviewer   User             @relation("DocumentReviewer", fields: [reviewerId], references: [id], onDelete: Cascade)

  @@index([tenantId, documentId])
  @@map("document_approvals")
}
```
