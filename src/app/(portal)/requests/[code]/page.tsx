import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { getDocumentByTrackingCode, resolvePublicTenantId } from "@/features/documents/server";
import { StatusPill } from "@/shared/components/liyon";
import {
  ArrowLeft,
  Clock,
  User,
  Paperclip,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface RequestDetailPageProps {
  params: Promise<{ code: string }>;
}

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { code } = await params;
  const t = await getT();
  const tenantId = await resolvePublicTenantId();

  if (!tenantId) notFound();

  const doc = await getDocumentByTrackingCode(tenantId, decodeURIComponent(code));
  if (!doc) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("documents.portalTitle")}</span>
        </Link>
      </div>

      {/* Main Request Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                {doc.trackingCode}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {doc.documentType}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-1">
              {doc.title}
            </h1>
          </div>

          <div className="self-start sm:self-center">
            <StatusPill tone={doc.status === "APPROVED" ? "ok" : doc.status === "REJECTED" ? "bad" : "info"}>
              {doc.status}
            </StatusPill>
          </div>
        </div>

        {/* Reason and Details */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t("documents.reasonField")}
          </h2>
          <div className="p-4 rounded-xl bg-muted/30 border text-sm leading-relaxed whitespace-pre-line text-foreground/90">
            {doc.reason}
          </div>
        </div>

        {/* Attachment */}
        {doc.attachmentUrl && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t("documents.attachmentUrl")}
            </h2>
            <a
              href={doc.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition"
            >
              <Paperclip className="h-4 w-4" />
              <span>เปิดดูไฟล์เอกสารแนบ</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>ผู้ยื่นคำร้อง: <strong className="text-foreground">{doc.requesterName}</strong> ({doc.requesterEmail})</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>วันที่ยื่น: {new Date(doc.createdAt).toLocaleString("th-TH")}</span>
          </div>
        </div>
      </div>

      {/* Visual Approval Timeline */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>{t("documents.timeline")}</span>
        </h2>

        <div className="p-6 rounded-3xl bg-card border shadow-xs space-y-6">
          {/* Step 0: Submission */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="w-0.5 flex-1 bg-border my-2" />
            </div>
            <div className="space-y-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">ยื่นคำร้องเข้าสู่ระบบ</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(doc.createdAt).toLocaleString("th-TH")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                คำร้องได้รับการบันทึกและส่งเข้าสู่ขั้นตอนการพิจารณาเรียบร้อยแล้ว
              </p>
            </div>
          </div>

          {/* Approvals history */}
          {doc.approvals.map((app, idx) => {
            const isLast = idx === doc.approvals.length - 1 && (doc.status === "APPROVED" || doc.status === "REJECTED");
            const isApprove = app.decision === "APPROVED";
            const isReject = app.decision === "REJECTED";

            return (
              <div key={app.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center border ${
                    isApprove
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                      : isReject
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                  }`}>
                    {isApprove ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isReject ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-border my-2" />}
                </div>

                <div className="space-y-1.5 pb-4 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm">
                      ขั้นตอนที่ {app.step}: {app.decision}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      โดย {app.reviewerName}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(app.reviewedAt).toLocaleString("th-TH")}
                    </span>
                  </div>

                  {app.comment && (
                    <div className="p-3 rounded-xl bg-muted/30 border text-xs leading-relaxed text-foreground/90">
                      <strong>ความเห็นผู้อนุมัติ:</strong> {app.comment}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* If still pending review */}
          {(doc.status === "SUBMITTED" || doc.status === "IN_REVIEW") && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/30 animate-pulse">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-primary">
                  ขั้นตอนที่ {doc.currentStep}: อยู่ระหว่างการพิจารณา
                </p>
                <p className="text-xs text-muted-foreground">
                  เจ้าหน้าที่หรืออาจารย์ผู้เกี่ยวข้องกำลังตรวจสอบรายละเอียด
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
