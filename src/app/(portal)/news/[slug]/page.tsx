import { notFound } from "next/navigation";
import Link from "next/link";
import { getT, getLocale } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { getNewsBySlug, resolvePublicTenantId } from "@/features/news/server";
import { Calendar, Eye, User, ArrowLeft, Pin } from "lucide-react";

interface NewsDetailProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params;
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  if (!tenantId) notFound();

  const article = await getNewsBySlug(tenantId, decodeURIComponent(slug));
  if (!article) notFound();

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

  return (
    <article className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("news.backToList")}</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary">
            {getCategoryLabel(article.category)}
          </span>
          {article.isPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Pin className="h-3 w-3 fill-current" />
              <span>{t("news.pinned")}</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 pb-4 border-b">
          {article.authorName && (
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>{article.authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {article.publishedAt ? formatDate(new Date(article.publishedAt), locale) : "-"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{article.viewCount} {t("news.views")}</span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {article.coverImage && (
        <div className="rounded-xl overflow-hidden border border-border shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* Summary Box */}
      {article.summary && (
        <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary text-sm font-medium text-foreground/90 italic leading-relaxed">
          {article.summary}
        </div>
      )}

      {/* Main Content */}
      <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed whitespace-pre-line py-4">
        {article.content}
      </div>
    </article>
  );
}
