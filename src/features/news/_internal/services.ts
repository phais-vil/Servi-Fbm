import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateNewsInput, UpdateNewsInput } from "./validations";
import type { Prisma } from "@/generated/prisma";

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  status: string;
  isPinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  authorId: string | null;
  authorName: string | null;
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

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0E00-\u0E7F\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${base || "news"}-${randomSuffix}`;
}

export async function listNews(
  tenantId: string,
  options?: { category?: string; status?: string; search?: string }
): Promise<NewsArticleDto[]> {
  const where: Prisma.NewsArticleWhereInput = { tenantId };

  if (options?.category && options.category !== "ALL") {
    where.category = options.category as Prisma.EnumNewsCategoryFilter;
  }
  if (options?.status && options.status !== "ALL") {
    where.status = options.status as Prisma.EnumNewsStatusFilter;
  }
  if (options?.search?.trim()) {
    where.OR = [
      { title: { contains: options.search.trim(), mode: "insensitive" } },
      { summary: { contains: options.search.trim(), mode: "insensitive" } },
    ];
  }

  const items = await prisma.newsArticle.findMany({
    where,
    include: { author: { select: { name: true } } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    coverImage: item.coverImage,
    category: item.category,
    status: item.status,
    isPinned: item.isPinned,
    viewCount: item.viewCount,
    publishedAt: item.publishedAt?.toISOString() ?? null,
    authorId: item.authorId,
    authorName: item.author?.name ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function listPublishedNews(
  tenantId: string,
  options?: { category?: string; search?: string; limit?: number }
): Promise<NewsArticleDto[]> {
  const where: Prisma.NewsArticleWhereInput = {
    tenantId,
    status: "PUBLISHED",
  };

  if (options?.category && options.category !== "ALL") {
    where.category = options.category as Prisma.EnumNewsCategoryFilter;
  }
  if (options?.search?.trim()) {
    where.OR = [
      { title: { contains: options.search.trim(), mode: "insensitive" } },
      { summary: { contains: options.search.trim(), mode: "insensitive" } },
      { content: { contains: options.search.trim(), mode: "insensitive" } },
    ];
  }

  const items = await prisma.newsArticle.findMany({
    where,
    include: { author: { select: { name: true } } },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: options?.limit ?? 50,
  });

  return items.map((item) => ({
    id: item.id,
    tenantId: item.tenantId,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    coverImage: item.coverImage,
    category: item.category,
    status: item.status,
    isPinned: item.isPinned,
    viewCount: item.viewCount,
    publishedAt: item.publishedAt?.toISOString() ?? null,
    authorId: item.authorId,
    authorName: item.author?.name ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));
}

export async function getNewsBySlug(tenantId: string, slug: string): Promise<NewsArticleDto | null> {
  const item = await prisma.newsArticle.findFirst({
    where: { tenantId, slug, status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
  });

  if (!item) return null;

  // Increment view count asynchronously
  await prisma.newsArticle.update({
    where: { id: item.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return {
    id: item.id,
    tenantId: item.tenantId,
    title: item.title,
    slug: item.slug,
    summary: item.summary,
    content: item.content,
    coverImage: item.coverImage,
    category: item.category,
    status: item.status,
    isPinned: item.isPinned,
    viewCount: item.viewCount + 1,
    publishedAt: item.publishedAt?.toISOString() ?? null,
    authorId: item.authorId,
    authorName: item.author?.name ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function createNews(
  tenantId: string,
  input: CreateNewsInput,
  authorId?: string
): Promise<NewsArticleDto> {
  const slug = input.slug?.trim() ? input.slug.trim() : generateSlug(input.title);
  const publishedAt = input.status === "PUBLISHED" ? new Date() : null;

  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      title: input.title,
      slug,
      summary: input.summary ?? null,
      content: input.content,
      coverImage: input.coverImage ?? null,
      category: input.category,
      status: input.status,
      isPinned: input.isPinned,
      publishedAt,
      authorId: authorId ?? null,
    },
    include: { author: { select: { name: true } } },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    title: created.title,
    slug: created.slug,
    summary: created.summary,
    content: created.content,
    coverImage: created.coverImage,
    category: created.category,
    status: created.status,
    isPinned: created.isPinned,
    viewCount: created.viewCount,
    publishedAt: created.publishedAt?.toISOString() ?? null,
    authorId: created.authorId,
    authorName: created.author?.name ?? null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateNews(tenantId: string, input: UpdateNewsInput): Promise<NewsArticleDto> {
  const existing = await prisma.newsArticle.findFirst({
    where: { id: input.id, tenantId },
  });

  if (!existing) {
    throw new Error("News article not found");
  }

  let publishedAt = existing.publishedAt;
  if (input.status === "PUBLISHED" && !existing.publishedAt) {
    publishedAt = new Date();
  }

  const updated = await prisma.newsArticle.update({
    where: { id: input.id, tenantId },
    data: {
      title: input.title,
      slug: input.slug?.trim() || existing.slug,
      summary: input.summary ?? null,
      content: input.content,
      coverImage: input.coverImage ?? null,
      category: input.category,
      status: input.status,
      isPinned: input.isPinned,
      publishedAt,
    },
    include: { author: { select: { name: true } } },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    title: updated.title,
    slug: updated.slug,
    summary: updated.summary,
    content: updated.content,
    coverImage: updated.coverImage,
    category: updated.category,
    status: updated.status,
    isPinned: updated.isPinned,
    viewCount: updated.viewCount,
    publishedAt: updated.publishedAt?.toISOString() ?? null,
    authorId: updated.authorId,
    authorName: updated.author?.name ?? null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function deleteNews(tenantId: string, id: string): Promise<void> {
  await prisma.newsArticle.delete({
    where: { id, tenantId },
  });
}

export async function togglePinNews(tenantId: string, id: string): Promise<boolean> {
  const article = await prisma.newsArticle.findFirst({
    where: { id, tenantId },
  });
  if (!article) throw new Error("News article not found");

  const newPinned = !article.isPinned;
  await prisma.newsArticle.update({
    where: { id, tenantId },
    data: { isPinned: newPinned },
  });
  return newPinned;
}
