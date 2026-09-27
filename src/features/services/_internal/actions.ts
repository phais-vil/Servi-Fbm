"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requireSession, requirePermission } from "@/features/identity/server";
import { SERVICES_P } from "../permissions";
import {
  createServiceRequestSchema,
  reviewServiceRequestSchema,
} from "./validations";
import {
  createServiceRequest,
  reviewServiceRequest,
  cancelServiceRequest,
  type ServiceRequestDto,
} from "./services";

export async function submitServiceRequestAction(
  input: unknown
): Promise<ActionResult<ServiceRequestDto>> {
  return runAction(async () => {
    const ctx = await requireSession();
    const parsed = createServiceRequestSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await createServiceRequest(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return result;
  });
}

export async function reviewServiceRequestAction(
  input: unknown
): Promise<ActionResult<ServiceRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(SERVICES_P.servicesManage);
    const parsed = reviewServiceRequestSchema.parse(input, {
      error: zodErrorMap(await getLocale()),
    });
    const result = await reviewServiceRequest(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return result;
  });
}

export async function cancelServiceRequestAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requireSession();
    await cancelServiceRequest(ctx.tenantId, ctx.userId, id);
    revalidatePath("/services");
    revalidatePath("/admin/services");
  });
}
