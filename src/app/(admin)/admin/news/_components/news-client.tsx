"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Pin, Pencil, Trash2, ExternalLink, Newspaper, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  DataTable,
  type DataTableColumn,
  RowMenuItem,
  StatusPill,
  type StatusPillTone,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import {
  createNewsAction,
  updateNewsAction,
  deleteNewsAction,
  togglePinNewsAction,
} from "@/features/news/actions";
import type { NewsArticleDto } from "@/features/news";

interface NewsClientProps {
  initialNews: NewsArticleDto[];
  canManage: boolean;
  canPublish: boolean;
  canDelete: boolean;
}

type DialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; item: NewsArticleDto }
  | { mode: "delete"; item: NewsArticleDto };

export function NewsClient({ initialNews, canManage, canPublish, canDelete }: NewsClientProps) {
  const t = useT();
  const [items, setItems] = useState<NewsArticleDto[]>(initialNews);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [status, setStatus] = useState("DRAFT");
  const [isPinned, setIsPinned] = useState(false);

  const openCreateDialog = () => {
    setTitle("");
    setSlug("");
    setSummary("");
    setContent("");
    setCoverImage("");
    setCategory("GENERAL");
    setStatus("DRAFT");
    setIsPinned(false);
    setDialog({ mode: "create" });
  };

  const openEditDialog = (item: NewsArticleDto) => {
    setTitle(item.title);
    setSlug(item.slug);
    setSummary(item.summary ?? "");
    setContent(item.content);
    setCoverImage(item.coverImage ?? "");
    setCategory(item.category);
    setStatus(item.status);
    setIsPinned(item.isPinned);
    setDialog({ mode: "edit", item });
  };

  const openDeleteDialog = (item: NewsArticleDto) => {
    setDialog({ mode: "delete", item });
  };

  const handleSave = () => {
    startTransition(async () => {
      if (dialog.mode === "create") {
        const res = await createNewsAction({
          title,
          slug: slug.trim() || undefined,
          summary: summary.trim() || undefined,
          content,
          coverImage: coverImage.trim() || undefined,
          category,
          status,
          isPinned,
        });

        if (res.ok) {
          toast.success(t("news.createSuccess"));
          setItems((prev) => [res.data, ...prev]);
          setDialog({ mode: "closed" });
        } else {
          toast.error(res.error.message || "Failed to create article");
        }
      } else if (dialog.mode === "edit") {
        const res = await updateNewsAction({
          id: dialog.item.id,
          title,
          slug: slug.trim() || dialog.item.slug,
          summary: summary.trim() || undefined,
          content,
          coverImage: coverImage.trim() || undefined,
          category,
          status,
          isPinned,
        });

        if (res.ok) {
          toast.success(t("news.updateSuccess"));
          setItems((prev) => prev.map((i) => (i.id === res.data.id ? res.data : i)));
          setDialog({ mode: "closed" });
        } else {
          toast.error(res.error.message || "Failed to update article");
        }
      }
    });
  };

  const handleDelete = () => {
    if (dialog.mode !== "delete") return;
    const { item } = dialog;
    startTransition(async () => {
      const res = await deleteNewsAction(item.id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setDialog({ mode: "closed" });
      } else {
        toast.error(res.error.message || "Failed to delete article");
      }
    });
  };

  const handleTogglePin = (item: NewsArticleDto) => {
    startTransition(async () => {
      const res = await togglePinNewsAction(item.id);
      if (res.ok) {
        toast.success(res.data ? t("news.pinned") : t("news.unpin"));
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isPinned: res.data } : i))
        );
      } else {
        toast.error(res.error.message || "Failed to toggle pin");
      }
    });
  };

  const getStatusTone = (st: string): StatusPillTone => {
    switch (st) {
      case "PUBLISHED":
        return "ok";
      case "DRAFT":
        return "warn";
      case "ARCHIVED":
        return "off";
      default:
        return "info";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "ACADEMIC":
        return t("news.category.academic");
      case "EVENT":
        return t("news.category.event");
      case "SCHOLARSHIP":
        return t("news.category.scholarship");
      default:
        return t("news.category.general");
    }
  };

  const columns: DataTableColumn<NewsArticleDto>[] = [
    {
      key: "title",
      header: t("news.titleField"),
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 font-medium">
            {row.isPinned && (
              <span className="inline-flex items-center text-amber-500" title={t("news.pinned")}>
                <Pin className="h-3.5 w-3.5 fill-amber-500" />
              </span>
            )}
            <span>{row.title}</span>
          </div>
          <span className="text-xs text-muted-foreground">{row.slug}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: t("news.categoryField"),
      render: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted">
          {getCategoryLabel(row.category)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("news.statusField"),
      render: (row) => (
        <StatusPill tone={getStatusTone(row.status)}>
          {row.status === "PUBLISHED"
            ? t("news.status.published")
            : row.status === "DRAFT"
            ? t("news.status.draft")
            : t("news.status.archived")}
        </StatusPill>
      ),
    },
    {
      key: "views",
      header: t("news.views"),
      className: "num",
      render: (row) => <span className="text-xs text-muted-foreground">{row.viewCount}</span>,
    },
    {
      key: "createdAt",
      header: t("news.publishedAtField"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.publishedAt ? new Date(row.publishedAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
  ];

  const renderRowMenu = (row: NewsArticleDto) => {
    return (
      <>
        {row.status === "PUBLISHED" && (
          <RowMenuItem
            onSelect={() => window.open(`/news/${row.slug}`, "_blank")}
            icon={<ExternalLink className="h-4 w-4" />}
          >
            {t("news.readMore")}
          </RowMenuItem>
        )}
        {canPublish && (
          <RowMenuItem
            onSelect={() => handleTogglePin(row)}
            icon={<Pin className="h-4 w-4" />}
          >
            {row.isPinned ? t("news.unpin") : t("news.pin")}
          </RowMenuItem>
        )}
        {canManage && (
          <RowMenuItem
            onSelect={() => openEditDialog(row)}
            icon={<Pencil className="h-4 w-4" />}
          >
            {t("news.edit")}
          </RowMenuItem>
        )}
        {canDelete && (
          <RowMenuItem
            onSelect={() => openDeleteDialog(row)}
            danger
            icon={<Trash2 className="h-4 w-4" />}
          >
            {t("news.delete")}
          </RowMenuItem>
        )}
      </>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("news.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("news.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/news"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Public Portal</span>
          </Link>
          {canManage && (
            <button
              type="button"
              onClick={openCreateDialog}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{t("news.create")}</span>
            </button>
          )}
        </div>
      </div>

      <DataTable
        state={items.length === 0 ? "empty" : "data"}
        rows={items}
        columns={columns}
        getRowId={(row) => row.id}
        renderRowMenu={canManage || canPublish || canDelete ? renderRowMenu : undefined}
        headHeading={
          <div className="flex items-center gap-2">
            <span className="font-semibold">{t("news.title")}</span>
            <span className="text-xs text-muted-foreground">({items.length})</span>
          </div>
        }
        empty={{
          icon: <Newspaper className="h-8 w-8 text-muted-foreground" />,
          title: t("news.empty"),
          description: t("news.subtitle"),
        }}
        error={{
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: "Error loading news",
          description: "Please refresh the page",
        }}
      />

      {/* Create / Edit Dialog */}
      <LiyonDialog
        open={dialog.mode === "create" || dialog.mode === "edit"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        wide
      >
        <LiyonDialogHeader
          title={dialog.mode === "create" ? t("news.create") : t("news.edit")}
          description={t("news.subtitle")}
        />
        <LiyonDialogCloseButton label={t("news.cancel")} />
        <LiyonDialogBody className="space-y-4">
          <LiyonField label={t("news.titleField")} htmlFor="news-title">
            <input
              id="news-title"
              type="text"
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("news.titleField")}
              required
            />
          </LiyonField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label={t("news.categoryField")} htmlFor="news-category">
              <LiyonSelect
                id="news-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="GENERAL">{t("news.category.general")}</option>
                <option value="ACADEMIC">{t("news.category.academic")}</option>
                <option value="EVENT">{t("news.category.event")}</option>
                <option value="SCHOLARSHIP">{t("news.category.scholarship")}</option>
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("news.statusField")} htmlFor="news-status">
              <LiyonSelect
                id="news-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DRAFT">{t("news.status.draft")}</option>
                <option value="PUBLISHED">{t("news.status.published")}</option>
                <option value="ARCHIVED">{t("news.status.archived")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          <LiyonField label={t("news.summaryField")} htmlFor="news-summary">
            <textarea
              id="news-summary"
              rows={2}
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={t("news.summaryField")}
            />
          </LiyonField>

          <LiyonField label={t("news.contentField")} htmlFor="news-content">
            <textarea
              id="news-content"
              rows={6}
              className="w-full px-3 py-2 border rounded-md text-sm font-sans"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("news.contentField")}
              required
            />
          </LiyonField>

          <LiyonField label={t("news.coverImageField")} htmlFor="news-cover">
            <input
              id="news-cover"
              type="url"
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </LiyonField>

          {canPublish && (
            <LiyonSwitchRow
              id="news-pinned-toggle"
              checked={isPinned}
              onCheckedChange={setIsPinned}
              label={t("news.pinnedField")}
              description={t("news.pinned")}
            />
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            className="px-4 py-2 border rounded-md text-sm hover:bg-muted"
            onClick={() => setDialog({ mode: "closed" })}
            disabled={isPending}
          >
            {t("news.cancel")}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            onClick={handleSave}
            disabled={isPending || title.trim().length < 3 || content.trim().length < 5}
          >
            {isPending ? "..." : t("news.save")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        danger
      >
        <LiyonDialogHeader
          title={t("news.delete")}
          description={dialog.mode === "delete" ? dialog.item.title : undefined}
        />
        <LiyonDialogCloseButton label={t("news.cancel")} />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">{t("news.deleteConfirm")}</p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            className="px-4 py-2 border rounded-md text-sm hover:bg-muted"
            onClick={() => setDialog({ mode: "closed" })}
            disabled={isPending}
          >
            {t("news.cancel")}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-destructive text-white rounded-md text-sm font-medium hover:bg-destructive/90 disabled:opacity-50"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "..." : t("news.delete")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
