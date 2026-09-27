import { createHash } from "crypto";
import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateServiceRequestInput,
  ReviewServiceRequestInput,
} from "./validations";
import type { Prisma, ServiceType, ServiceRequest, User } from "@/generated/prisma";

export interface ServiceTypeDto {
  id: string;
  tenantId: string;
  code: string;
  category: string;
  nameTh: string;
  nameEn: string;
  description: string | null;
  fee: number;
  processingDays: number;
  requiredDocs: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestDto {
  id: string;
  tenantId: string;
  serviceTypeId: string;
  serviceTypeCode?: string;
  serviceTypeNameTh?: string;
  serviceTypeNameEn?: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  trackingCode: string;
  deliveryMethod: string;
  status: string;
  studentCode: string;
  studentName: string;
  facultyMajor: string;
  reason: string | null;
  attachmentUrl: string | null;
  copiesCount: number;
  certificateNumber: string | null;
  verificationHash: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  issuerName: string | null;
  pickupDate: string | null;
  pickupLocation: string | null;
  reviewNote: string | null;
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

function mapTypeRow(row: ServiceType): ServiceTypeDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    code: row.code,
    category: row.category,
    nameTh: row.nameTh,
    nameEn: row.nameEn,
    description: row.description,
    fee: Number(row.fee),
    processingDays: row.processingDays,
    requiredDocs: row.requiredDocs,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapRequestRow(
  row: ServiceRequest & {
    serviceType?: Pick<ServiceType, "code" | "nameTh" | "nameEn">;
    requester: Pick<User, "name" | "email">;
  }
): ServiceRequestDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    serviceTypeId: row.serviceTypeId,
    serviceTypeCode: row.serviceType?.code,
    serviceTypeNameTh: row.serviceType?.nameTh,
    serviceTypeNameEn: row.serviceType?.nameEn,
    requesterId: row.requesterId,
    requesterName: row.requester.name,
    requesterEmail: row.requester.email,
    trackingCode: row.trackingCode,
    deliveryMethod: row.deliveryMethod,
    status: row.status,
    studentCode: row.studentCode,
    studentName: row.studentName,
    facultyMajor: row.facultyMajor,
    reason: row.reason,
    attachmentUrl: row.attachmentUrl,
    copiesCount: row.copiesCount,
    certificateNumber: row.certificateNumber,
    verificationHash: row.verificationHash,
    issuedAt: row.issuedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    issuerName: row.issuerName,
    pickupDate: row.pickupDate?.toISOString() ?? null,
    pickupLocation: row.pickupLocation,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listServiceTypes(tenantId: string): Promise<ServiceTypeDto[]> {
  const items = await prisma.serviceType.findMany({
    where: { tenantId, isActive: true },
    orderBy: { code: "asc" },
  });
  return items.map(mapTypeRow);
}

export async function listServiceRequests(
  tenantId: string,
  options?: { requesterId?: string; status?: string; search?: string }
): Promise<ServiceRequestDto[]> {
  const where: Prisma.ServiceRequestWhereInput = { tenantId };

  if (options?.requesterId) {
    where.requesterId = options.requesterId;
  }
  if (options?.status && options.status !== "ALL") {
    where.status = options.status as Prisma.EnumServiceRequestStatusFilter;
  }
  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { trackingCode: { contains: q, mode: "insensitive" } },
      { studentCode: { contains: q, mode: "insensitive" } },
      { studentName: { contains: q, mode: "insensitive" } },
      { certificateNumber: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.serviceRequest.findMany({
    where,
    include: {
      serviceType: { select: { code: true, nameTh: true, nameEn: true } },
      requester: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map(mapRequestRow);
}

export async function getServiceRequestById(
  tenantId: string,
  id: string
): Promise<ServiceRequestDto | null> {
  const item = await prisma.serviceRequest.findFirst({
    where: { tenantId, id },
    include: {
      serviceType: { select: { code: true, nameTh: true, nameEn: true } },
      requester: { select: { name: true, email: true } },
    },
  });
  if (!item) return null;
  return mapRequestRow(item);
}

export async function verifyCertificateByCode(
  tenantId: string,
  code: string
): Promise<ServiceRequestDto | null> {
  const item = await prisma.serviceRequest.findFirst({
    where: {
      tenantId,
      OR: [
        { certificateNumber: { equals: code.trim(), mode: "insensitive" } },
        { trackingCode: { equals: code.trim(), mode: "insensitive" } },
      ],
      status: { in: ["APPROVED", "READY_FOR_PICKUP", "COMPLETED"] },
    },
    include: {
      serviceType: { select: { code: true, nameTh: true, nameEn: true } },
      requester: { select: { name: true, email: true } },
    },
  });
  if (!item) return null;
  return mapRequestRow(item);
}

async function generateTrackingCode(tenantId: string): Promise<string> {
  const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
  const count = await prisma.serviceRequest.count({
    where: { tenantId, trackingCode: { startsWith: `SR-${yearMonth}` } },
  });
  const seq = String(count + 1).padStart(4, "0");
  return `SR-${yearMonth}-${seq}`;
}

async function generateCertificateNumber(tenantId: string): Promise<string> {
  const yearMonth = new Date().toISOString().slice(0, 7).replace("-", "");
  const count = await prisma.serviceRequest.count({
    where: { tenantId, certificateNumber: { startsWith: `CERT-${yearMonth}` } },
  });
  const seq = String(count + 1).padStart(4, "0");
  return `CERT-${yearMonth}-${seq}`;
}

export async function createServiceRequest(
  tenantId: string,
  requesterId: string,
  input: CreateServiceRequestInput
): Promise<ServiceRequestDto> {
  const trackingCode = await generateTrackingCode(tenantId);

  const created = await prisma.serviceRequest.create({
    data: {
      tenantId,
      requesterId,
      serviceTypeId: input.serviceTypeId,
      trackingCode,
      deliveryMethod: input.deliveryMethod,
      studentCode: input.studentCode,
      studentName: input.studentName,
      facultyMajor: input.facultyMajor,
      reason: input.reason ?? null,
      attachmentUrl: input.attachmentUrl ?? null,
      copiesCount: input.copiesCount,
      status: "PENDING",
    },
    include: {
      serviceType: { select: { code: true, nameTh: true, nameEn: true } },
      requester: { select: { name: true, email: true } },
    },
  });

  return mapRequestRow(created);
}

export async function reviewServiceRequest(
  tenantId: string,
  reviewerId: string,
  input: ReviewServiceRequestInput
): Promise<ServiceRequestDto> {
  const existing = await prisma.serviceRequest.findFirst({
    where: { id: input.requestId, tenantId },
    include: { serviceType: true },
  });
  if (!existing) {
    throw new Error("Service request not found");
  }

  const reviewer = await prisma.user.findUnique({
    where: { id: reviewerId },
    select: { name: true },
  });

  const updateData: Prisma.ServiceRequestUpdateInput = {
    status: input.status,
    reviewNote: input.reviewNote ?? null,
  };

  if (input.pickupLocation) {
    updateData.pickupLocation = input.pickupLocation;
  }
  if (input.pickupDate) {
    updateData.pickupDate = new Date(input.pickupDate);
  }

  // If approved and no certificate number yet, generate one with verification hash
  if (input.status === "APPROVED" || input.status === "READY_FOR_PICKUP") {
    if (!existing.certificateNumber) {
      const certNo = await generateCertificateNumber(tenantId);
      const issuedAt = new Date();
      const expiresAt = new Date(issuedAt);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1-year validity

      const rawPayload = `${certNo}:${existing.studentCode}:${existing.studentName}:${issuedAt.toISOString()}`;
      const hash = createHash("sha256").update(rawPayload).digest("hex").slice(0, 32);

      updateData.certificateNumber = certNo;
      updateData.verificationHash = hash;
      updateData.issuedAt = issuedAt;
      updateData.expiresAt = expiresAt;
      updateData.issuerName = reviewer?.name ?? "Academic Registrar";
    }
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: input.requestId, tenantId },
    data: updateData,
    include: {
      serviceType: { select: { code: true, nameTh: true, nameEn: true } },
      requester: { select: { name: true, email: true } },
    },
  });

  return mapRequestRow(updated);
}

export async function cancelServiceRequest(
  tenantId: string,
  requesterId: string,
  id: string
): Promise<void> {
  const req = await prisma.serviceRequest.findFirst({
    where: { id, tenantId, requesterId },
  });
  if (!req) {
    throw new Error("Request not found or not owned by user");
  }
  if (req.status !== "PENDING") {
    throw new Error("Only pending requests can be cancelled");
  }

  await prisma.serviceRequest.update({
    where: { id, tenantId },
    data: { status: "CANCELLED" },
  });
}
