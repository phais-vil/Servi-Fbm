import Link from "next/link";
import { getT, getLocale } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import {
  listServiceTypes,
  listServiceRequests,
  resolvePublicTenantId,
} from "@/features/services/server";
import { getSessionContext } from "@/features/identity/server";
import { StatusPill } from "@/shared/components/liyon";
import {
  FileCheck,
  Clock,
  ArrowRight,
  Plus,
  ShieldCheck,
} from "lucide-react";

export default async function ServicesPortalPage() {
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const [serviceTypes, session] = await Promise.all([
    tenantId ? listServiceTypes(tenantId) : [],
    getSessionContext(),
  ]);

  const myRequests = session && tenantId
    ? await listServiceRequests(tenantId, { requesterId: session.userId })
    : [];

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("services.publicTitle")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("services.publicSubtitle")}
        </p>

        {/* Quick Verification Lookup */}
        <div className="pt-2 max-w-md mx-auto">
          <form
            onSubmit={undefined}
            action="/verify"
            method="GET"
            className="flex items-center gap-2 p-1.5 rounded-2xl border bg-card shadow-xs"
          >
            <ShieldCheck className="h-5 w-5 text-primary ml-2.5 shrink-0" />
            <input
              type="text"
              name="code"
              placeholder="กรอกรหัสยืนยัน เช่น CERT-202609-0001"
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition shadow-xs"
            >
              ตรวจสอบ
            </button>
          </form>
        </div>
      </div>

      {/* User's Requests (if logged in) */}
      {session && myRequests.length > 0 && (
        <section className="p-6 rounded-3xl bg-card border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">{t("services.myRequests")}</h2>
            </div>
            <Link
              href="/services/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("services.newRequest")}</span>
            </Link>
          </div>

          <div className="space-y-3">
            {myRequests.map((req) => {
              const statusTone =
                req.status === "APPROVED" || req.status === "COMPLETED"
                  ? "ok"
                  : req.status === "REJECTED"
                  ? "bad"
                  : req.status === "READY_FOR_PICKUP"
                  ? "info"
                  : "warn";

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-background px-2 py-0.5 rounded border">
                        {req.trackingCode}
                      </span>
                      <StatusPill tone={statusTone}>
                        {req.status === "APPROVED"
                          ? t("services.status.approved")
                          : req.status === "READY_FOR_PICKUP"
                          ? t("services.status.ready_for_pickup")
                          : req.status === "REJECTED"
                          ? t("services.status.rejected")
                          : t("services.status.pending")}
                      </StatusPill>
                    </div>
                    <div className="font-semibold text-sm">
                      {locale === "en" ? req.serviceTypeNameEn : req.serviceTypeNameTh}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>ยื่นเมื่อ {formatDate(req.createdAt, locale)}</span>
                      <span>•</span>
                      <span>รูปแบบ: {req.deliveryMethod}</span>
                      {req.pickupLocation && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            สถานที่รับ: {req.pickupLocation}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {req.certificateNumber && (
                      <Link
                        href={`/verify/${req.certificateNumber}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border bg-background hover:bg-muted transition"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span>ใบรับรองดิจิทัล</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Services Catalog Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">{t("services.catalog")}</h2>
            <p className="text-xs text-muted-foreground">
              เลือกประเภทเอกสารที่ต้องการ และยื่นคำร้องผ่านระบบออนไลน์ได้ตลอด 24 ชั่วโมง
            </p>
          </div>
          <Link
            href="/services/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{t("services.newRequest")}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceTypes.map((st) => {
            const name = locale === "en" ? st.nameEn : st.nameTh;

            return (
              <div
                key={st.id}
                className="group flex flex-col justify-between p-6 rounded-3xl bg-card border shadow-xs hover:shadow-md hover:border-primary/50 transition duration-200"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-primary/10 text-primary">
                      {st.code}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {st.fee > 0 ? `฿${st.fee}` : "ฟรี (ไม่มีค่าธรรมเนียม)"}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition">
                    {name}
                  </h3>

                  {st.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {st.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>ระยะเวลาดำเนินการ: ประมาณ {st.processingDays} วันทำการ</span>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t">
                  <Link
                    href={`/services/new?type=${st.id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-xs"
                  >
                    <span>ยื่นคำขอนี้</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
