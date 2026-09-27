# Database Schema: Curriculum & Programs

## Enums

```prisma
enum DegreeLevel {
  BACHELOR
  MASTER
  DOCTORAL
  DIPLOMA
}
```

## Models

```prisma
model CurriculumProgram {
  id                String       @id @default(uuid()) @db.Uuid
  tenantId          String       @map("tenant_id") @db.Uuid
  code              String       @db.VarChar(50)
  nameTh            String       @map("name_th") @db.VarChar(255)
  nameEn            String       @map("name_en") @db.VarChar(255)
  degreeTitleTh     String       @map("degree_title_th") @db.VarChar(255)
  degreeTitleEn     String       @map("degree_title_en") @db.VarChar(255)
  level             DegreeLevel  @default(BACHELOR)
  totalCredits      Int          @default(120) @map("total_credits")
  durationYears     Float        @default(4.0) @map("duration_years")
  tuitionFeePerTerm Float?       @map("tuition_fee_per_term")
  overview          String?      @db.Text
  careerPaths       String?      @map("career_paths") @db.Text
  studyPlan         String?      @map("study_plan") @db.Text
  coverImage        String?      @map("cover_image") @db.VarChar(500)
  departmentId      String?      @map("department_id") @db.Uuid
  isActive          Boolean      @default(true) @map("is_active")
  createdAt         DateTime     @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt         DateTime     @updatedAt @map("updated_at") @db.Timestamptz()

  tenant            Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  department        Department?  @relation(fields: [departmentId], references: [id], onDelete: SetNull)

  @@unique([tenantId, code])
  @@index([tenantId, level, isActive])
  @@map("curriculum_programs")
}
```
