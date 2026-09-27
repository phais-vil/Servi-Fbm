import { z } from "zod";

export const staffTypes = ["ACADEMIC", "SUPPORT", "EXECUTIVE"] as const;
export type StaffTypeEnum = (typeof staffTypes)[number];

export const createDepartmentSchema = z.object({
  code: z.string().min(2, "staff.validation.deptCodeMin").max(50),
  nameTh: z.string().min(2, "staff.validation.nameThMin").max(255),
  nameEn: z.string().min(2, "staff.validation.nameEnMin").max(255),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().uuid(),
});

export const createStaffSchema = z.object({
  departmentId: z.string().uuid().optional().nullable(),
  staffType: z.enum(staffTypes).default("ACADEMIC"),
  academicTitle: z.string().max(50).optional().nullable(),
  firstNameTh: z.string().min(2, "staff.validation.nameMin").max(100),
  lastNameTh: z.string().min(2, "staff.validation.nameMin").max(100),
  firstNameEn: z.string().min(2, "staff.validation.nameMin").max(100),
  lastNameEn: z.string().min(2, "staff.validation.nameMin").max(100),
  position: z.string().max(150).optional().nullable(),
  email: z.string().email("staff.validation.emailInvalid"),
  phone: z.string().max(50).optional().nullable(),
  officeRoom: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable(),
  education: z.string().optional().nullable(),
  expertise: z.string().optional().nullable(),
  orderIndex: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateStaffSchema = createStaffSchema.extend({
  id: z.string().uuid(),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
