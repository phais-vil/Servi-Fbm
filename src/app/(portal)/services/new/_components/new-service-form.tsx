"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { LiyonField, LiyonSelect } from "@/shared/components/liyon";
import { submitServiceRequestAction } from "@/features/services/actions";
import type { ServiceTypeDto } from "@/features/services";
import { Send, Sparkles, Building, Download } from "lucide-react";

interface NewServiceFormProps {
  serviceTypes: ServiceTypeDto[];
  defaultTypeId?: string;
  userDefaultName?: string;
}

export function NewServiceForm({
  serviceTypes,
  defaultTypeId,
  userDefaultName,
}: NewServiceFormProps) {
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [serviceTypeId, setServiceTypeId] = useState(
    defaultTypeId || serviceTypes[0]?.id || ""
  );
  const [deliveryMethod, setDeliveryMethod] = useState<"DIGITAL_ONLY" | "HARDCOPY_PICKUP" | "BOTH">("DIGITAL_ONLY");
  const [studentCode, setStudentCode] = useState("");
  const [studentName, setStudentName] = useState(userDefaultName || "");
  const [facultyMajor, setFacultyMajor] = useState("วิศวกรรมคอมพิวเตอร์ (Computer Engineering)");
  const [copiesCount, setCopiesCount] = useState(1);
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const selectedService = serviceTypes.find((s) => s.id === serviceTypeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentCode.trim()) {
      toast.error("กรุณาระบุรหัสนิสิต");
      return;
    }
    if (!studentName.trim()) {
      toast.error("กรุณาระบุชื่อ-นามสกุล");
      return;
    }

    startTransition(async () => {
      const res = await submitServiceRequestAction({
        serviceTypeId,
        deliveryMethod,
        studentCode: studentCode.trim(),
        studentName: studentName.trim(),
        facultyMajor: facultyMajor.trim(),
        copiesCount: Number(copiesCount),
        reason: reason.trim() || null,
        attachmentUrl: attachmentUrl.trim() || null,
      });

      if (res.ok) {
        toast.success(t("services.submitSuccess"));
        router.push("/services");
      } else {
        toast.error(res.error.message || "Failed to submit request");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-card border shadow-xs space-y-6">
      <LiyonField label={t("services.serviceType")}>
        <LiyonSelect
          value={serviceTypeId}
          onChange={(e) => setServiceTypeId(e.target.value)}
        >
          {serviceTypes.map((st) => (
            <option key={st.id} value={st.id}>
              {st.code}: {st.nameTh} {st.fee > 0 ? `(ค่าธรรมเนียม ฿${st.fee})` : ""}
            </option>
          ))}
        </LiyonSelect>
      </LiyonField>

      {selectedService && (
        <div className="p-4 rounded-2xl bg-muted/40 text-xs space-y-1.5 border">
          <div className="font-bold text-foreground">{selectedService.nameTh}</div>
          <div className="text-muted-foreground">{selectedService.description}</div>
          <div className="flex gap-4 pt-1 font-medium text-foreground">
            <span>ระยะเวลา: {selectedService.processingDays} วันทำการ</span>
            <span>•</span>
            <span>ค่าธรรมเนียม: {selectedService.fee > 0 ? `฿${selectedService.fee}` : "ไม่มีค่าธรรมเนียม"}</span>
          </div>
          {selectedService.requiredDocs && (
            <div className="text-primary pt-0.5">
              เอกสารที่ต้องเตรียม: {selectedService.requiredDocs}
            </div>
          )}
        </div>
      )}

      <LiyonField label={t("services.deliveryMethod")}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label
            onClick={() => setDeliveryMethod("DIGITAL_ONLY")}
            className={`cursor-pointer p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              deliveryMethod === "DIGITAL_ONLY"
                ? "border-primary bg-primary/5 text-primary font-bold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <Download className="h-5 w-5" />
            <span className="text-xs">{t("services.delivery.digital")}</span>
          </label>

          <label
            onClick={() => setDeliveryMethod("HARDCOPY_PICKUP")}
            className={`cursor-pointer p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              deliveryMethod === "HARDCOPY_PICKUP"
                ? "border-primary bg-primary/5 text-primary font-bold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <Building className="h-5 w-5" />
            <span className="text-xs">{t("services.delivery.pickup")}</span>
          </label>

          <label
            onClick={() => setDeliveryMethod("BOTH")}
            className={`cursor-pointer p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              deliveryMethod === "BOTH"
                ? "border-primary bg-primary/5 text-primary font-bold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs">{t("services.delivery.both")}</span>
          </label>
        </div>
      </LiyonField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LiyonField label={t("services.studentCode")}>
          <input
            type="text"
            required
            placeholder="เช่น 65010999"
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background"
          />
        </LiyonField>

        <LiyonField label={t("services.studentName")}>
          <input
            type="text"
            required
            placeholder="ชื่อและนามสกุลภาษาไทย"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background"
          />
        </LiyonField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LiyonField label={t("services.facultyMajor")}>
          <input
            type="text"
            required
            value={facultyMajor}
            onChange={(e) => setFacultyMajor(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background"
          />
        </LiyonField>

        <LiyonField label={t("services.copiesCount")}>
          <input
            type="number"
            min={1}
            max={10}
            value={copiesCount}
            onChange={(e) => setCopiesCount(Math.max(1, Number(e.target.value)))}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background"
          />
        </LiyonField>
      </div>

      <LiyonField label={t("services.reason")}>
        <textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ระบุวัตถุประสงค์ เช่น ยื่นขอต่อวีซ่า, สมัครงาน, ขอทุนการศึกษา..."
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </LiyonField>

      <LiyonField label={t("services.attachmentUrl")}>
        <input
          type="url"
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
          placeholder="https://drive.google.com/... (ถ้ามีเอกสารประกอบ)"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background"
        />
      </LiyonField>

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition shadow-xs disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        <span>{isPending ? "กำลังส่งคำขอ..." : t("services.newRequest")}</span>
      </button>
    </form>
  );
}
