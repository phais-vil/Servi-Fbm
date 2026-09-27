import { getT, getLocale } from "@/i18n/server";
import { listPublicPrograms, resolvePublicTenantId } from "@/features/curriculum/server";
import { Search, BookOpen, Clock, Award, Coins, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProgramsPageProps {
  searchParams: Promise<{ level?: string; q?: string }>;
}

const LEVEL_OPTIONS = [
  { key: "ALL", labelKey: "curriculum.levelAll" },
  { key: "BACHELOR", labelKey: "curriculum.level.bachelor" },
  { key: "MASTER", labelKey: "curriculum.level.master" },
  { key: "DOCTORAL", labelKey: "curriculum.level.doctoral" },
  { key: "DIPLOMA", labelKey: "curriculum.level.diploma" },
] as const;

export default async function PublicProgramsPage({ searchParams }: ProgramsPageProps) {
  const { level = "ALL", q = "" } = await searchParams;
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const programs = tenantId
    ? await listPublicPrograms(tenantId, {
        level: level !== "ALL" ? level : undefined,
        search: q || undefined,
      })
    : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("curriculum.publicTitle")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("curriculum.publicSubtitle")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 pb-2 border-b">
        {/* Degree Level Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {LEVEL_OPTIONS.map((opt) => {
            const active = level === opt.key;
            return (
              <Link
                key={opt.key}
                href={`/programs?level=${opt.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t(opt.labelKey)}
              </Link>
            );
          })}
        </div>

        {/* Search Input */}
        <form method="GET" action="/programs" className="relative max-w-md">
          <input type="hidden" name="level" value={level} />
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={t("curriculum.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>
        </form>
      </div>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border/80">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold">{t("curriculum.empty")}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => {
            const name = locale === "en" ? prog.nameEn : prog.nameTh;
            const degree = locale === "en" ? prog.degreeTitleEn : prog.degreeTitleTh;
            const dept = locale === "en" ? prog.departmentNameEn : prog.departmentNameTh;

            return (
              <div
                key={prog.id}
                className="group relative flex flex-col bg-card rounded-2xl border border-border/70 overflow-hidden shadow-xs hover:shadow-md hover:border-primary/40 transition duration-200"
              >
                {/* Cover Image Banner */}
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  {prog.coverImage ? (
                    <Image
                      src={prog.coverImage}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary/40">
                      <BookOpen className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-background/90 text-foreground backdrop-blur-xs shadow-xs">
                      {prog.code}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-white shadow-xs">
                      {prog.level}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition">
                      {name}
                    </h2>
                    <p className="text-xs font-medium text-muted-foreground">
                      {degree}
                    </p>
                    {dept && (
                      <p className="text-xs text-primary/90 font-medium">
                        {dept}
                      </p>
                    )}
                    {prog.overview && (
                      <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                        {prog.overview}
                      </p>
                    )}
                  </div>

                  {/* Highlights Bar */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5" title={t("curriculum.durationYearsField")}>
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{prog.durationYears} {t("curriculum.yearsUnit")}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={t("curriculum.totalCreditsField")}>
                      <Award className="h-3.5 w-3.5 text-primary" />
                      <span>{prog.totalCredits} {t("curriculum.creditsUnit")}</span>
                    </div>
                    {prog.tuitionFeePerTerm && (
                      <div className="flex items-center gap-1.5" title={t("curriculum.tuitionFeeField")}>
                        <Coins className="h-3.5 w-3.5 text-primary" />
                        <span>฿{prog.tuitionFeePerTerm.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-2">
                    <Link
                      href={`/programs/${encodeURIComponent(prog.code)}`}
                      className="inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-muted/60 text-foreground hover:bg-primary hover:text-white transition duration-200"
                    >
                      <span>{t("curriculum.viewDetails")}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
