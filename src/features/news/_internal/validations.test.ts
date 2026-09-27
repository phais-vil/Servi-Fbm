import { describe, expect, it } from "vitest";
import { createNewsSchema, updateNewsSchema } from "./validations";

describe("News Validations", () => {
  it("validates valid create news input", () => {
    const input = {
      title: "ประกาศรับสมัครทุนการศึกษา ประจำปี 2569",
      summary: "ทุนการศึกษาสำหรับนิสิตระดับปริญญาตรี",
      content: "รายละเอียดทุนการศึกษาและเงื่อนไขการรับสมัคร...",
      category: "SCHOLARSHIP",
      status: "PUBLISHED",
      isPinned: true,
    };
    const parsed = createNewsSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title).toBe(input.title);
      expect(parsed.data.category).toBe("SCHOLARSHIP");
      expect(parsed.data.isPinned).toBe(true);
    }
  });

  it("fails if title is too short", () => {
    const input = {
      title: "ab",
      content: "เนื้อหาข่าวสารประชาสัมพันธ์...",
    };
    const parsed = createNewsSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates update news with valid UUID", () => {
    const input = {
      id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      title: "อัปเดตข่าวสารวิชาการ",
      content: "เนื้อหาข่าวสารฉบับปรับปรุงใหม่",
      category: "ACADEMIC",
      status: "DRAFT",
      isPinned: false,
    };
    const parsed = updateNewsSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });
});
