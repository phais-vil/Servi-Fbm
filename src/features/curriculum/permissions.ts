import type { PermissionDef } from "@/shared/lib/permission-def";

export const CURRICULUM_P = {
  curriculumRead: "curriculum:read",
  curriculumManage: "curriculum:manage",
} as const;

export const CURRICULUM_PERMISSIONS: readonly PermissionDef[] = [
  { code: CURRICULUM_P.curriculumRead, module: "curriculum", action: "read", description: "เข้าดูรายการหลักสูตรหลังบ้าน" },
  { code: CURRICULUM_P.curriculumManage, module: "curriculum", action: "manage", description: "จัดการเพิ่ม ลบ แก้ไข ข้อมูลหลักสูตร" },
];
