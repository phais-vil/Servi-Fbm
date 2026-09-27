import { z } from "zod";

export const documentTypes = [
  "GENERAL",
  "COURSE_ADD",
  "LEAVE_ABSENCE",
  "OVERLOAD_CREDITS",
  "OTHER",
] as const;
export type DocumentTypeEnum = (typeof documentTypes)[number];

export const documentStatuses = [
  "DRAFT",
  "SUBMITTED",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;
export type DocumentStatusEnum = (typeof documentStatuses)[number];

export const approvalDecisions = [
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED",
] as const;
export type ApprovalDecisionEnum = (typeof approvalDecisions)[number];

export const createDocumentSchema = z.object({
  documentType: z.enum(documentTypes).default("GENERAL"),
  title: z.string().min(3, "documents.validation.titleMin").max(255),
  reason: z.string().min(10, "documents.validation.reasonMin"),
  formData: z.record(z.string(), z.any()).optional().default({}),
  attachmentUrl: z.string().max(500).optional().nullable(),
});

export const reviewDocumentSchema = z.object({
  documentId: z.string().uuid(),
  decision: z.enum(approvalDecisions),
  comment: z.string().optional().nullable(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type ReviewDocumentInput = z.infer<typeof reviewDocumentSchema>;
