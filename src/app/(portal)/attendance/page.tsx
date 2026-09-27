import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext } from "@/features/identity/server";
import {
  getStudentAttendanceRecords,
  resolvePublicTenantId,
} from "@/features/attendance/server";
import { getT, getLocale } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { StatusPill } from "@/shared/components/liyon";
import {
  CalendarDays,
  Clock,
  ArrowLeft,
  QrCode,
} from "lucide-react";

export default async function StudentAttendancePage() {
  const session = await getSessionContext();
  if (!session) {
    redirect("/login?callbackUrl=/attendance");
  }

  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const records = tenantId
    ? await getStudentAttendanceRecords(tenantId, session.userId)
    : [];

  const total = records.length;
  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const lateCount = records.filter((r) => r.status === "LATE").length;
  const excusedCount = records.filter((r) => r.status === "EXCUSED").length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + excusedCount) / total) * 100) : 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>หน้าหลักคณะ</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t("attendance.myRecords")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            ประวัติการเช็คชื่อเข้าชั้นเรียนและสถิติความตรงต่อเวลาของ {session.userName}
          </p>
        </div>

        <Link
          href="/checkin"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-primary text-white hover:bg-primary/90 transition shadow-xs self-start sm:self-center"
        >
          <QrCode className="h-4 w-4" />
          <span>เช็คชื่อเข้าเรียนวันนี้ (Fast Check-in)</span>
        </Link>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-card border shadow-xs text-center space-y-1">
          <div className="text-xs text-muted-foreground font-medium">เข้าเรียนทั้งหมด</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{total}</div>
          <div className="text-[11px] text-muted-foreground">ครั้ง / คาบเรียน</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-xs text-center space-y-1">
          <div className="text-xs text-emerald-600 font-medium">มาตรงเวลา</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{presentCount}</div>
          <div className="text-[11px] text-muted-foreground">ครั้ง</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-xs text-center space-y-1">
          <div className="text-xs text-amber-600 font-medium">มาสาย</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{lateCount}</div>
          <div className="text-[11px] text-muted-foreground">ครั้ง</div>
        </div>

        <div className="p-5 rounded-2xl bg-card border shadow-xs text-center space-y-1">
          <div className="text-xs text-primary font-medium">อัตราการเข้าเรียน</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary">{attendanceRate}%</div>
          <div className="text-[11px] text-muted-foreground">เกณฑ์ผ่าน: 80%</div>
        </div>
      </div>

      {/* Attendance History Records */}
      <section className="p-6 rounded-3xl bg-card border shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">บันทึกเวลาเข้าเรียนล่าสุด</h2>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed text-muted-foreground">
            <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold">{t("attendance.empty")}</h3>
            <p className="text-xs mt-1">ยังไม่มีประวัติการเช็คชื่อเข้าเรียนในระบบ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((r) => {
              const tone =
                r.status === "PRESENT"
                  ? "ok"
                  : r.status === "LATE"
                  ? "warn"
                  : r.status === "EXCUSED"
                  ? "info"
                  : "bad";

              return (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-background px-2 py-0.5 rounded border">
                        {r.courseCode || "CPE"}
                      </span>
                      <span className="font-semibold text-sm">{r.courseName}</span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      หัวข้อ: <span className="text-foreground">{r.sessionTitle}</span>
                    </div>

                    <div className="text-[11px] text-muted-foreground flex items-center gap-3 pt-0.5">
                      <span>เวลาเช็คชื่อ: {formatDate(r.checkInTime, locale, { time: true })}</span>
                      <span>•</span>
                      <span>วิธีการ: {r.method}</span>
                      {r.note && (
                        <>
                          <span>•</span>
                          <span className="italic">{r.note}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="self-end sm:self-center">
                    <StatusPill tone={tone}>
                      {r.status === "PRESENT"
                        ? t("attendance.status.present")
                        : r.status === "LATE"
                        ? t("attendance.status.late")
                        : r.status === "EXCUSED"
                        ? t("attendance.status.excused")
                        : t("attendance.status.absent")}
                    </StatusPill>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
