import { describe, it, expect } from "vitest";
import {
  createServiceRequestSchema,
  reviewServiceRequestSchema,
  verifyCertificateSchema,
} from "./validations";

describe("services validations", () => {
  it("validates valid service request input", () => {
    const valid = {
      serviceTypeId: "123e4567-e89b-12d3-a456-426614174000",
      deliveryMethod: "DIGITAL_ONLY",
      studentCode: "65010042",
      studentName: "สมชาย รักการเรียน",
      facultyMajor: "วิศวกรรมคอมพิวเตอร์",
      copiesCount: 1,
      reason: "ใช้สมัครงาน",
      attachmentUrl: null,
    };
    const res = createServiceRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("fails if studentCode is too short", () => {
    const invalid = {
      serviceTypeId: "123e4567-e89b-12d3-a456-426614174000",
      studentCode: "1",
      studentName: "สมชาย",
      facultyMajor: "CPE",
    };
    const res = createServiceRequestSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates review service request input", () => {
    const valid = {
      requestId: "123e4567-e89b-12d3-a456-426614174001",
      status: "APPROVED",
      reviewNote: "ออกหนังสือรับรองฉบับดิจิทัลเรียบร้อย",
    };
    const res = reviewServiceRequestSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates verify certificate schema", () => {
    const valid = { code: "CERT-202609-0001" };
    const res = verifyCertificateSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});
