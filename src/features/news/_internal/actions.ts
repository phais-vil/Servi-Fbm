"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { NEWS_P } from "../permissions";
import { createNewsSchema, updateNewsSchema } from "./validations";
import {
  createNews,
  updateNews,
  deleteNews,
  listNews,
  togglePinNews,
  type NewsArticleDto,
} from "./services";

export async function getNewsListAction(options?: {
  category?: string;
  status?: string;
  search?: string;
}): Promise<ActionResult<NewsArticleDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listNews(ctx.tenantId, options);
  });
}

export async function createNewsAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = createNewsSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createNews(ctx.tenantId, parsed, ctx.userId);
    revalidatePath("/news");
    revalidatePath("/admin/news");
    return result;
  });
}

export async function updateNewsAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManage);
    const parsed = updateNewsSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateNews(ctx.tenantId, parsed);
    revalidatePath("/news");
    revalidatePath("/admin/news");
    return result;
  });
}

export async function deleteNewsAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsDelete);
    await deleteNews(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/admin/news");
  });
}

export async function togglePinNewsAction(id: string): Promise<ActionResult<boolean>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPublish);
    const pinned = await togglePinNews(ctx.tenantId, id);
    revalidatePath("/news");
    revalidatePath("/(admin)/news");
    return pinned;
  });
}
