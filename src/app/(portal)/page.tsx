import Link from "next/link";
import Image from "next/image";
import { getT, getLocale } from "@/i18n/server";
import { listPublishedNews } from "@/features/news/server";
import { listPublicPrograms, resolvePublicTenantId } from "@/features/curriculum/server";
import { listPublicStaff } from "@/features/staff/server";
import { RootedHero } from "./_components/rooted-hero";
import {
  GraduationCap,
  BookOpen,
  Newspaper,
  Users,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  CalendarDays,
  QrCode,
} from "lucide-react";

export default async function PortalHomePage() {
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const [newsList, programs, staffMembers] = tenantId
    ? await Promise.all([
        listPublishedNews(tenantId, { limit: 3 }),
        listPublicPrograms(tenantId),
        listPublicStaff(tenantId),
      ])
    : [[], [], []];

  return (
    <div className="space-y-16 pb-12">
      {/* Rooted Interactive Hero Section */}
      <RootedHero
        primaryCtaText={t("portal.explorePrograms")}
        primaryCtaHref="/programs"
      />

      {/* Stats Row */}
      <section className="rounded-2xl border bg-card/60 backdrop-blur p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">{programs.length}+</p>
            <p className="text-xs text-muted-foreground">{t("portal.statsPrograms")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">{staffMembers.length}+</p>
            <p className="text-xs text-muted-foreground">{t("portal.statsFaculty")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">1,200+</p>
            <p className="text-xs text-muted-foreground">{t("portal.statsStudents")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold text-primary">150+</p>
            <p className="text-xs text-muted-foreground">{t("portal.statsResearch")}</p>
          </div>
        </div>
      </section>

      {/* Featured Programs Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span>{t("curriculum.publicTitle")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("curriculum.publicSubtitle")}
            </p>
          </div>
          <Link
            href="/programs"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>{t("portal.explorePrograms")}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.slice(0, 3).map((prog) => {
            const name = locale === "en" ? prog.nameEn : prog.nameTh;
            const degree = locale === "en" ? prog.degreeTitleEn : prog.degreeTitleTh;

            return (
              <div
                key={prog.id}
                className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md hover:border-primary/50 transition duration-200"
              >
                <div className="relative h-40 w-full bg-muted overflow-hidden">
                  {prog.coverImage ? (
                    <Image
                      src={prog.coverImage}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary/30">
                      <GraduationCap className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-background/90 text-foreground backdrop-blur-xs">
                      {prog.level}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                      {prog.code}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition">
                      {name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                      {degree}
                    </p>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{prog.durationYears} {t("curriculum.yearsUnit")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-primary" />
                      <span>{prog.totalCredits} {t("curriculum.creditsUnit")}</span>
                    </div>
                  </div>

                  <Link
                    href={`/programs/${encodeURIComponent(prog.code)}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-muted/60 hover:bg-primary hover:text-white transition"
                  >
                    <span>{t("curriculum.viewDetails")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Online Services & Fast Actions Section */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>บริการออนไลน์และกิจกรรมคณะ (Digital Services)</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            เข้าถึงบริการดิจิทัลของคณะ ยื่นคำร้อง ตรวจสอบสถานะ และเช็คชื่อเข้าเรียนได้สะดวกรวดเร็ว
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/services"
            className="group p-5 rounded-2xl bg-card border hover:border-primary/50 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition">
                บริการนิสิตและหนังสือรับรอง
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                ขอหนังสือรับรองสถานภาพ ความประพฤติ และตรวจสอบ e-Certificate
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-2 border-t">
              <span>ยื่นคำขอรับบริการ</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/checkin"
            className="group p-5 rounded-2xl bg-card border hover:border-primary/50 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition">
                เช็คชื่อเข้าเรียน (Fast Check-in)
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                บันทึกเวลาเข้าชั้นเรียนด้วยรหัส PIN 4 หลัก จากจอผู้สอน
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-2 border-t">
              <span>เข้าสู่หน้าเช็คชื่อ</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/requests"
            className="group p-5 rounded-2xl bg-card border hover:border-primary/50 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition">
                ระบบคำร้องและคำขออนุมัติ
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                ขอเปิดรายวิชา ลาพักการศึกษา และติดตามสถานะแบบเรียลไทม์
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-2 border-t">
              <span>ติดตามคำร้อง</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            href="/rooms"
            className="group p-5 rounded-2xl bg-card border hover:border-primary/50 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition">
                จองห้องประชุมและสัมมนา
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                ตรวจสอบตารางห้องประชุมส่วนกลาง และส่งคำขอจองห้องออนไลน์
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary pt-2 border-t">
              <span>จองห้องประชุม</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* Latest News & Announcements Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              <span>{t("portal.latestNews")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("news.publicSubtitle")}
            </p>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>{t("portal.viewAllNews")}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsList.slice(0, 3).map((article) => (
            <div
              key={article.id}
              className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md hover:border-primary/50 transition duration-200"
            >
              <div className="relative h-44 w-full bg-muted overflow-hidden">
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary/30">
                    <Newspaper className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-background/90 text-foreground backdrop-blur-xs">
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition">
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(article.createdAt).toLocaleDateString(locale === "th" ? "th-TH" : "en-US")}</span>
                  <Link
                    href={`/news/${encodeURIComponent(article.slug)}`}
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                  >
                    <span>{t("news.readMore")}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Faculty Staff Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <span>{t("portal.ourStaff")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("staff.publicSubtitle")}
            </p>
          </div>
          <Link
            href="/staff"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <span>{t("portal.viewAllStaff")}</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {staffMembers.slice(0, 4).map((staff) => {
            const name = locale === "en" ? staff.fullNameEn : staff.fullNameTh;
            const dept = locale === "en" ? staff.departmentNameEn : staff.departmentNameTh;

            return (
              <div
                key={staff.id}
                className="flex flex-col items-center text-center p-5 bg-card rounded-2xl border border-border/80 shadow-xs hover:border-primary/40 transition"
              >
                <div className="relative h-20 w-20 rounded-full overflow-hidden mb-3 border-2 border-primary/20 shadow-xs">
                  {staff.avatarUrl ? (
                    <Image
                      src={staff.avatarUrl}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                      {staff.firstNameEn?.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-sm text-foreground line-clamp-1">
                  {name}
                </h4>
                <p className="text-xs text-primary/90 font-medium line-clamp-1 mt-0.5">
                  {staff.position || staff.staffType}
                </p>
                {dept && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {dept}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Accreditations Banner */}
      <section className="p-8 rounded-3xl bg-muted/30 border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>มาตรฐานคุณภาพการศึกษาระดับสากล</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            หลักสูตรได้รับการรับรองตามเกณฑ์ AUN-QA, สภาวิศวกร และสำนักงานปลัดกระทรวงการอุดมศึกษาฯ (สป.อว.)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> AUN-QA Certified</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> COE Accredited</span>
        </div>
      </section>
    </div>
  );
}
