import type { PermissionDef } from "@/shared/lib/permission-def";

export const STAFF_P = {
  staffRead: "staff:read",
  staffManage: "staff:manage",
  staffProfileUpdate: "staff:profile:update",
} as const;

export const STAFF_PERMISSIONS: readonly PermissionDef[] = [
  { code: STAFF_P.staffRead, module: "staff", action: "read", description: "เข้าดูรายชื่อบุคลากรหลังบ้าน" },
  { code: STAFF_P.staffManage, module: "staff", action: "manage", description: "จัดการข้อมูลบุคลากรและภาควิชา" },
  { code: STAFF_P.staffProfileUpdate, module: "staff", action: "profile:update", description: "อัปเดตข้อมูลประวัติตนเอง" },
];
