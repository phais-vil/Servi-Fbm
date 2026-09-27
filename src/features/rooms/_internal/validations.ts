import { z } from "zod";

export const roomStatuses = ["AVAILABLE", "MAINTENANCE", "CLOSED"] as const;
export type RoomStatusEnum = (typeof roomStatuses)[number];

export const bookingStatuses = [
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
] as const;
export type BookingStatusEnum = (typeof bookingStatuses)[number];

export const createRoomSchema = z.object({
  code: z.string().min(2, "rooms.validation.codeMin").max(50),
  nameTh: z.string().min(2, "rooms.validation.nameThMin").max(255),
  nameEn: z.string().min(2, "rooms.validation.nameEnMin").max(255),
  building: z.string().min(1, "rooms.validation.buildingReq").max(100),
  floor: z.string().min(1, "rooms.validation.floorReq").max(50),
  capacity: z.number().int().min(1, "rooms.validation.capacityMin").default(20),
  amenities: z.string().optional().nullable(),
  coverImage: z.string().max(500).optional().nullable(),
  status: z.enum(roomStatuses).default("AVAILABLE"),
});

export const updateRoomSchema = createRoomSchema.extend({
  id: z.string().uuid(),
});

export const bookRoomSchema = z
  .object({
    roomId: z.string().uuid(),
    title: z.string().min(3, "rooms.validation.titleMin").max(255),
    purpose: z.string().optional().nullable(),
    attendeeCount: z.number().int().min(1).default(1),
    equipmentRequested: z.string().optional().nullable(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "rooms.validation.timeRangeInvalid",
    path: ["endTime"],
  });

export const reviewBookingSchema = z.object({
  bookingId: z.string().uuid(),
  status: z.enum(["CONFIRMED", "REJECTED"]),
  reviewNote: z.string().optional().nullable(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type BookRoomInput = z.infer<typeof bookRoomSchema>;
export type ReviewBookingInput = z.infer<typeof reviewBookingSchema>;
