import type { PermissionDef } from "@/shared/lib/permission-def";

export const SERVICES_P = {
  servicesRead: "services:read",
  servicesRequest: "services:request",
  servicesManage: "services:manage",
} as const;

export const SERVICES_PERMISSIONS: readonly PermissionDef[] = [
  {
    code: SERVICES_P.servicesRead,
    module: "services",
    action: "read",
    description: "ดูรายการบริการและหนังสือรับรอง",
  },
  {
    code: SERVICES_P.servicesRequest,
    module: "services",
    action: "request",
    description: "ยื่นคำขอรับบริการและหนังสือรับรอง",
  },
  {
    code: SERVICES_P.servicesManage,
    module: "services",
    action: "manage",
    description: "จัดการบริการ อนุมัติ และออกหนังสือรับรอง",
  },
];
