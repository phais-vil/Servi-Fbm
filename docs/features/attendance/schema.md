# Data Schema: Classroom & Activity Attendance Tracking

## 1. Prisma Enums & Models

```prisma
enum AttendanceSessionStatus {
  SCHEDULED
  ACTIVE
  CLOSED
}

enum AttendanceRecordStatus {
  PRESENT
  LATE
  ABSENT
  EXCUSED
}

enum CheckInMethod {
  QR
  PIN
  MANUAL
}

model AttendanceSession {
  id                   String                  @id @default(uuid()) @db.Uuid
  tenantId             String                  @map("tenant_id") @db.Uuid
  courseCode           String                  @map("course_code") @db.VarChar(50)
  courseName           String                  @map("course_name") @db.VarChar(255)
  title                String                  @db.VarChar(255)
  roomNumber           String?                 @map("room_number") @db.VarChar(50)
  lecturerId           String                  @map("lecturer_id") @db.Uuid
  sessionDate          DateTime                @map("session_date") @db.Date
  startTime            DateTime                @map("start_time")
  endTime              DateTime                @map("end_time")
  checkInPin           String                  @map("check_in_pin") @db.VarChar(10)
  qrToken              String?                 @map("qr_token") @db.VarChar(100)
  lateThresholdMinutes Int                     @default(15) @map("late_threshold_minutes")
  status               AttendanceSessionStatus @default(SCHEDULED)
  createdAt            DateTime                @default(now()) @map("created_at")
  updatedAt            DateTime                @updatedAt @map("updated_at")

  tenant               Tenant                  @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  lecturer             User                    @relation(fields: [lecturerId], references: [id])
  records              AttendanceRecord[]

  @@index([tenantId, sessionDate])
  @@index([tenantId, courseCode])
  @@map("attendance_sessions")
}

model AttendanceRecord {
  id           String                 @id @default(uuid()) @db.Uuid
  tenantId     String                 @map("tenant_id") @db.Uuid
  sessionId    String                 @map("session_id") @db.Uuid
  studentId    String                 @map("student_id") @db.Uuid
  studentName  String                 @map("student_name") @db.VarChar(255)
  studentCode  String                 @map("student_code") @db.VarChar(50)
  checkInTime  DateTime               @default(now()) @map("check_in_time")
  status       AttendanceRecordStatus @default(PRESENT)
  method       CheckInMethod          @default(PIN)
  note         String?                @db.Text
  createdAt    DateTime               @default(now()) @map("created_at")
  updatedAt    DateTime               @updatedAt @map("updated_at")

  tenant       Tenant                 @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  session      AttendanceSession      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  student      User                   @relation(fields: [studentId], references: [id])

  @@unique([sessionId, studentId])
  @@index([tenantId, studentId])
  @@map("attendance_records")
}
```
