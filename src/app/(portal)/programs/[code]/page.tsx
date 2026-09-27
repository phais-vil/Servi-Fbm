import { notFound } from "next/navigation";
import { getT, getLocale } from "@/i18n/server";
import { getProgramByCode, resolvePublicTenantId } from "@/features/curriculum/server";
import { ArrowLeft, BookOpen, Clock, Award, Coins, Building, Briefcase, GraduationCap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProgramDetailPageProps {
  params: Promise<{ code: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { code } = await params;
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  if (!tenantId) notFound();

  const program = await getProgramByCode(tenantId, decodeURIComponent(code));
  if (!program) notFound();

  const name = locale === "en" ? program.nameEn : program.nameTh;
  const degree = locale === "en" ? program.degreeTitleEn : program.degreeTitleTh;
  const dept = locale === "en" ? program.departmentNameEn : program.departmentNameTh;

  const careerList = program.careerPaths
    ? program.careerPaths.split(/[,;\n]/).map((c) => c.trim()).filter(Boolean)
    : [];

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/programs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("curriculum.publicTitle")}</span>
        </Link>
      </div>

      {/* Header Info Banner */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-xs">
            {program.level}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">
            {program.code}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {name}
        </h1>

        <p className="text-base sm:text-lg font-medium text-primary flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          <span>{degree}</span>
        </p>
      </div>

      {/* Hero Cover Image */}
      {program.coverImage && (
        <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border shadow-sm">
          <Image
            src={program.coverImage}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Key Quick Facts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{t("curriculum.durationYearsField")}</span>
          </div>
          <p className="text-lg font-bold">
            {program.durationYears} {t("curriculum.yearsUnit")}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Award className="h-4 w-4 text-primary" />
            <span>{t("curriculum.totalCreditsField")}</span>
          </div>
          <p className="text-lg font-bold">
            {program.totalCredits} {t("curriculum.creditsUnit")}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Coins className="h-4 w-4 text-primary" />
            <span>{t("curriculum.tuitionFeeField")}</span>
          </div>
          <p className="text-lg font-bold">
            {program.tuitionFeePerTerm
              ? `฿${program.tuitionFeePerTerm.toLocaleString()}`
              : "-"}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building className="h-4 w-4 text-primary" />
            <span>{t("curriculum.deptField")}</span>
          </div>
          <p className="text-sm font-semibold truncate">
            {dept || "-"}
          </p>
        </div>
      </div>

      {/* Overview Section */}
      {program.overview && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>{t("curriculum.overviewField")}</span>
          </h2>
          <div className="p-6 rounded-2xl bg-card border text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
            {program.overview}
          </div>
        </section>
      )}

      {/* Career Paths Section */}
      {careerList.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>{t("curriculum.careerPathsField")}</span>
          </h2>
          <div className="flex flex-wrap gap-2.5 p-5 rounded-2xl bg-card border">
            {careerList.map((career, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                {career}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Study Plan Section */}
      {program.studyPlan && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>{t("curriculum.studyPlanField")}</span>
          </h2>
          <div className="p-6 rounded-2xl bg-card border text-sm leading-relaxed text-foreground/90 whitespace-pre-line font-mono bg-muted/20">
            {program.studyPlan}
          </div>
        </section>
      )}
    </article>
  );
}
