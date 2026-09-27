"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  DataTable,
  type DataTableColumn,
  RowMenuItem,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { reviewServiceRequestAction } from "@/features/services/actions";
import type { ServiceRequestDto, ServiceTypeDto } from "@/features/services";

interface ServicesAdminClientProps {
  initialRequests: ServiceRequestDto[];
  serviceTypes: ServiceTypeDto[];
  canManage: boolean;
}

type DialogState =
  | { mode: "closed" }
  | { mode: "review"; item: ServiceRequestDto };

export function ServicesAdminClient({
  initialRequests,
  serviceTypes: _serviceTypes,
  canManage,
}: ServicesAdminClientProps) {
  const t = useT();
  const locale = useLocale();

  const [requests, setRequests] = useState<ServiceRequestDto[]>(initialRequests);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [isPending, startTransition] = useTransition();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Review Dialog State
  const [reviewStatus, setReviewStatus] = useState<
    "APPROVED" | "REJECTED" | "READY_FOR_PICKUP" | "COMPLETED"
  >("APPROVED");
  const [reviewNote, setReviewNote] = useState("");
  const [pickupLocation, setPickupLocation] = useState("ห้องบริการการศึกษา อาคาร 1 ชั้น 2");

  const openReviewDialog = (item: ServiceRequestDto) => {
    setReviewStatus(
      item.deliveryMethod === "HARDCOPY_PICKUP" || item.deliveryMethod === "BOTH"
        ? "READY_FOR_PICKUP"
        : "APPROVED"
    );
    setReviewNote(item.reviewNote || "");
    setPickupLocation(item.pickupLocation || "ห้องบริการการศึกษา อาคาร 1 ชั้น 2");
    setDialog({ mode: "review", item });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog.mode !== "review") return;

    startTransition(async () => {
      const res = await reviewServiceRequestAction({
        requestId: dialog.item.id,
        status: reviewStatus,
        reviewNote: reviewNote.trim() || null,
        pickupLocation:
          reviewStatus === "READY_FOR_PICKUP" ? pickupLocation.trim() || null : null,
      });

      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
        setDialog({ mode: "closed" });
        toast.success(t("services.reviewSuccess"));
      } else {
        toast.error(res.error.message || "Failed to update review status");
      }
    });
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = r.trackingCode.toLowerCase().includes(q);
      const matchStdCode = r.studentCode.toLowerCase().includes(q);
      const matchName = r.studentName.toLowerCase().includes(q);
      const matchCertNo = (r.certificateNumber?.toLowerCase() || "").includes(q);
      if (!matchCode && !matchStdCode && !matchName && !matchCertNo) return false;
    }
    return true;
  });

  const columns: DataTableColumn<ServiceRequestDto>[] = [
    {
      key: "code",
      header: t("services.trackingCode"),
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono font-bold text-xs">{row.trackingCode}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {locale === "en" ? row.serviceTypeNameEn : row.serviceTypeNameTh}
          </span>
        </div>
      ),
    },
    {
      key: "student",
      header: "นิสิตผู้ขอ",
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-foreground">{row.studentName}</span>
          <span className="text-muted-foreground">
            {row.studentCode} • {row.facultyMajor}
          </span>
        </div>
      ),
    },
    {
      key: "delivery",
      header: "รูปแบบรับเอกสาร",
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium">
            {row.deliveryMethod === "DIGITAL_ONLY"
              ? "ดิจิทัล"
              : row.deliveryMethod === "HARDCOPY_PICKUP"
              ? "รับที่เคาน์เตอร์"
              : "ทั้ง 2 รูปแบบ"}
          </span>
          <span className="text-muted-foreground text-[11px]">{row.copiesCount} ฉบับ</span>
        </div>
      ),
    },
    {
      key: "credential",
      header: "หนังสือรับรอง / QR",
      render: (row) => (
        <div className="flex flex-col text-xs">
          {row.certificateNumber ? (
            <Link
              href={`/verify/${row.certificateNumber}`}
              target="_blank"
              className="inline-flex items-center gap-1 font-mono font-bold text-emerald-600 hover:underline"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{row.certificateNumber}</span>
            </Link>
          ) : (
            <span className="text-muted-foreground text-[11px]">ยังไม่ออกเอกสาร</span>
          )}
          {row.issuedAt && (
            <span className="text-muted-foreground text-[11px]">
              ออกเมื่อ {formatDate(row.issuedAt, locale)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("services.status"),
      render: (row) => {
        const tone =
          row.status === "APPROVED" || row.status === "COMPLETED"
            ? "ok"
            : row.status === "REJECTED"
            ? "bad"
            : row.status === "CANCELLED"
            ? "off"
            : row.status === "READY_FOR_PICKUP"
            ? "info"
            : "warn";

        const label =
          row.status === "APPROVED"
            ? t("services.status.approved")
            : row.status === "READY_FOR_PICKUP"
            ? t("services.status.ready_for_pickup")
            : row.status === "REJECTED"
            ? t("services.status.rejected")
            : row.status === "COMPLETED"
            ? t("services.status.completed")
            : row.status === "CANCELLED"
            ? t("services.status.cancelled")
            : t("services.status.pending");

        return <StatusPill tone={tone}>{label}</StatusPill>;
      },
    },
    {
      key: "date",
      header: "วันที่ยื่น",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.createdAt, locale)}
        </span>
      ),
    },
  ];

  const renderRowMenu = (row: ServiceRequestDto) => (
    <>
      {canManage && (
        <RowMenuItem
          onSelect={() => openReviewDialog(row)}
          icon={<CheckCircle2 className="h-4 w-4" />}
        >
          {t("services.review")}
        </RowMenuItem>
      )}
      {row.certificateNumber && (
        <RowMenuItem
          onSelect={() => window.open(`/verify/${row.certificateNumber}`, "_blank")}
          icon={<ExternalLink className="h-4 w-4" />}
        >
          <span>ตรวจสอบใบรับรอง (Verify)</span>
        </RowMenuItem>
      )}
    </>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("services.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("services.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/services"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-xl hover:bg-muted transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Portal บริการนิสิต</span>
          </Link>
          <Link
            href="/verify"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-xl hover:bg-muted transition text-emerald-600"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>หน้าตรวจสอบความถูกต้อง</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-xl text-sm bg-background"
            placeholder={t("services.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56">
          <LiyonSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="PENDING">{t("services.status.pending")}</option>
            <option value="APPROVED">{t("services.status.approved")}</option>
            <option value="READY_FOR_PICKUP">{t("services.status.ready_for_pickup")}</option>
            <option value="REJECTED">{t("services.status.rejected")}</option>
            <option value="COMPLETED">{t("services.status.completed")}</option>
            <option value="CANCELLED">{t("services.status.cancelled")}</option>
          </LiyonSelect>
        </div>
      </div>

      {/* DataTable */}
      <DataTable<ServiceRequestDto>
        state={filteredRequests.length === 0 ? "empty" : "data"}
        headHeading={
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="font-semibold">รายการคำขอรับบริการและหนังสือรับรอง</span>
            <span className="text-xs text-muted-foreground">({filteredRequests.length})</span>
          </div>
        }
        rows={filteredRequests}
        columns={columns}
        getRowId={(row) => row.id}
        renderRowMenu={renderRowMenu}
        empty={{
          title: t("services.empty"),
          description: "ยังไม่มีคำขอรับบริการเข้ามาในระบบ",
          icon: <Award className="h-8 w-8 text-muted-foreground" />,
        }}
        error={{
          title: "Error loading service requests",
          description: "Please refresh the page",
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
        }}
      />

      {/* Review & Issue Dialog */}
      <LiyonDialog
        open={dialog.mode === "review"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        wide
      >
        <LiyonDialogHeader
          title={t("services.review")}
          description="ตรวจสอบคุณสมบัติ อนุมัติการออกหนังสือรับรองดิจิทัล และแจ้งจุดรับเอกสารฉบับจริง"
        />
        {dialog.mode === "review" && (
          <form onSubmit={handleReviewSubmit}>
            <LiyonDialogBody className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 text-xs space-y-1.5 border">
                <div className="font-bold text-sm text-foreground">
                  {dialog.item.serviceTypeNameTh} ({dialog.item.trackingCode})
                </div>
                <div className="text-muted-foreground">
                  นิสิต: <span className="font-medium text-foreground">{dialog.item.studentName}</span> (รหัส: {dialog.item.studentCode})
                </div>
                <div className="text-muted-foreground">
                  สาขาวิชา: <span className="font-medium text-foreground">{dialog.item.facultyMajor}</span>
                </div>
                <div className="text-muted-foreground">
                  รูปแบบที่ต้องการ: <span className="font-medium text-foreground">{dialog.item.deliveryMethod}</span> ({dialog.item.copiesCount} ชุด)
                </div>
                {dialog.item.reason && (
                  <div className="text-muted-foreground">
                    วัตถุประสงค์: <span className="italic">{dialog.item.reason}</span>
                  </div>
                )}
                {dialog.item.attachmentUrl && (
                  <div className="pt-1">
                    <a
                      href={dialog.item.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      เปิดดูเอกสารแนบประกอบ
                    </a>
                  </div>
                )}
              </div>

              <LiyonField label={t("services.reviewDecision")}>
                <LiyonSelect
                  value={reviewStatus}
                  onChange={(e) =>
                    setReviewStatus(
                      e.target.value as "APPROVED" | "REJECTED" | "READY_FOR_PICKUP" | "COMPLETED"
                    )
                  }
                >
                  <option value="APPROVED">{t("services.approve")}</option>
                  <option value="READY_FOR_PICKUP">{t("services.markReady")}</option>
                  <option value="COMPLETED">{t("services.markCompleted")}</option>
                  <option value="REJECTED">{t("services.reject")}</option>
                </LiyonSelect>
              </LiyonField>

              {reviewStatus === "READY_FOR_PICKUP" && (
                <LiyonField label={t("services.pickupLocation")}>
                  <input
                    type="text"
                    required
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="เช่น ห้องบริการการศึกษา อาคาร 1 ชั้น 2 (จันทร์-ศุกร์ 08:30 - 16:30)"
                    className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                  />
                </LiyonField>
              )}

              <LiyonField label={t("services.reviewNote")}>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="ข้อความแจ้งนิสิต เช่น อนุมัติการออกหนังสือรับรองเรียบร้อย / หรือเหตุผลที่ปฏิเสธ..."
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </LiyonField>
            </LiyonDialogBody>
            <LiyonDialogFooter>
              <LiyonDialogCloseButton label="ยกเลิก" />
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isPending ? "กำลังบันทึก..." : "บันทึกผลการพิจารณา"}
              </button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>
    </div>
  );
}
