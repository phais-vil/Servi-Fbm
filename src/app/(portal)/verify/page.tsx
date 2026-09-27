import { redirect } from "next/navigation";
import Link from "next/link";
import { getT } from "@/i18n/server";
import { ShieldCheck, Search, ArrowLeft } from "lucide-react";

interface VerifyIndexPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function VerifyIndexPage({ searchParams }: VerifyIndexPageProps) {
  const { code } = await searchParams;
  if (code?.trim()) {
    redirect(`/verify/${encodeURIComponent(code.trim())}`);
  }

  const t = await getT();

  return (
    <div className="max-w-xl mx-auto space-y-8 py-12">
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("services.publicTitle")}</span>
        </Link>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-card border shadow-md text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <ShieldCheck className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("services.verifyTitle")}
          </h1>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {t("services.verifySubtitle")}
          </p>
        </div>

        <form action="/verify" method="GET" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="code"
              required
              placeholder="กรอกรหัสเอกสาร เช่น CERT-202609-0001 หรือ SR-..."
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition shadow-xs"
          >
            ตรวจสอบความถูกต้อง (Verify)
          </button>
        </form>
      </div>
    </div>
  );
}
