# Data Model & Validations
## ฟีเจอร์: ระบบจัดการข่าวสารประชาสัมพันธ์ (News & Announcements)

### 1. Prisma Schema & Enums

```prisma
enum NewsCategory {
  ACADEMIC     // ข่าววิชาการ
  EVENT        // ข่าวกิจกรรม
  SCHOLARSHIP  // ข่าวทุนการศึกษา
  GENERAL      // ข่าวประชาสัมพันธ์ทั่วไป
}

enum NewsStatus {
  DRAFT        // ร่าง
  PUBLISHED    // เผยแพร่แล้ว
  ARCHIVED     // จัดเก็บเข้าคลัง/ยกเลิกเผยแพร่
}

model NewsArticle {
  id          String       @id @default(uuid()) @db.Uuid
  tenantId    String       @map("tenant_id") @db.Uuid
  title       String       @db.VarChar(255)
  slug        String       @db.VarChar(255)
  summary     String?      @db.VarChar(500)
  content     String       @db.Text
  coverImage  String?      @map("cover_image") @db.VarChar(500)
  category    NewsCategory @default(GENERAL)
  status      NewsStatus   @default(DRAFT)
  isPinned    Boolean      @default(false) @map("is_pinned")
  viewCount   Int          @default(0) @map("view_count")
  publishedAt DateTime?    @map("published_at") @db.Timestamptz()
  authorId    String?      @map("author_id") @db.Uuid
  createdAt   DateTime     @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt   DateTime     @updatedAt @map("updated_at") @db.Timestamptz()

  tenant      Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  author      User?        @relation(fields: [authorId], references: [id], onDelete: SetNull)

  @@unique([tenantId, slug])
  @@index([tenantId, status, publishedAt])
  @@index([tenantId, isPinned])
  @@map("news_articles")
}
```

### 2. Zod Validation Schemas (`validations.ts`)
- `createNewsSchema`:
  - `title`: string min 3 max 255
  - `slug`: string regex `^[a-z0-9-]+$` optional (หากว่างระบบ gen ให้อัตโนมัติ)
  - `summary`: string optional max 500
  - `content`: string min 10
  - `coverImage`: string url optional
  - `category`: enum (`ACADEMIC`, `EVENT`, `SCHOLARSHIP`, `GENERAL`)
  - `status`: enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
  - `isPinned`: boolean optional default false
- `updateNewsSchema`:
  - `id`: string uuid
  - + ฟิลด์เดียวกับ createNews

### 3. Localization Keys (`messages.ts`)
```ts
export const messages = {
  "news.title": { th: "จัดการข่าวสารประชาสัมพันธ์", en: "News Management" },
  "news.publicTitle": { th: "ข่าวสารและประกาศ", en: "News & Announcements" },
  "news.category.academic": { th: "วิชาการ", en: "Academic" },
  "news.category.event": { th: "กิจกรรม", en: "Events" },
  "news.category.scholarship": { th: "ทุนการศึกษา", en: "Scholarships" },
  "news.category.general": { th: "ทั่วไป", en: "General" },
  "news.status.draft": { th: "ร่าง", en: "Draft" },
  "news.status.published": { th: "เผยแพร่แล้ว", en: "Published" },
  "news.status.archived": { th: "จัดเก็บ", en: "Archived" },
  "news.pinned": { th: "ปักหมุด", en: "Pinned" },
  "news.create": { th: "สร้างข่าวใหม่", en: "Create News" },
  "news.edit": { th: "แก้ไขข่าว", en: "Edit News" },
  "news.delete": { th: "ลบข่าว", en: "Delete News" },
  "news.noArticles": { th: "ยังไม่มีข่าวสารในขณะนี้", en: "No news articles found." },
  "news.readMore": { th: "อ่านต่อ", en: "Read More" },
} as const;
```
