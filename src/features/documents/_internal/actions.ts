"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requireSession, requirePermission } from "@/features/identity/server";
import { DOCUMENT_P } from "../permissions";
import {
  createDocumentSchema,
  reviewDocumentSchema,
} from "./validations";
import {
  createDocumentRequest,
  reviewDocumentRequest,
  cancelDocumentRequest,
  listDocumentRequests,
  type DocumentRequestDto,
} from "./services";

export async function submitRequestAction(input: unknown): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requireSession();
    const parsed = createDocumentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDocumentRequest(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/requests");
    revalidatePath("/admin/documents");
    return result;
  });
}

export async function reviewRequestAction(input: unknown): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentReview);
    const parsed = reviewDocumentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await reviewDocumentRequest(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/requests");
    revalidatePath("/admin/documents");
    return result;
  });
}

export async function cancelRequestAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requireSession();
    await cancelDocumentRequest(ctx.tenantId, ctx.userId, id);
    revalidatePath("/requests");
    revalidatePath("/admin/documents");
  });
}

export async function listUserRequestsAction(): Promise<ActionResult<DocumentRequestDto[]>> {
  return runAction(async () => {
    const ctx = await requireSession();
    return listDocumentRequests(ctx.tenantId, { requesterId: ctx.userId });
  });
}

export async function listAllRequestsAction(options?: {
  status?: string;
  type?: string;
  search?: string;
}): Promise<ActionResult<DocumentRequestDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(DOCUMENT_P.documentReview);
    return listDocumentRequests(ctx.tenantId, options);
  });
}
