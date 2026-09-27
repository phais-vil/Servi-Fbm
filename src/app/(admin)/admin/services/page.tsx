import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  SERVICES_P,
  listServiceRequests,
  listServiceTypes,
} from "@/features/services/server";
import { ServicesAdminClient } from "./_components/services-admin-client";

export default async function ServicesAdminPage() {
  const ctx = await requirePermission(SERVICES_P.servicesRead);
  const [initialRequests, serviceTypes] = await Promise.all([
    listServiceRequests(ctx.tenantId),
    listServiceTypes(ctx.tenantId),
  ]);

  return (
    <ServicesAdminClient
      initialRequests={initialRequests}
      serviceTypes={serviceTypes}
      canManage={hasPermission(ctx, SERVICES_P.servicesManage)}
    />
  );
}
