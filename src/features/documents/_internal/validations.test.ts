import { describe, expect, it } from "vitest";
import { createDocumentSchema, reviewDocumentSchema } from "./validations";

describe("Document Validations", () => {
  it("validates valid document submission input", () => {
    const input = {
      documentType: "COURSE_ADD",
      title: "ขอเปิดรายวิชาเพิ่ม CPE-491 AI Engineering",
      reason: "ต้องการลงเรียนเพื่อสำเร็จการศึกษาในภาคการศึกษานี้เนื่องจากเป็นวิชาบังคับก่อน",
      formData: { courseCode: "CPE-491", section: "1" },
      attachmentUrl: "https://example.com/receipt.pdf",
    };
    const parsed = createDocumentSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.documentType).toBe("COURSE_ADD");
      expect(parsed.data.title).toBe("ขอเปิดรายวิชาเพิ่ม CPE-491 AI Engineering");
    }
  });

  it("fails if reason is too short", () => {
    const input = {
      documentType: "GENERAL",
      title: "คำร้องทั่วไป",
      reason: "สั้นไป",
    };
    const parsed = createDocumentSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates review decision schema", () => {
    const input = {
      documentId: "123e4567-e89b-12d3-a456-426614174000",
      decision: "APPROVED",
      comment: "อนุมัติเปิดรายวิชาตามที่ขอ",
    };
    const parsed = reviewDocumentSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.decision).toBe("APPROVED");
    }
  });

  it("fails review if invalid decision is provided", () => {
    const input = {
      documentId: "123e4567-e89b-12d3-a456-426614174000",
      decision: "MAYBE",
    };
    const parsed = reviewDocumentSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });
});
