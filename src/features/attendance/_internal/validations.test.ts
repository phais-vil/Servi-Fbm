import { describe, it, expect } from "vitest";
import {
  createSessionSchema,
  checkInSchema,
  updateRecordSchema,
  manualCheckInSchema,
} from "./validations";

describe("attendance validations", () => {
  it("validates create session input", () => {
    const valid = {
      courseCode: "CPE-301",
      courseName: "Software Engineering Principles",
      title: "Lecture 4: Software Architecture & Modular Design",
      roomNumber: "ENG-3401",
      sessionDate: "2026-09-28",
      startTime: "2026-09-28T09:00:00.000Z",
      endTime: "2026-09-28T12:00:00.000Z",
      lateThresholdMinutes: 15,
    };
    const res = createSessionSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("fails if pin is too short", () => {
    const invalid = {
      pin: "12",
      studentCode: "65010042",
      studentName: "นายสมชาย",
    };
    const res = checkInSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("validates student check-in input", () => {
    const valid = {
      pin: "8842",
      studentCode: "65010042",
      studentName: "นายสมชาย รักการเรียน",
    };
    const res = checkInSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates manual check-in schema", () => {
    const valid = {
      sessionId: "123e4567-e89b-12d3-a456-426614174000",
      studentCode: "65010999",
      studentName: "นายวิศวะ ขยันเรียน",
      status: "PRESENT",
      note: "อาจารย์เช็คชื่อให้ในห้อง",
    };
    const res = manualCheckInSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates update record schema", () => {
    const valid = {
      sessionId: "123e4567-e89b-12d3-a456-426614174000",
      recordId: "123e4567-e89b-12d3-a456-426614174001",
      status: "LATE",
      note: "มาสาย 20 นาทีเนื่องจากรถติด",
    };
    const res = updateRecordSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });
});
