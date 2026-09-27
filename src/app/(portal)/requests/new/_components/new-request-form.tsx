"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { LiyonField, LiyonSelect } from "@/shared/components/liyon";
import { submitRequestAction } from "@/features/documents/actions";
import { Send } from "lucide-react";

export function NewRequestForm() {
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [documentType, setDocumentType] = useState<"GENERAL" | "COURSE_ADD" | "LEAVE_ABSENCE" | "OVERLOAD_CREDITS" | "OTHER">("GENERAL");
  const [title, setTitle] = useState("");
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitRequestAction({
        documentType,
        title,
        reason,
        attachmentUrl: attachmentUrl.trim() || null,
        formData: {},
      });

      if (res.ok) {
        toast.success(t("documents.submitSuccess"));
        router.push(`/requests/${encodeURIComponent(res.data.trackingCode)}`);
      } else {
        toast.error(res.error.message || "Failed to submit petition");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card border shadow-xs space-y-5">
      <LiyonField label={t("documents.type")}>
        <LiyonSelect
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as "GENERAL" | "COURSE_ADD" | "LEAVE_ABSENCE" | "OVERLOAD_CREDITS" | "OTHER")}
        >
          <option value="GENERAL">{t("documents.type.general")}</option>
          <option value="COURSE_ADD">{t("documents.type.course_add")}</option>
          <option value="LEAVE_ABSENCE">{t("documents.type.leave_absence")}</option>
          <option value="OVERLOAD_CREDITS">{t("documents.type.overload_credits")}</option>
          <option value="OTHER">{t("documents.type.other")}</option>
        </LiyonSelect>
      </LiyonField>

      <LiyonField label={t("documents.titleField")}>
        <input
          type="text"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="เช่น ขอเปิดรายวิชา CPE-491 เพิ่มในภาคการศึกษา 1/2569"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
        />
      </LiyonField>

      <LiyonField label={t("documents.reasonField")}>
        <textarea
          rows={5}
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="ระบุเหตุผลความจำเป็น ความประสงค์ และรายละเอียดที่เกี่ยวข้องอย่างละเอียด..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          minLength={10}
        />
      </LiyonField>

      <LiyonField label={t("documents.attachmentUrl")}>
        <input
          type="url"
          className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="https://drive.google.com/... หรือ ลิงก์ไฟล์เอกสารแนบ"
          value={attachmentUrl}
          onChange={(e) => setAttachmentUrl(e.target.value)}
        />
      </LiyonField>

      <div className="pt-3 border-t flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 text-sm font-medium border rounded-xl hover:bg-muted transition"
        >
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={isPending || !title.trim() || reason.trim().length < 10}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>{isPending ? "กำลังบันทึก..." : "ส่งคำร้อง"}</span>
        </button>
      </div>
    </form>
  );
}
