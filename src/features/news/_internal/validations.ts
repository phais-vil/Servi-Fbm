import { z } from "zod";

export const newsCategories = ["ACADEMIC", "EVENT", "SCHOLARSHIP", "GENERAL"] as const;
export type NewsCategoryType = (typeof newsCategories)[number];

export const newsStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type NewsStatusType = (typeof newsStatuses)[number];

export const createNewsSchema = z.object({
  title: z.string().min(3, "news.validation.titleMin").max(255, "news.validation.titleMax"),
  slug: z.string().max(255).optional(),
  summary: z.string().max(500).optional().nullable(),
  content: z.string().min(5, "news.validation.contentMin"),
  coverImage: z.string().max(500).optional().nullable(),
  category: z.enum(newsCategories).default("GENERAL"),
  status: z.enum(newsStatuses).default("DRAFT"),
  isPinned: z.boolean().default(false),
});

export const updateNewsSchema = createNewsSchema.extend({
  id: z.string().uuid(),
});

export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
