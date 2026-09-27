import Link from "next/link";
import { getT, getLocale } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import {
  verifyCertificateByCode,
  resolvePublicTenantId,
} from "@/features/services/server";
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  User,
  GraduationCap,
  Award,
  Hash,
  CheckCircle2,
  Building,
} from "lucide-react";

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export default async function CertificateVerifyPage({ params }: VerifyPageProps) {
  const { code } = await params;
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const decodedCode = decodeURIComponent(code);
  const cert = tenantId ? await verifyCertificateByCode(tenantId, decodedCode) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("services.publicTitle")}</span>
        </Link>
      </div>

      {cert ? (
        /* Verified Authentic Credential Card */
        <div className="p-8 sm:p-10 rounded-3xl bg-card border-2 border-emerald-500/30 shadow-lg space-y-8 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Verification Badge */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="h-9 w-9" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                VERIFIED AUTHENTIC
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-foreground">
                {t("services.verifyValid")}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                เอกสารนี้ได้รับการตรวจสอบความถูกต้องและความสมบูรณ์จากระบบทะเบียนคณะ
              </p>
            </div>
          </div>

          {/* Certificate Information Breakdown */}
          <div className="divide-y divide-border border rounded-2xl bg-muted/20 overflow-hidden text-xs sm:text-sm">
            <div className="p-4 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                {t("services.certificateNumber")}
              </span>
              <span className="font-mono font-bold text-foreground">
                {cert.certificateNumber || cert.trackingCode}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                {t("services.serviceType")}
              </span>
              <span className="font-semibold text-foreground text-right">
                {locale === "en" ? cert.serviceTypeNameEn : cert.serviceTypeNameTh}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                ผู้ถือเอกสาร / นิสิต
              </span>
              <span className="font-semibold text-foreground">
                {cert.studentName} ({cert.studentCode})
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                {t("services.facultyMajor")}
              </span>
              <span className="font-semibold text-foreground text-right">
                {cert.facultyMajor}
              </span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                {t("services.issuedAt")}
              </span>
              <span className="font-medium text-foreground">
                {formatDate(cert.issuedAt || cert.createdAt, locale, { time: true })}
              </span>
            </div>

            {cert.expiresAt && (
              <div className="p-4 flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {t("services.expiresAt")}
                </span>
                <span className="font-medium text-foreground">
                  {formatDate(cert.expiresAt, locale)}
                </span>
              </div>
            )}

            <div className="p-4 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                {t("services.issuerName")}
              </span>
              <span className="font-medium text-foreground text-right">
                {cert.issuerName || "ฝ่ายบริการการศึกษาและทะเบียน คณะวิศวกรรมศาสตร์"}
              </span>
            </div>
          </div>

          {/* Cryptographic Proof Fingerprint */}
          {cert.verificationHash && (
            <div className="p-4 rounded-xl bg-muted/40 text-[11px] font-mono text-muted-foreground break-all space-y-1 border">
              <div className="font-bold text-foreground font-sans">
                Cryptographic Signature / SHA-256 Fingerprint:
              </div>
              <div>{cert.verificationHash}</div>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-xs"
            >
              <span>กลับหน้าหลักบริการนิสิต</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Not Found / Unverified Card */
        <div className="p-8 sm:p-10 rounded-3xl bg-card border-2 border-destructive/20 shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-destructive/15 text-destructive">
              INVALID OR NOT FOUND
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("services.verifyNotFound")}
            </h1>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              ไม่พบรหัสเอกสาร <span className="font-mono font-bold text-foreground">&ldquo;{decodedCode}&rdquo;</span> ในฐานข้อมูลที่ผ่านการอนุมัติ กรุณาตรวจสอบรหัสอีกครั้ง
            </p>
          </div>

          {/* Search box to re-try */}
          <div className="max-w-md mx-auto pt-2">
            <form action="/verify" method="GET" className="flex items-center gap-2 p-1.5 rounded-2xl border bg-muted/20">
              <input
                type="text"
                name="code"
                defaultValue={decodedCode}
                placeholder="กรอกรหัสใหม่อีกครั้ง เช่น CERT-202609-0001"
                className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition shadow-xs"
              >
                ค้นหา
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
