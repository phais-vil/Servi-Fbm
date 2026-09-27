import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateStaffInput,
  UpdateStaffInput,
  CreateDepartmentInput,
} from "./validations";
import type { Prisma, StaffProfile, Department } from "@/generated/prisma";

export interface DepartmentDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  staffCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StaffProfileDto {
  id: string;
  tenantId: string;
  userId: string | null;
  departmentId: string | null;
  departmentNameTh: string | null;
  departmentNameEn: string | null;
  staffType: string;
  academicTitle: string | null;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  fullNameTh: string;
  fullNameEn: string;
  position: string | null;
  email: string;
  phone: string | null;
  officeRoom: string | null;
  avatarUrl: string | null;
  education: string | null;
  expertise: string | null;
  orderIndex: number;
  isActive: boolean;
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

export async function listDepartments(tenantId: string): Promise<DepartmentDto[]> {
  const items = await prisma.department.findMany({
    where: { tenantId },
    include: { _count: { select: { staff: true } } },
    orderBy: { code: "asc" },
  });

  return items.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    code: d.code,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    staffCount: d._count.staff,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
}

export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentInput
): Promise<DepartmentDto> {
  const created = await prisma.department.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
    },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    code: created.code,
    nameTh: created.nameTh,
    nameEn: created.nameEn,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function listStaff(
  tenantId: string,
  options?: { departmentId?: string; staffType?: string; search?: string }
): Promise<StaffProfileDto[]> {
  const where: Prisma.StaffProfileWhereInput = { tenantId };

  if (options?.departmentId && options.departmentId !== "ALL") {
    where.departmentId = options.departmentId;
  }
  if (options?.staffType && options.staffType !== "ALL") {
    where.staffType = options.staffType as Prisma.EnumStaffTypeFilter;
  }
  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { firstNameTh: { contains: q, mode: "insensitive" } },
      { lastNameTh: { contains: q, mode: "insensitive" } },
      { firstNameEn: { contains: q, mode: "insensitive" } },
      { lastNameEn: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { expertise: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.staffProfile.findMany({
    where,
    include: { department: { select: { nameTh: true, nameEn: true } } },
    orderBy: [{ orderIndex: "asc" }, { firstNameTh: "asc" }],
  });

  return items.map(mapStaffRow);
}

export async function listPublicStaff(
  tenantId: string,
  options?: { departmentId?: string; staffType?: string; search?: string }
): Promise<StaffProfileDto[]> {
  const where: Prisma.StaffProfileWhereInput = {
    tenantId,
    isActive: true,
  };

  if (options?.departmentId && options.departmentId !== "ALL") {
    where.departmentId = options.departmentId;
  }
  if (options?.staffType && options.staffType !== "ALL") {
    where.staffType = options.staffType as Prisma.EnumStaffTypeFilter;
  }
  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { firstNameTh: { contains: q, mode: "insensitive" } },
      { lastNameTh: { contains: q, mode: "insensitive" } },
      { firstNameEn: { contains: q, mode: "insensitive" } },
      { lastNameEn: { contains: q, mode: "insensitive" } },
      { expertise: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.staffProfile.findMany({
    where,
    include: { department: { select: { nameTh: true, nameEn: true } } },
    orderBy: [{ orderIndex: "asc" }, { firstNameTh: "asc" }],
  });

  return items.map(mapStaffRow);
}

export async function getStaffById(tenantId: string, id: string): Promise<StaffProfileDto | null> {
  const item = await prisma.staffProfile.findFirst({
    where: { id, tenantId },
    include: { department: { select: { nameTh: true, nameEn: true } } },
  });

  return item ? mapStaffRow(item) : null;
}

export async function createStaff(
  tenantId: string,
  input: CreateStaffInput,
  userId?: string
): Promise<StaffProfileDto> {
  const created = await prisma.staffProfile.create({
    data: {
      tenantId,
      userId: userId ?? null,
      departmentId: input.departmentId ?? null,
      staffType: input.staffType,
      academicTitle: input.academicTitle ?? null,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      position: input.position ?? null,
      email: input.email,
      phone: input.phone ?? null,
      officeRoom: input.officeRoom ?? null,
      avatarUrl: input.avatarUrl ?? null,
      education: input.education ?? null,
      expertise: input.expertise ?? null,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
    },
    include: { department: { select: { nameTh: true, nameEn: true } } },
  });

  return mapStaffRow(created);
}

export async function updateStaff(
  tenantId: string,
  input: UpdateStaffInput
): Promise<StaffProfileDto> {
  const updated = await prisma.staffProfile.update({
    where: { id: input.id, tenantId },
    data: {
      departmentId: input.departmentId ?? null,
      staffType: input.staffType,
      academicTitle: input.academicTitle ?? null,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      position: input.position ?? null,
      email: input.email,
      phone: input.phone ?? null,
      officeRoom: input.officeRoom ?? null,
      avatarUrl: input.avatarUrl ?? null,
      education: input.education ?? null,
      expertise: input.expertise ?? null,
      orderIndex: input.orderIndex,
      isActive: input.isActive,
    },
    include: { department: { select: { nameTh: true, nameEn: true } } },
  });

  return mapStaffRow(updated);
}

export async function deleteStaff(tenantId: string, id: string): Promise<void> {
  await prisma.staffProfile.delete({
    where: { id, tenantId },
  });
}

function mapStaffRow(
  item: StaffProfile & { department?: Pick<Department, "nameTh" | "nameEn"> | null }
): StaffProfileDto {
  const titlePrefixTh = item.academicTitle ? `${item.academicTitle} ` : "";
  const titlePrefixEn = item.academicTitle ? `${item.academicTitle} ` : "";
  return {
    id: item.id,
    tenantId: item.tenantId,
    userId: item.userId,
    departmentId: item.departmentId,
    departmentNameTh: item.department?.nameTh ?? null,
    departmentNameEn: item.department?.nameEn ?? null,
    staffType: item.staffType,
    academicTitle: item.academicTitle,
    firstNameTh: item.firstNameTh,
    lastNameTh: item.lastNameTh,
    firstNameEn: item.firstNameEn,
    lastNameEn: item.lastNameEn,
    fullNameTh: `${titlePrefixTh}${item.firstNameTh} ${item.lastNameTh}`.trim(),
    fullNameEn: `${titlePrefixEn}${item.firstNameEn} ${item.lastNameEn}`.trim(),
    position: item.position,
    email: item.email,
    phone: item.phone,
    officeRoom: item.officeRoom,
    avatarUrl: item.avatarUrl,
    education: item.education,
    expertise: item.expertise,
    orderIndex: item.orderIndex,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}
