"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { FileText, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
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
import { reviewRequestAction } from "@/features/documents/actions";
import type { DocumentRequestDto } from "@/features/documents";

interface DocumentClientProps {
  initialDocs: DocumentRequestDto[];
  canManage: boolean;
}

type DialogState =
  | { mode: "closed" }
  | { mode: "review"; item: DocumentRequestDto };

export function DocumentClient({ initialDocs, canManage: _canManage }: DocumentClientProps) {
  const t = useT();
  const [items, setItems] = useState<DocumentRequestDto[]>(initialDocs);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [isPending, startTransition] = useTransition();

  // Filters
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Review Form State
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | "CHANGES_REQUESTED">("APPROVED");
  const [comment, setComment] = useState("");

  const openReviewDialog = (doc: DocumentRequestDto) => {
    setDecision("APPROVED");
    setComment("");
    setDialog({ mode: "review", item: doc });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog.mode !== "review") return;

    startTransition(async () => {
      const res = await reviewRequestAction({
        documentId: dialog.item.id,
        decision,
        comment: comment.trim() || null,
      });

      if (res.ok) {
        setItems((prev) => prev.map((it) => (it.id === dialog.item.id ? res.data : it)));
        setDialog({ mode: "closed" });
        toast.success(t("documents.reviewSuccess"));
      } else {
        toast.error(res.error.message || "Failed to record review");
      }
    });
  };

  const filteredItems = items.filter((item) => {
    if (selectedStatus !== "ALL" && item.status !== selectedStatus) return false;
    if (selectedType !== "ALL" && item.documentType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = item.trackingCode.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchRequester = item.requesterName.toLowerCase().includes(q) || item.requesterEmail.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchRequester) return false;
    }
    return true;
  });

  const columns: DataTableColumn<DocumentRequestDto>[] = [
    {
      key: "code",
      header: t("documents.trackingCode"),
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono font-bold text-xs">{row.trackingCode}</span>
          <span className="text-xs text-muted-foreground">{row.documentType}</span>
        </div>
      ),
    },
    {
      key: "title",
      header: t("documents.titleField"),
      render: (row) => (
        <div className="flex flex-col max-w-md">
          <span className="font-semibold text-sm line-clamp-1">{row.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{row.reason}</span>
        </div>
      ),
    },
    {
      key: "requester",
      header: t("documents.requester"),
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-foreground">{row.requesterName}</span>
          <span className="text-muted-foreground">{row.requesterEmail}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("documents.status"),
      render: (row) => {
        const tone = row.status === "APPROVED" ? "ok" : row.status === "REJECTED" ? "bad" : "info";
        return (
          <StatusPill tone={tone}>
            {row.status}
          </StatusPill>
        );
      },
    },
    {
      key: "date",
      header: "วันที่ยื่น",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString("th-TH")}
        </span>
      ),
    },
  ];

  const renderRowMenu = (row: DocumentRequestDto) => (
    <>
      <RowMenuItem
        onSelect={() => openReviewDialog(row)}
        icon={<CheckCircle2 className="h-4 w-4" />}
      >
        {t("documents.review")}
      </RowMenuItem>
      <RowMenuItem
        onSelect={() => window.open(`/requests/${encodeURIComponent(row.trackingCode)}`, "_blank")}
        icon={<ExternalLink className="h-4 w-4" />}
      >
        <span>{t("documents.timeline")}</span>
      </RowMenuItem>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("documents.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("documents.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/requests"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Portal คำร้อง</span>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
            placeholder={t("documents.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <LiyonSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">{t("documents.statusAll")}</option>
            <option value="SUBMITTED">{t("documents.status.submitted")}</option>
            <option value="IN_REVIEW">{t("documents.status.in_review")}</option>
            <option value="APPROVED">{t("documents.status.approved")}</option>
            <option value="REJECTED">{t("documents.status.rejected")}</option>
            <option value="CANCELLED">{t("documents.status.cancelled")}</option>
          </LiyonSelect>
        </div>

        <div className="w-full sm:w-48">
          <LiyonSelect
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="ALL">{t("documents.typeAll")}</option>
            <option value="GENERAL">{t("documents.type.general")}</option>
            <option value="COURSE_ADD">{t("documents.type.course_add")}</option>
            <option value="LEAVE_ABSENCE">{t("documents.type.leave_absence")}</option>
            <option value="OVERLOAD_CREDITS">{t("documents.type.overload_credits")}</option>
            <option value="OTHER">{t("documents.type.other")}</option>
          </LiyonSelect>
        </div>
      </div>

      {/* DataTable */}
      <DataTable<DocumentRequestDto>
        state={filteredItems.length === 0 ? "empty" : "data"}
        headHeading={
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-semibold">{t("documents.title")}</span>
            <span className="text-xs text-muted-foreground">({filteredItems.length})</span>
          </div>
        }
        rows={filteredItems}
        columns={columns}
        getRowId={(row) => row.id}
        renderRowMenu={renderRowMenu}
        empty={{
          title: t("documents.empty"),
          description: t("documents.subtitle"),
          icon: <FileText className="h-8 w-8 text-muted-foreground" />,
        }}
        error={{
          title: "Error loading petitions",
          description: "Please refresh the page",
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
        }}
      />

      {/* Review Dialog */}
      <LiyonDialog
        open={dialog.mode === "review"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        wide
      >
        <LiyonDialogHeader
          title={t("documents.reviewTitle")}
          description={dialog.mode === "review" ? `${dialog.item.trackingCode} - ${dialog.item.title}` : undefined}
        />
        <LiyonDialogCloseButton label={t("common.cancel")} />

        {dialog.mode === "review" && (
          <form onSubmit={handleReviewSubmit}>
            <LiyonDialogBody className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="p-4 rounded-xl bg-muted/40 border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold">ผู้ยื่นคำร้อง: {dialog.item.requesterName}</span>
                  <span className="text-muted-foreground">{new Date(dialog.item.createdAt).toLocaleString("th-TH")}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{dialog.item.title}</p>
                <p className="text-muted-foreground whitespace-pre-line">{dialog.item.reason}</p>
              </div>

              <LiyonField label="ผลการพิจารณา (Decision)">
                <LiyonSelect
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as "APPROVED" | "REJECTED" | "CHANGES_REQUESTED")}
                >
                  <option value="APPROVED">{t("documents.decision.approved")} (Approve)</option>
                  <option value="REJECTED">{t("documents.decision.rejected")} (Reject)</option>
                  <option value="CHANGES_REQUESTED">{t("documents.decision.changes_requested")} (Request Changes)</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("documents.comment")}>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  placeholder="ระบุข้อคิดเห็น หรือเหตุผลประกอบการพิจารณา..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </LiyonField>
            </LiyonDialogBody>

            <LiyonDialogFooter>
              <button
                type="button"
                onClick={() => setDialog({ mode: "closed" })}
                className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
              >
                {isPending ? "..." : "บันทึกผลการพิจารณา"}
              </button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>
    </div>
  );
}
