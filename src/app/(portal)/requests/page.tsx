import { getT } from "@/i18n/server";
import { getSessionContext } from "@/features/identity/server";
import {
  listDocumentRequests,
  getDocumentByTrackingCode,
  resolvePublicTenantId,
} from "@/features/documents/server";
import { StatusPill } from "@/shared/components/liyon";
import { FileText, Search, Plus, ArrowRight, ShieldAlert, AlertCircle } from "lucide-react";
import Link from "next/link";

interface RequestsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PublicRequestsPage({ searchParams }: RequestsPageProps) {
  const { q = "" } = await searchParams;
  const t = await getT();
  const session = await getSessionContext();
  const tenantId = await resolvePublicTenantId();

  // If search query is provided, look up by tracking code or search
  let trackedDoc = null;
  if (tenantId && q.trim()) {
    trackedDoc = await getDocumentByTrackingCode(tenantId, q.trim().toUpperCase());
  }

  // If user is logged in, show their requests
  const myRequests = tenantId && session?.userId
    ? await listDocumentRequests(tenantId, { requesterId: session.userId })
    : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("documents.portalTitle")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("documents.portalSubtitle")}
          </p>
        </div>

        <div>
          {session ? (
            <Link
              href="/requests/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{t("documents.newRequest")}</span>
            </Link>
          ) : (
            <Link
              href="/login?callbackUrl=/requests/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{t("documents.newRequest")} (เข้าสู่ระบบ)</span>
            </Link>
          )}
        </div>
      </div>

      {/* Tracking Code Search Box */}
      <div className="p-6 rounded-2xl bg-card border shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold tracking-tight">
            ตรวจสอบสถานะคำร้องด้วยรหัสติดตาม (Tracking Code)
          </h2>
        </div>
        <form method="GET" action="/requests" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="ตัวอย่าง: REQ-202609-0001"
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border bg-background font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
          />
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition"
          >
            ค้นหา
          </button>
        </form>

        {/* Tracking Search Result */}
        {q.trim() && (
          <div className="pt-2">
            {trackedDoc ? (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-primary">
                      {trackedDoc.trackingCode}
                    </span>
                    <StatusPill tone={trackedDoc.status === "APPROVED" ? "ok" : trackedDoc.status === "REJECTED" ? "bad" : "info"}>
                      {trackedDoc.status}
                    </StatusPill>
                  </div>
                  <p className="font-semibold text-sm">{trackedDoc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    ผู้ยื่นคำร้อง: {trackedDoc.requesterName} • วันที่ยื่น: {new Date(trackedDoc.createdAt).toLocaleDateString("th-TH")}
                  </p>
                </div>
                <Link
                  href={`/requests/${encodeURIComponent(trackedDoc.trackingCode)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition self-start sm:self-auto"
                >
                  <span>{t("documents.timeline")}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/40 border border-dashed text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>ไม่พบข้อมูลคำร้องตามรหัส &quot;{q}&quot;</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logged in User Petitions */}
      {session ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>{t("documents.myRequests")} ({myRequests.length})</span>
            </h2>
          </div>

          {myRequests.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed text-muted-foreground space-y-2">
              <FileText className="h-8 w-8 mx-auto opacity-40" />
              <p className="text-sm font-medium">{t("documents.empty")}</p>
              <Link
                href="/requests/new"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>คลิกที่นี่เพื่อเริ่มยื่นคำร้องแรกของคุณ</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="divide-y rounded-2xl bg-card border overflow-hidden shadow-xs">
              {myRequests.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {doc.trackingCode}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {doc.documentType}
                      </span>
                      <StatusPill tone={doc.status === "APPROVED" ? "ok" : doc.status === "REJECTED" ? "bad" : "info"}>
                        {doc.status}
                      </StatusPill>
                    </div>

                    <h3 className="font-semibold text-sm text-foreground">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {doc.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString("th-TH")}
                    </span>
                    <Link
                      href={`/requests/${encodeURIComponent(doc.trackingCode)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-muted font-medium transition"
                    >
                      <span>รายละเอียด</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="p-8 rounded-2xl bg-muted/20 border border-dashed text-center space-y-3">
          <ShieldAlert className="h-8 w-8 text-primary mx-auto opacity-70" />
          <h3 className="font-bold text-base">เข้าสู่ระบบเพื่อดูประวัติคำร้องของคุณ</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            นิสิตและคณาจารย์สามารถเข้าสู่ระบบเพื่อดูรายการคำร้องทั้งหมดที่ตนเองเคยยื่นไว้ และรับการแจ้งเตือนผลการพิจารณา
          </p>
          <div>
            <Link
              href="/login?callbackUrl=/requests"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-xs"
            >
              <span>เข้าสู่ระบบ (Sign in)</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
