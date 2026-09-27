import type { PermissionDef } from "@/shared/lib/permission-def";

export const DOCUMENT_P = {
  documentCreate: "document:create",
  documentRead: "document:read",
  documentReview: "document:review",
  documentManage: "document:manage",
} as const;

export const DOCUMENT_PERMISSIONS: readonly PermissionDef[] = [
  { code: DOCUMENT_P.documentCreate, module: "document", action: "create", description: "ยื่นคำร้องออนไลน์" },
  { code: DOCUMENT_P.documentRead, module: "document", action: "read", description: "ดูรายการคำร้องของตนเอง" },
  { code: DOCUMENT_P.documentReview, module: "document", action: "review", description: "พิจารณาอนุมัติ/ไม่อนุมัติคำร้อง" },
  { code: DOCUMENT_P.documentManage, module: "document", action: "manage", description: "บริหารจัดการระบบคำร้องทั้งหมด" },
];
