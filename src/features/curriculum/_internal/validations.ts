import { z } from "zod";

export const degreeLevels = ["BACHELOR", "MASTER", "DOCTORAL", "DIPLOMA"] as const;
export type DegreeLevelEnum = (typeof degreeLevels)[number];

export const createProgramSchema = z.object({
  code: z.string().min(2, "curriculum.validation.codeMin").max(50),
  nameTh: z.string().min(2, "curriculum.validation.nameThMin").max(255),
  nameEn: z.string().min(2, "curriculum.validation.nameEnMin").max(255),
  degreeTitleTh: z.string().min(2, "curriculum.validation.degreeTitleThMin").max(255),
  degreeTitleEn: z.string().min(2, "curriculum.validation.degreeTitleEnMin").max(255),
  level: z.enum(degreeLevels).default("BACHELOR"),
  totalCredits: z.number().int().min(1, "curriculum.validation.creditsMin").default(120),
  durationYears: z.number().min(0.5).default(4.0),
  tuitionFeePerTerm: z.number().min(0).optional().nullable(),
  overview: z.string().optional().nullable(),
  careerPaths: z.string().optional().nullable(),
  studyPlan: z.string().optional().nullable(),
  coverImage: z.string().max(500).optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateProgramSchema = createProgramSchema.extend({
  id: z.string().uuid(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
