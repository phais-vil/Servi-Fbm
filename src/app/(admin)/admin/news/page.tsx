import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P, listNews } from "@/features/news/server";
import { NewsClient } from "./_components/news-client";

export default async function NewsAdminPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const initialNews = await listNews(ctx.tenantId);

  return (
    <NewsClient
      initialNews={initialNews}
      canManage={hasPermission(ctx, NEWS_P.newsManage)}
      canPublish={hasPermission(ctx, NEWS_P.newsPublish)}
      canDelete={hasPermission(ctx, NEWS_P.newsDelete)}
    />
  );
}
