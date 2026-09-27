# Database Schema: Faculty Meeting Room Booking

## Enums

```prisma
enum RoomStatus {
  AVAILABLE
  MAINTENANCE
  CLOSED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  REJECTED
  CANCELLED
}
```

## Models

```prisma
model MeetingRoom {
  id          String        @id @default(uuid()) @db.Uuid
  tenantId    String        @map("tenant_id") @db.Uuid
  code        String        @db.VarChar(50)
  nameTh      String        @map("name_th") @db.VarChar(255)
  nameEn      String        @map("name_en") @db.VarChar(255)
  building    String        @db.VarChar(100)
  floor       String        @db.VarChar(50)
  capacity    Int           @default(20)
  amenities   String?       @db.Text
  coverImage  String?       @map("cover_image") @db.VarChar(500)
  status      RoomStatus    @default(AVAILABLE)
  createdAt   DateTime      @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime      @updatedAt @map("updated_at") @db.Timestamptz()

  tenant      Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  bookings    RoomBooking[]

  @@unique([tenantId, code])
  @@index([tenantId, status])
  @@map("meeting_rooms")
}

model RoomBooking {
  id                 String        @id @default(uuid()) @db.Uuid
  tenantId           String        @map("tenant_id") @db.Uuid
  roomId             String        @map("room_id") @db.Uuid
  bookedById         String        @map("booked_by_id") @db.Uuid
  title              String        @db.VarChar(255)
  purpose            String?       @db.Text
  attendeeCount      Int           @default(1) @map("attendee_count")
  equipmentRequested String?       @map("equipment_requested") @db.Text
  startTime          DateTime      @map("start_time") @db.Timestamptz()
  endTime            DateTime      @map("end_time") @db.Timestamptz()
  status             BookingStatus @default(PENDING)
  reviewNote         String?       @map("review_note") @db.Text
  createdAt          DateTime      @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt          DateTime      @updatedAt @map("updated_at") @db.Timestamptz()

  tenant             Tenant        @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  room               MeetingRoom   @relation(fields: [roomId], references: [id], onDelete: Cascade)
  bookedBy           User          @relation("RoomBooker", fields: [bookedById], references: [id], onDelete: Cascade)

  @@index([tenantId, roomId, startTime, endTime])
  @@index([tenantId, bookedById])
  @@index([tenantId, status])
  @@map("room_bookings")
}
```
