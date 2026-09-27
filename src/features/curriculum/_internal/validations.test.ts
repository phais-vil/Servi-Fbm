import { describe, expect, it } from "vitest";
import { createProgramSchema, updateProgramSchema } from "./validations";

describe("Curriculum Validations", () => {
  it("validates valid program input", () => {
    const input = {
      code: "CPE-BENG",
      nameTh: "หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์",
      nameEn: "Bachelor of Engineering Program in Computer Engineering",
      degreeTitleTh: "วศ.บ. (วิศวกรรมคอมพิวเตอร์)",
      degreeTitleEn: "B.Eng. (Computer Engineering)",
      level: "BACHELOR",
      totalCredits: 136,
      durationYears: 4,
      tuitionFeePerTerm: 25000,
      overview: "หลักสูตรมุ่งเน้นการผลิตวิศวกรคอมพิวเตอร์ที่มีความรู้ความสามารถด้าน AI และ Software Systems",
      careerPaths: "Software Engineer, DevOps Engineer, AI Specialist",
      studyPlan: "ปี 1: พื้นฐานวิศวกรรม\nปี 2: โครงสร้างข้อมูลและสถาปัตยกรรม\nปี 3: ระบบคลาวด์และเครือข่าย\nปี 4: โครงงานวิศวกรรม",
      isActive: true,
    };
    const parsed = createProgramSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.code).toBe("CPE-BENG");
      expect(parsed.data.level).toBe("BACHELOR");
      expect(parsed.data.totalCredits).toBe(136);
    }
  });

  it("fails if required fields are missing", () => {
    const input = {
      nameTh: "หลักสูตรวิศวกรรมคอมพิวเตอร์",
    };
    const parsed = createProgramSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates updateProgramSchema with uuid", () => {
    const input = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      code: "CS-BSC",
      nameTh: "วิทยาศาสตรบัณฑิต วิทยาการคอมพิวเตอร์",
      nameEn: "B.Sc. in Computer Science",
      degreeTitleTh: "วท.บ. (วิทยาการคอมพิวเตอร์)",
      degreeTitleEn: "B.Sc. (Computer Science)",
      level: "BACHELOR",
      totalCredits: 128,
      durationYears: 4,
      isActive: true,
    };
    const parsed = updateProgramSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });
});
