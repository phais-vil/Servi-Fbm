import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateDocumentInput, ReviewDocumentInput } from "./validations";
import type { Prisma, DocumentRequest, DocumentApproval, User } from "@/generated/prisma";

export interface DocumentApprovalDto {
  id: string;
  step: number;
  decision: string;
  comment: string | null;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail: string;
  reviewedAt: string;
}

export interface DocumentRequestDto {
  id: string;
  tenantId: string;
  trackingCode: string;
  documentType: string;
  title: string;
  reason: string;
  formData: Record<string, unknown>;
  attachmentUrl: string | null;
  status: string;
  currentStep: number;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  approvals: DocumentApprovalDto[];
  createdAt: string;
  updatedAt: string;
}

export async function resolvePublicTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return tenant?.id ?? "";
}

function mapDocumentRow(
  row: DocumentRequest & {
    requester: Pick<User, "name" | "email">;
    approvals?: (DocumentApproval & { reviewer: Pick<User, "name" | "email"> })[];
  }
): DocumentRequestDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    trackingCode: row.trackingCode,
    documentType: row.documentType,
    title: row.title,
    reason: row.reason,
    formData: (row.formData as Record<string, unknown>) ?? {},
    attachmentUrl: row.attachmentUrl,
    status: row.status,
    currentStep: row.currentStep,
    requesterId: row.requesterId,
    requesterName: row.requester?.name ?? "Unknown",
    requesterEmail: row.requester?.email ?? "",
    approvals: (row.approvals ?? []).map((app) => ({
      id: app.id,
      step: app.step,
      decision: app.decision,
      comment: app.comment,
      reviewerId: app.reviewerId,
      reviewerName: app.reviewer?.name ?? "Reviewer",
      reviewerEmail: app.reviewer?.email ?? "",
      reviewedAt: app.reviewedAt.toISOString(),
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function generateTrackingCode(tenantId: string): Promise<string> {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `REQ-${yearMonth}-`;

  const count = await prisma.documentRequest.count({
    where: {
      tenantId,
      trackingCode: { startsWith: prefix },
    },
  });

  const nextSeq = String(count + 1).padStart(4, "0");
  return `${prefix}${nextSeq}`;
}

export async function listDocumentRequests(
  tenantId: string,
  options?: {
    requesterId?: string;
    status?: string;
    type?: string;
    search?: string;
  }
): Promise<DocumentRequestDto[]> {
  const where: Prisma.DocumentRequestWhereInput = { tenantId };

  if (options?.requesterId) {
    where.requesterId = options.requesterId;
  }
  if (options?.status && options.status !== "ALL") {
    where.status = options.status as Prisma.EnumDocumentStatusFilter;
  }
  if (options?.type && options.type !== "ALL") {
    where.documentType = options.type as Prisma.EnumDocumentTypeFilter;
  }
  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { trackingCode: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { reason: { contains: q, mode: "insensitive" } },
      { requester: { name: { contains: q, mode: "insensitive" } } },
      { requester: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const items = await prisma.documentRequest.findMany({
    where,
    include: {
      requester: { select: { name: true, email: true } },
      approvals: {
        include: { reviewer: { select: { name: true, email: true } } },
        orderBy: { reviewedAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map(mapDocumentRow);
}

export async function getDocumentByTrackingCode(
  tenantId: string,
  trackingCode: string
): Promise<DocumentRequestDto | null> {
  const item = await prisma.documentRequest.findFirst({
    where: { tenantId, trackingCode },
    include: {
      requester: { select: { name: true, email: true } },
      approvals: {
        include: { reviewer: { select: { name: true, email: true } } },
        orderBy: { reviewedAt: "asc" },
      },
    },
  });

  if (!item) return null;
  return mapDocumentRow(item);
}

export async function getDocumentById(
  tenantId: string,
  id: string
): Promise<DocumentRequestDto | null> {
  const item = await prisma.documentRequest.findFirst({
    where: { tenantId, id },
    include: {
      requester: { select: { name: true, email: true } },
      approvals: {
        include: { reviewer: { select: { name: true, email: true } } },
        orderBy: { reviewedAt: "asc" },
      },
    },
  });

  if (!item) return null;
  return mapDocumentRow(item);
}

export async function createDocumentRequest(
  tenantId: string,
  requesterId: string,
  input: CreateDocumentInput
): Promise<DocumentRequestDto> {
  const trackingCode = await generateTrackingCode(tenantId);

  const created = await prisma.documentRequest.create({
    data: {
      tenantId,
      requesterId,
      trackingCode,
      documentType: input.documentType,
      title: input.title,
      reason: input.reason,
      formData: (input.formData as Prisma.InputJsonValue) ?? {},
      attachmentUrl: input.attachmentUrl ?? null,
      status: "SUBMITTED",
      currentStep: 1,
    },
    include: {
      requester: { select: { name: true, email: true } },
      approvals: {
        include: { reviewer: { select: { name: true, email: true } } },
      },
    },
  });

  return mapDocumentRow(created);
}

export async function reviewDocumentRequest(
  tenantId: string,
  reviewerId: string,
  input: ReviewDocumentInput
): Promise<DocumentRequestDto> {
  const doc = await prisma.documentRequest.findFirst({
    where: { tenantId, id: input.documentId },
  });

  if (!doc) {
    throw new Error("Document request not found");
  }

  // Determine next status based on decision
  let nextStatus: "APPROVED" | "REJECTED" | "IN_REVIEW" = "IN_REVIEW";
  if (input.decision === "APPROVED") {
    nextStatus = "APPROVED";
  } else if (input.decision === "REJECTED") {
    nextStatus = "REJECTED";
  } else if (input.decision === "CHANGES_REQUESTED") {
    nextStatus = "IN_REVIEW";
  }

  // Transaction: add approval record and update request status
  const updated = await prisma.$transaction(async (tx) => {
    await tx.documentApproval.create({
      data: {
        tenantId,
        documentId: input.documentId,
        reviewerId,
        step: doc.currentStep,
        decision: input.decision,
        comment: input.comment ?? null,
      },
    });

    return tx.documentRequest.update({
      where: { id: input.documentId },
      data: {
        status: nextStatus,
        currentStep: doc.currentStep + 1,
      },
      include: {
        requester: { select: { name: true, email: true } },
        approvals: {
          include: { reviewer: { select: { name: true, email: true } } },
          orderBy: { reviewedAt: "asc" },
        },
      },
    });
  });

  return mapDocumentRow(updated);
}

export async function cancelDocumentRequest(
  tenantId: string,
  requesterId: string,
  id: string
): Promise<void> {
  await prisma.documentRequest.updateMany({
    where: {
      id,
      tenantId,
      requesterId,
      status: { in: ["SUBMITTED", "IN_REVIEW"] },
    },
    data: {
      status: "CANCELLED",
    },
  });
}
