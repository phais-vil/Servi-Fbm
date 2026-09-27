import { z } from "zod";

export const deliveryMethods = ["DIGITAL_ONLY", "HARDCOPY_PICKUP", "BOTH"] as const;
export type DeliveryMethodEnum = (typeof deliveryMethods)[number];

export const serviceRequestStatuses = [
  "PENDING",
  "PROCESSING",
  "APPROVED",
  "REJECTED",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
] as const;
export type ServiceRequestStatusEnum = (typeof serviceRequestStatuses)[number];

export const createServiceRequestSchema = z.object({
  serviceTypeId: z.string().uuid("services.validation.serviceTypeRequired"),
  deliveryMethod: z.enum(deliveryMethods).default("DIGITAL_ONLY"),
  studentCode: z.string().min(3, "services.validation.studentCodeMin").max(50),
  studentName: z.string().min(2, "services.validation.studentNameMin").max(255),
  facultyMajor: z.string().min(2, "services.validation.facultyMajorMin").max(255),
  copiesCount: z.number().int().min(1).max(10).default(1),
  reason: z.string().optional().nullable(),
  attachmentUrl: z.string().max(500).optional().nullable(),
});

export const reviewServiceRequestSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["APPROVED", "REJECTED", "READY_FOR_PICKUP", "COMPLETED"]),
  reviewNote: z.string().optional().nullable(),
  pickupLocation: z.string().optional().nullable(),
  pickupDate: z.string().datetime().optional().nullable(),
});

export const verifyCertificateSchema = z.object({
  code: z.string().min(5).max(100),
});

export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
export type ReviewServiceRequestInput = z.infer<typeof reviewServiceRequestSchema>;
export type VerifyCertificateInput = z.infer<typeof verifyCertificateSchema>;
