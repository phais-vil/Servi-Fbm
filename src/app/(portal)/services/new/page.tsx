import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext } from "@/features/identity/server";
import { listServiceTypes, resolvePublicTenantId } from "@/features/services/server";
import { getT } from "@/i18n/server";
import { NewServiceForm } from "./_components/new-service-form";
import { ArrowLeft } from "lucide-react";

interface NewServicePageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function NewServicePage({ searchParams }: NewServicePageProps) {
  const session = await getSessionContext();
  if (!session) {
    redirect("/login?callbackUrl=/services/new");
  }

  const { type: defaultTypeId } = await searchParams;
  const t = await getT();
  const tenantId = await resolvePublicTenantId();
  const serviceTypes = tenantId ? await listServiceTypes(tenantId) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("services.publicTitle")}</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t("services.newRequest")}
        </h1>
        <p className="text-sm text-muted-foreground">
          กรอกข้อมูลให้ครบถ้วนเพื่อความรวดเร็วในการออกหนังสือรับรองและตรวจสอบคุณสมบัติ
        </p>
      </div>

      <NewServiceForm
        serviceTypes={serviceTypes}
        defaultTypeId={defaultTypeId}
        userDefaultName={session.userName}
      />
    </div>
  );
}
