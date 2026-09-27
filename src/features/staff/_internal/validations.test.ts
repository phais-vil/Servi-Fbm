import { describe, expect, it } from "vitest";
import { createStaffSchema, createDepartmentSchema } from "./validations";

describe("Staff Validations", () => {
  it("validates valid staff input", () => {
    const input = {
      academicTitle: "ผศ.ดร.",
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      firstNameEn: "Somchai",
      lastNameEn: "Jaidee",
      email: "somchai@faculty.ac.th",
      staffType: "ACADEMIC",
      position: "อาจารย์ประจำภาควิชา",
      officeRoom: "EN-401",
      orderIndex: 1,
      isActive: true,
    };
    const parsed = createStaffSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.firstNameTh).toBe("สมชาย");
      expect(parsed.data.staffType).toBe("ACADEMIC");
    }
  });

  it("fails if email is invalid", () => {
    const input = {
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      firstNameEn: "Somchai",
      lastNameEn: "Jaidee",
      email: "not-an-email",
    };
    const parsed = createStaffSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates department schema", () => {
    const input = {
      code: "CPE",
      nameTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
      nameEn: "Department of Computer Engineering",
    };
    const parsed = createDepartmentSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });
});
