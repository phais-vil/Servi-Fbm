# Agent Guidance: Faculty Meeting Room Booking

## 1. Domain Overview
ระบบจองห้องประชุมประจำคณะ (Faculty Meeting Room Booking) จัดการทรัพยากรห้องประชุมและการจองเวลาใช้งาน:
- ห้องประชุม: `MeetingRoom`
- รายการจอง: `RoomBooking`
- สถานะการจอง: `PENDING` -> `CONFIRMED` | `REJECTED` | `CANCELLED`

## 2. Architecture & File Structure
```text
src/features/rooms/
├── index.ts                     # Public client exports (types, helpers)
├── server.ts                    # Server-only data queries
├── actions.ts                   # Server Actions (bookRoom, updateBookingStatus, createRoom, updateRoom, deleteRoom)
├── permissions.ts               # Permissions (rooms:read, rooms:book, rooms:manage)
├── messages.ts                  # i18n dictionaries
└── _internal/
    ├── validations.ts           # Zod schemas (createRoomSchema, bookRoomSchema, reviewBookingSchema)
    ├── validations.test.ts      # Unit tests
    ├── services.ts              # Business logic, overlap detection & DB queries
    └── types.ts                 # Domain types
```

## 3. UI Routes
- Public/Faculty Portal:
  - `src/app/(portal)/rooms/page.tsx` (Room Directory & Availability Calendar)
  - `src/app/(portal)/rooms/[id]/page.tsx` (Room Details & Booking Form)
- Admin Console:
  - `src/app/(admin)/admin/rooms/page.tsx` (Meeting Rooms & Booking Approval Management)
  - `src/app/(admin)/admin/rooms/_components/room-admin-client.tsx` (Tabs: Room Management / Booking Approval)

## 4. Conflict Prevention Rule
เมื่อมีการร้องขอจองห้อง `checkTimeConflict(roomId, startTime, endTime)`:
`NOT (existing.endTime <= new.startTime OR existing.startTime >= new.endTime)`
ถ้ามีรายการที่สถานะ `CONFIRMED` หรือ `PENDING` ซ้ำซ้อน จะต้อง Reject ทันทีพร้อมแจ้งข้อผิดพลาด
