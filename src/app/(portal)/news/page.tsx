import Link from "next/link";
import { getT, getLocale } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { listPublishedNews, resolvePublicTenantId } from "@/features/news/server";
import { Pin, Calendar, Eye, Search, Newspaper } from "lucide-react";

interface NewsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function PublicNewsPage({ searchParams }: NewsPageProps) {
  const { category = "ALL", q = "" } = await searchParams;
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const articles = tenantId
    ? await listPublishedNews(tenantId, {
        category: category !== "ALL" ? category : undefined,
        search: q || undefined,
      })
    : [];

  const categories = [
    { key: "ALL", label: t("news.category.all") },
    { key: "ACADEMIC", label: t("news.category.academic") },
    { key: "EVENT", label: t("news.category.event") },
    { key: "SCHOLARSHIP", label: t("news.category.scholarship") },
    { key: "GENERAL", label: t("news.category.general") },
  ];

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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("news.publicTitle")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("news.publicSubtitle")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((c) => {
            const active = category === c.key;
            return (
              <Link
                key={c.key}
                href={`/news?category=${c.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Search Input Form */}
        <form method="GET" action="/news" className="w-full sm:w-64">
          <input type="hidden" name="category" value={category} />
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={t("news.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </form>
      </div>

      {/* News Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="inline-flex p-4 rounded-full bg-muted text-muted-foreground">
            <Newspaper className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold">{t("news.empty")}</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {t("news.noArticles")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden hover:shadow-md transition duration-200"
            >
              {/* Cover Image or Placeholder */}
              <div className="aspect-video w-full bg-muted relative overflow-hidden">
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-primary/40">
                    <Newspaper className="h-12 w-12" />
                  </div>
                )}
                {item.isPinned && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded shadow">
                    <Pin className="h-3 w-3 fill-white" />
                    <span>{t("news.pinned")}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur">
                  {getCategoryLabel(item.category)}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h2 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition">
                    <Link href={`/news/${item.slug}`}>{item.title}</Link>
                  </h2>
                  {item.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>

                {/* Card Meta Footer */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {item.publishedAt ? formatDate(new Date(item.publishedAt), locale) : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{item.viewCount}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
