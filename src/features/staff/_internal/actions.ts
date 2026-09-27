"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { STAFF_P } from "../permissions";
import {
  createStaffSchema,
  updateStaffSchema,
  createDepartmentSchema,
} from "./validations";
import {
  createStaff,
  updateStaff,
  deleteStaff,
  listStaff,
  createDepartment,
  type StaffProfileDto,
  type DepartmentDto,
} from "./services";

export async function getStaffListAction(options?: {
  departmentId?: string;
  staffType?: string;
  search?: string;
}): Promise<ActionResult<StaffProfileDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffRead);
    return listStaff(ctx.tenantId, options);
  });
}

export async function createStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = createStaffSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createStaff(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/admin/staff");
    return result;
  });
}

export async function updateStaffAction(input: unknown): Promise<ActionResult<StaffProfileDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = updateStaffSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateStaff(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/admin/staff");
    return result;
  });
}

export async function deleteStaffAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    await deleteStaff(ctx.tenantId, id);
    revalidatePath("/staff");
    revalidatePath("/admin/staff");
  });
}

export async function createDepartmentAction(input: unknown): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(STAFF_P.staffManage);
    const parsed = createDepartmentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDepartment(ctx.tenantId, parsed);
    revalidatePath("/staff");
    revalidatePath("/admin/staff");
    return result;
  });
}
