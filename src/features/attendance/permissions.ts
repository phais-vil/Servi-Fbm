import type { PermissionDef } from "@/shared/lib/permission-def";

export const ATTENDANCE_P = {
  attendanceRead: "attendance:read",
  attendanceCheckin: "attendance:checkin",
  attendanceManage: "attendance:manage",
} as const;

export const ATTENDANCE_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: ATTENDANCE_P.attendanceRead,
    module: "attendance",
    action: "read",
    description: "ดูประวัติและสรุปการเข้าเรียน",
  },
  {
    code: ATTENDANCE_P.attendanceCheckin,
    module: "attendance",
    action: "checkin",
    description: "บันทึกเวลาเข้าเรียน (Check-in)",
  },
  {
    code: ATTENDANCE_P.attendanceManage,
    module: "attendance",
    action: "manage",
    description: "จัดการคาบเรียน ฉายจอ QR และเช็คชื่อนิสิต",
  },
];
