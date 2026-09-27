"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { LiyonField } from "@/shared/components/liyon";
import { submitCheckInAction } from "@/features/attendance/actions";
import type { AttendanceRecordDto } from "@/features/attendance";
import { CheckCircle2, Clock, QrCode } from "lucide-react";
import Link from "next/link";

interface FastCheckinFormProps {
  userDefaultName?: string;
  userEmail?: string;
}

export function FastCheckinForm({
  userDefaultName = "",
  userEmail = "",
}: FastCheckinFormProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [pin, setPin] = useState("");
  const [studentCode, setStudentCode] = useState(
    userEmail.split("@")[0] || ""
  );
  const [studentName, setStudentName] = useState(userDefaultName);
  const [record, setRecord] = useState<AttendanceRecordDto | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length < 4) {
      toast.error(t("attendance.validation.pinMin") || "PIN must be at least 4 digits");
      return;
    }
    if (!studentCode.trim() || !studentName.trim()) {
      toast.error("กรุณาระบุรหัสนิสิตและชื่อ-นามสกุล");
      return;
    }

    startTransition(async () => {
      const res = await submitCheckInAction({
        pin: pin.trim(),
        studentCode: studentCode.trim(),
        studentName: studentName.trim(),
      });

      if (res.ok) {
        setRecord(res.data);
        toast.success(t("attendance.checkInSuccess"));
      } else {
        toast.error(res.error.message || "Failed to check in");
      }
    });
  };

  if (record) {
    return (
      <div className="p-8 sm:p-10 rounded-3xl bg-card border-2 border-emerald-500/30 shadow-lg text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700">
            CHECK-IN SUCCESSFUL
          </span>
          <h2 className="text-2xl font-bold tracking-tight mt-2 text-foreground">
            {t("attendance.checkInSuccess")}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            บันทึกเวลาเข้าชั้นเรียนของคุณในฐานข้อมูลเรียบร้อยแล้ว
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-muted/30 border divide-y divide-border text-xs sm:text-sm text-left">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">วิชา / รายวิชา</span>
            <span className="font-semibold text-foreground">
              {record.courseCode} - {record.courseName}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">หัวข้อคาบเรียน</span>
            <span className="font-medium text-foreground">{record.sessionTitle}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">นิสิต</span>
            <span className="font-medium text-foreground">
              {record.studentName} ({record.studentCode})
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground">สถานะ</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                record.status === "PRESENT"
                  ? "bg-emerald-500/15 text-emerald-700"
                  : "bg-amber-500/15 text-amber-700"
              }`}
            >
              {record.status === "PRESENT"
                ? t("attendance.status.present")
                : t("attendance.status.late")}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/attendance"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-xs"
          >
            <Clock className="h-4 w-4" />
            <span>ดูประวัติการเข้าเรียนทั้งหมด</span>
          </Link>
          <button
            onClick={() => {
              setRecord(null);
              setPin("");
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold border hover:bg-muted transition"
          >
            <span>เช็คชื่อวิชาอื่น</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-card border shadow-md space-y-6"
    >
      <div className="text-center space-y-1 pb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
          <QrCode className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">เช็คชื่อเข้าชั้นเรียน</h2>
        <p className="text-xs text-muted-foreground">
          ดูรหัส PIN 4 หลัก จากหน้าจอโปรเจกเตอร์ของผู้สอนในห้องเรียน
        </p>
      </div>

      {/* Large PIN Input */}
      <div className="space-y-2 text-center">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t("attendance.enterPin")}
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••"
          className="w-full text-center tracking-[0.5em] text-3xl sm:text-4xl font-mono font-extrabold py-4 rounded-2xl border-2 bg-muted/20 focus:outline-none focus:border-primary focus:bg-background transition"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LiyonField label={t("attendance.studentCode")}>
          <input
            type="text"
            required
            placeholder="เช่น 65010999"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background"
          />
        </LiyonField>

        <LiyonField label={t("attendance.studentName")}>
          <input
            type="text"
            required
            placeholder="ชื่อและนามสกุล"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background"
          />
        </LiyonField>
      </div>

      <button
        type="submit"
        disabled={isPending || pin.length < 4}
        className="w-full py-3.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition shadow-md disabled:opacity-50"
      >
        {isPending ? "กำลังตรวจสอบและบันทึกเวลา..." : t("attendance.submitCheckIn")}
      </button>

      <div className="text-center pt-2">
        <Link
          href="/attendance"
          className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
        >
          ดูประวัติการเข้าเรียนของฉัน
        </Link>
      </div>
    </form>
  );
}
