"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requireSession, requirePermission } from "@/features/identity/server";
import { ATTENDANCE_P } from "../permissions";
import {
  createSessionSchema,
  checkInSchema,
  updateRecordSchema,
  manualCheckInSchema,
} from "./validations";
import {
  createAttendanceSession,
  toggleSessionStatus,
  submitStudentCheckIn,
  updateAttendanceRecord,
  manualCheckIn,
  type AttendanceSessionDto,
  type AttendanceRecordDto,
} from "./services";
import type { AttendanceSessionStatus } from "@/generated/prisma";

export async function createSessionAction(
  input: unknown
): Promise<ActionResult<AttendanceSessionDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const parsed = createSessionSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createAttendanceSession(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/attendance");
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function toggleSessionStatusAction(
  sessionId: string,
  status: AttendanceSessionStatus
): Promise<ActionResult<AttendanceSessionDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const result = await toggleSessionStatus(ctx.tenantId, sessionId, status);
    revalidatePath("/attendance");
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function submitCheckInAction(
  input: unknown
): Promise<ActionResult<AttendanceRecordDto>> {
  return runAction(async () => {
    const ctx = await requireSession();
    const parsed = checkInSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await submitStudentCheckIn(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/checkin");
    revalidatePath("/attendance");
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function updateRecordAction(
  input: unknown
): Promise<ActionResult<AttendanceRecordDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const parsed = updateRecordSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await updateAttendanceRecord(ctx.tenantId, parsed);
    revalidatePath("/attendance");
    revalidatePath("/admin/attendance");
    return result;
  });
}

export async function manualCheckInAction(
  input: unknown
): Promise<ActionResult<AttendanceRecordDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceManage);
    const parsed = manualCheckInSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await manualCheckIn(ctx.tenantId, parsed);
    revalidatePath("/attendance");
    revalidatePath("/admin/attendance");
    return result;
  });
}
