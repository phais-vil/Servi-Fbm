import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateProgramInput, UpdateProgramInput } from "./validations";
import type { Prisma, CurriculumProgram } from "@/generated/prisma";

export interface CurriculumProgramDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTitleTh: string;
  degreeTitleEn: string;
  level: string;
  totalCredits: number;
  durationYears: number;
  tuitionFeePerTerm: number | null;
  overview: string | null;
  careerPaths: string | null;
  studyPlan: string | null;
  coverImage: string | null;
  departmentId: string | null;
  departmentNameTh: string | null;
  departmentNameEn: string | null;
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

function mapProgramRow(
  row: CurriculumProgram & { department?: { nameTh: string; nameEn: string } | null }
): CurriculumProgramDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    code: row.code,
    nameTh: row.nameTh,
    nameEn: row.nameEn,
    degreeTitleTh: row.degreeTitleTh,
    degreeTitleEn: row.degreeTitleEn,
    level: row.level,
    totalCredits: row.totalCredits,
    durationYears: row.durationYears,
    tuitionFeePerTerm: row.tuitionFeePerTerm,
    overview: row.overview,
    careerPaths: row.careerPaths,
    studyPlan: row.studyPlan,
    coverImage: row.coverImage,
    departmentId: row.departmentId,
    departmentNameTh: row.department?.nameTh ?? null,
    departmentNameEn: row.department?.nameEn ?? null,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPrograms(
  tenantId: string,
  options?: { level?: string; departmentId?: string; search?: string }
): Promise<CurriculumProgramDto[]> {
  const where: Prisma.CurriculumProgramWhereInput = { tenantId };

  if (options?.level && options.level !== "ALL") {
    where.level = options.level as Prisma.EnumDegreeLevelFilter;
  }
  if (options?.departmentId && options.departmentId !== "ALL") {
    where.departmentId = options.departmentId;
  }
  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { nameTh: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { degreeTitleTh: { contains: q, mode: "insensitive" } },
      { degreeTitleEn: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.curriculumProgram.findMany({
    where,
    include: { department: { select: { nameTh: true, nameEn: true } } },
    orderBy: [{ level: "asc" }, { code: "asc" }],
  });

  return items.map(mapProgramRow);
}

export async function listPublicPrograms(
  tenantId: string,
  options?: { level?: string; departmentId?: string; search?: string }
): Promise<CurriculumProgramDto[]> {
  const where: Prisma.CurriculumProgramWhereInput = {
    tenantId,
    isActive: true,
  };

  if (options?.level && options.level !== "ALL") {
    where.level = options.level as Prisma.EnumDegreeLevelFilter;
  }
  if (options?.departmentId && options.departmentId !== "ALL") {
    where.departmentId = options.departmentId;
  }
  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { nameTh: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { degreeTitleTh: { contains: q, mode: "insensitive" } },
      { degreeTitleEn: { contains: q, mode: "insensitive" } },
      { careerPaths: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.curriculumProgram.findMany({
    where,
    include: { department: { select: { nameTh: true, nameEn: true } } },
    orderBy: [{ level: "asc" }, { code: "asc" }],
  });

  return items.map(mapProgramRow);
}

export async function getProgramByCode(
  tenantId: string,
  code: string
): Promise<CurriculumProgramDto | null> {
  const item = await prisma.curriculumProgram.findFirst({
    where: { tenantId, code, isActive: true },
    include: { department: { select: { nameTh: true, nameEn: true } } },
  });

  if (!item) return null;
  return mapProgramRow(item);
}

export async function getProgramById(
  tenantId: string,
  id: string
): Promise<CurriculumProgramDto | null> {
  const item = await prisma.curriculumProgram.findFirst({
    where: { tenantId, id },
    include: { department: { select: { nameTh: true, nameEn: true } } },
  });

  if (!item) return null;
  return mapProgramRow(item);
}

export async function createProgram(
  tenantId: string,
  input: CreateProgramInput
): Promise<CurriculumProgramDto> {
  const created = await prisma.curriculumProgram.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTitleTh: input.degreeTitleTh,
      degreeTitleEn: input.degreeTitleEn,
      level: input.level,
      totalCredits: input.totalCredits,
      durationYears: input.durationYears,
      tuitionFeePerTerm: input.tuitionFeePerTerm ?? null,
      overview: input.overview ?? null,
      careerPaths: input.careerPaths ?? null,
      studyPlan: input.studyPlan ?? null,
      coverImage: input.coverImage ?? null,
      departmentId: input.departmentId ?? null,
      isActive: input.isActive,
    },
    include: { department: { select: { nameTh: true, nameEn: true } } },
  });

  return mapProgramRow(created);
}

export async function updateProgram(
  tenantId: string,
  input: UpdateProgramInput
): Promise<CurriculumProgramDto> {
  const updated = await prisma.curriculumProgram.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      degreeTitleTh: input.degreeTitleTh,
      degreeTitleEn: input.degreeTitleEn,
      level: input.level,
      totalCredits: input.totalCredits,
      durationYears: input.durationYears,
      tuitionFeePerTerm: input.tuitionFeePerTerm ?? null,
      overview: input.overview ?? null,
      careerPaths: input.careerPaths ?? null,
      studyPlan: input.studyPlan ?? null,
      coverImage: input.coverImage ?? null,
      departmentId: input.departmentId ?? null,
      isActive: input.isActive,
    },
    include: { department: { select: { nameTh: true, nameEn: true } } },
  });

  return mapProgramRow(updated);
}

export async function deleteProgram(tenantId: string, id: string): Promise<void> {
  await prisma.curriculumProgram.delete({
    where: { id, tenantId },
  });
}
