import type { PermissionDef } from "@/shared/lib/permission-def";

export const NEWS_P = {
  newsRead: "news:read",
  newsManage: "news:manage",
  newsPublish: "news:publish",
  newsDelete: "news:delete",
} as const;

export const NEWS_PERMISSIONS: readonly PermissionDef[] = [
  { code: NEWS_P.newsRead, module: "news", action: "read", description: "เข้าดูและอ่านข่าวสาร" },
  { code: NEWS_P.newsManage, module: "news", action: "manage", description: "สร้างและแก้ไขข่าวสาร" },
  { code: NEWS_P.newsPublish, module: "news", action: "publish", description: "เผยแพร่และปักหมุดข่าวสาร" },
  { code: NEWS_P.newsDelete, module: "news", action: "delete", description: "ลบข่าวสาร" },
];
