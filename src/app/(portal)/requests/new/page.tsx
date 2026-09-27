import { redirect } from "next/navigation";
import { getSessionContext } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { NewRequestForm } from "./_components/new-request-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewRequestPage() {
  const session = await getSessionContext();
  if (!session) {
    redirect("/login?callbackUrl=/requests/new");
  }

  const t = await getT();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("documents.portalTitle")}</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t("documents.newRequest")}
        </h1>
        <p className="text-sm text-muted-foreground">
          กรอกรายละเอียดคำร้องและแนบหลักฐานประกอบการพิจารณา ข้อมูลจะถูกส่งตรงไปยังอาจารย์และฝ่ายวิชาการ
        </p>
      </div>

      <NewRequestForm />
    </div>
  );
}
