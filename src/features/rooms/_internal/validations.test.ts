import { describe, expect, it } from "vitest";
import { createRoomSchema, bookRoomSchema, reviewBookingSchema } from "./validations";

describe("Room Booking Validations", () => {
  it("validates valid room creation input", () => {
    const input = {
      code: "ENG-CONF-1",
      nameTh: "ห้องประชุมวิริยะวิจิตร 1",
      nameEn: "Viriya Meeting Hall 1",
      building: "อาคาร 3",
      floor: "ชั้น 4",
      capacity: 30,
      amenities: "Projector, Polycom Video Conference, High-speed Wi-Fi",
      status: "AVAILABLE",
    };
    const parsed = createRoomSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.code).toBe("ENG-CONF-1");
      expect(parsed.data.capacity).toBe(30);
    }
  });

  it("validates valid booking input", () => {
    const input = {
      roomId: "123e4567-e89b-12d3-a456-426614174000",
      title: "การประชุมคณะกรรมการพัฒนาหลักสูตร",
      purpose: "ปรับปรุง มคอ.2 ภาคการศึกษา 1/2569",
      attendeeCount: 15,
      startTime: "2026-10-01T09:00:00.000Z",
      endTime: "2026-10-01T12:00:00.000Z",
    };
    const parsed = bookRoomSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("fails booking if endTime is before startTime", () => {
    const input = {
      roomId: "123e4567-e89b-12d3-a456-426614174000",
      title: "ประชุม",
      startTime: "2026-10-01T12:00:00.000Z",
      endTime: "2026-10-01T09:00:00.000Z",
    };
    const parsed = bookRoomSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates review booking schema", () => {
    const input = {
      bookingId: "123e4567-e89b-12d3-a456-426614174000",
      status: "CONFIRMED",
      reviewNote: "จัดเตรียมอุปกรณ์และแม่บ้านดูแลห้องเรียบร้อย",
    };
    const parsed = reviewBookingSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });
});
