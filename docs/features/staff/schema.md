# Data Model & Validations
## ฟีเจอร์: ระบบจัดการบุคลากร (Staff & Faculty Directory)

### 1. Prisma Schema & Enums

```prisma
enum StaffType {
  ACADEMIC       // สายวิชาการ (คณาจารย์)
  SUPPORT        // สายสนับสนุน
  EXECUTIVE      // ผู้บริหาร
}

model Department {
  id        String         @id @default(uuid()) @db.Uuid
  tenantId  String         @map("tenant_id") @db.Uuid
  code      String         @db.VarChar(50)
  nameTh    String         @map("name_th") @db.VarChar(255)
  nameEn    String         @map("name_en") @db.VarChar(255)
  createdAt DateTime       @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt DateTime       @updatedAt @map("updated_at") @db.Timestamptz()

  tenant    Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  staff     StaffProfile[]

  @@unique([tenantId, code])
  @@map("departments")
}

model StaffProfile {
  id              String       @id @default(uuid()) @db.Uuid
  tenantId        String       @map("tenant_id") @db.Uuid
  userId          String?      @map("user_id") @db.Uuid
  departmentId    String?      @map("department_id") @db.Uuid
  staffType       StaffType    @default(ACADEMIC) @map("staff_type")
  academicTitle   String?      @map("academic_title") @db.VarChar(50)  // ศ., รศ., ผศ., อ., ดร.
  firstNameTh     String       @map("first_name_th") @db.VarChar(100)
  lastNameTh      String       @map("last_name_th") @db.VarChar(100)
  firstNameEn     String       @map("first_name_en") @db.VarChar(100)
  lastNameEn      String       @map("last_name_en") @db.VarChar(100)
  position        String?      @db.VarChar(150)                        // หัวหน้าภาควิชา, อาจารย์ประจำ
  email           String       @db.VarChar(255)
  phone           String?      @db.VarChar(50)
  officeRoom      String?      @map("office_room") @db.VarChar(100)
  avatarUrl       String?      @map("avatar_url") @db.VarChar(500)
  education       String?      @db.Text                                // ประวัติการศึกษา
  expertise       String?      @db.Text                                // ความเชี่ยวชาญ/วิจัย
  orderIndex      Int          @default(0) @map("order_index")
  isActive        Boolean      @default(true) @map("is_active")
  createdAt       DateTime     @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt       DateTime     @updatedAt @map("updated_at") @db.Timestamptz()

  tenant          Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user            User?        @relation(fields: [userId], references: [id], onDelete: SetNull)
  department      Department?  @relation(fields: [departmentId], references: [id], onDelete: SetNull)

  @@index([tenantId, departmentId])
  @@index([tenantId, staffType, isActive])
  @@map("staff_profiles")
}
```

### 2. Zod Validation Schemas (`validations.ts`)
- `createStaffSchema`:
  - `departmentId`: string uuid optional
  - `staffType`: enum (`ACADEMIC`, `SUPPORT`, `EXECUTIVE`) default `ACADEMIC`
  - `academicTitle`: string optional max 50
  - `firstNameTh`: string min 2 max 100
  - `lastNameTh`: string min 2 max 100
  - `firstNameEn`: string min 2 max 100
  - `lastNameEn`: string min 2 max 100
  - `position`: string optional max 150
  - `email`: string email
  - `phone`: string optional max 50
  - `officeRoom`: string optional max 100
  - `avatarUrl`: string url optional
  - `education`: string optional
  - `expertise`: string optional
  - `orderIndex`: number optional default 0
  - `isActive`: boolean optional default true
