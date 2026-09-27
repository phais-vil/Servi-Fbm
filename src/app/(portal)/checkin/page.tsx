import { getSessionContext } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { FastCheckinForm } from "./_components/fast-checkin-form";
import Link from "next/link";
import { LogIn, ArrowLeft } from "lucide-react";

export default async function FastCheckinPage() {
  const session = await getSessionContext();
  const t = await getT();

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>หน้าหลักคณะ</span>
        </Link>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t("attendance.publicTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          {t("attendance.publicSubtitle")}
        </p>
      </div>

      {session ? (
        <FastCheckinForm
          userDefaultName={session.userName}
          userEmail={session.email}
        />
      ) : (
        <div className="p-8 rounded-3xl bg-card border shadow-md text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <LogIn className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold tracking-tight">เข้าสู่ระบบเพื่อเช็คชื่อ</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              กรุณาเข้าสู่ระบบด้วยบัญชีมหาวิทยาลัย เพื่อให้ระบบสามารถบันทึกประวัติการเข้าเรียนลงในรหัสนิสิตของคุณได้อย่างถูกต้อง
            </p>
          </div>
          <Link
            href="/login?callbackUrl=/checkin"
            className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition shadow-xs"
          >
            <LogIn className="h-4 w-4" />
            <span>เข้าสู่ระบบ (Sign In to Check-in)</span>
          </Link>
        </div>
      )}
    </div>
  );
}
