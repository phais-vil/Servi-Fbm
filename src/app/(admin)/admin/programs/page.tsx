import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P, listPrograms } from "@/features/curriculum/server";
import { listDepartments } from "@/features/staff/server";
import { ProgramClient } from "./_components/program-client";

export default async function ProgramsAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const [initialPrograms, departments] = await Promise.all([
    listPrograms(ctx.tenantId),
    listDepartments(ctx.tenantId),
  ]);

  return (
    <ProgramClient
      initialPrograms={initialPrograms}
      departments={departments}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
    />
  );
}
