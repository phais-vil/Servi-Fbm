import { z } from "zod";

export const sessionStatuses = ["SCHEDULED", "ACTIVE", "CLOSED"] as const;
export type AttendanceSessionStatusEnum = (typeof sessionStatuses)[number];

export const attendanceStatuses = ["PRESENT", "LATE", "ABSENT", "EXCUSED"] as const;
export type AttendanceRecordStatusEnum = (typeof attendanceStatuses)[number];

export const checkInMethods = ["QR", "PIN", "MANUAL"] as const;
export type CheckInMethodEnum = (typeof checkInMethods)[number];

export const createSessionSchema = z.object({
  courseCode: z.string().min(2, "attendance.validation.courseCodeMin").max(50),
  courseName: z.string().min(2, "attendance.validation.courseNameMin").max(255),
  title: z.string().min(2, "attendance.validation.titleMin").max(255),
  roomNumber: z.string().max(50).optional().nullable(),
  sessionDate: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  lateThresholdMinutes: z.number().int().min(0).max(180).default(15),
});

export const checkInSchema = z.object({
  pin: z.string().min(4, "attendance.validation.pinMin").max(10),
  studentCode: z.string().min(3, "attendance.validation.studentCodeMin").max(50),
  studentName: z.string().min(2, "attendance.validation.studentNameMin").max(255),
});

export const updateRecordSchema = z.object({
  sessionId: z.string().uuid(),
  recordId: z.string().uuid(),
  status: z.enum(attendanceStatuses),
  note: z.string().optional().nullable(),
});

export const manualCheckInSchema = z.object({
  sessionId: z.string().uuid(),
  studentCode: z.string().min(3).max(50),
  studentName: z.string().min(2).max(255),
  status: z.enum(attendanceStatuses).default("PRESENT"),
  note: z.string().optional().nullable(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type ManualCheckInInput = z.infer<typeof manualCheckInSchema>;
