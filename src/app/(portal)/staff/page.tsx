import { getT, getLocale } from "@/i18n/server";
import { listPublicStaff, listDepartments, resolvePublicTenantId } from "@/features/staff/server";
import { Search, Mail, Phone, MapPin, GraduationCap, Award, Users } from "lucide-react";
import Link from "next/link";

interface StaffPageProps {
  searchParams: Promise<{ dept?: string; type?: string; q?: string }>;
}

export default async function PublicStaffPage({ searchParams }: StaffPageProps) {
  const { dept = "ALL", type = "ALL", q = "" } = await searchParams;
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const [staffList, departments] = tenantId
    ? await Promise.all([
        listPublicStaff(tenantId, {
          departmentId: dept !== "ALL" ? dept : undefined,
          staffType: type !== "ALL" ? type : undefined,
          search: q || undefined,
        }),
        listDepartments(tenantId),
      ])
    : [[], []];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("staff.publicTitle")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("staff.publicSubtitle")}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 pb-2 border-b">
        {/* Department Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/staff?dept=ALL&type=${type}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition ${
              dept === "ALL"
                ? "bg-primary text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t("staff.deptAll")}
          </Link>
          {departments.map((d) => {
            const active = dept === d.id;
            return (
              <Link
                key={d.id}
                href={`/staff?dept=${d.id}&type=${type}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {locale === "en" ? d.nameEn : d.nameTh} ({d.code})
              </Link>
            );
          })}
        </div>

        {/* Secondary Filter & Search Form */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
            <span className="text-muted-foreground font-medium">{t("staff.typeField")}:</span>
            <Link
              href={`/staff?dept=${dept}&type=ALL${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-2.5 py-1 rounded-md transition ${
                type === "ALL" ? "bg-muted font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("staff.typeAll")}
            </Link>
            <Link
              href={`/staff?dept=${dept}&type=ACADEMIC${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-2.5 py-1 rounded-md transition ${
                type === "ACADEMIC" ? "bg-muted font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("staff.type.academic")}
            </Link>
            <Link
              href={`/staff?dept=${dept}&type=SUPPORT${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-2.5 py-1 rounded-md transition ${
                type === "SUPPORT" ? "bg-muted font-bold text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("staff.type.support")}
            </Link>
          </div>

          <form method="GET" action="/staff" className="w-full sm:w-72">
            <input type="hidden" name="dept" value={dept} />
            <input type="hidden" name="type" value={type} />
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder={t("staff.searchPlaceholder")}
                className="w-full pl-9 pr-3 py-1.5 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Staff Profile Cards Grid */}
      {staffList.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="inline-flex p-4 rounded-full bg-muted text-muted-foreground">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-base font-semibold">{t("staff.empty")}</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {t("staff.subtitle")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="flex flex-col rounded-xl border border-border/80 bg-card overflow-hidden hover:shadow-md transition duration-200"
            >
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="relative">
                  {staff.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={staff.avatarUrl}
                      alt={staff.fullNameTh}
                      className="h-28 w-28 rounded-full object-cover border-4 border-background shadow"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-4 border-background shadow">
                      {staff.firstNameTh.charAt(0)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary text-white shadow">
                    {staff.staffType === "ACADEMIC" ? "Faculty" : staff.staffType}
                  </span>
                </div>

                {/* Name & Position */}
                <div className="space-y-1">
                  <h2 className="font-bold text-base text-foreground">
                    {locale === "en" ? staff.fullNameEn : staff.fullNameTh}
                  </h2>
                  <p className="text-xs font-medium text-muted-foreground">
                    {locale === "en" ? staff.fullNameTh : staff.fullNameEn}
                  </p>
                  {staff.position && (
                    <p className="text-xs font-semibold text-primary pt-1">
                      {staff.position}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {locale === "en" ? staff.departmentNameEn : staff.departmentNameTh}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="w-full pt-3 border-t border-border/60 space-y-1.5 text-xs text-muted-foreground text-left">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <a href={`mailto:${staff.email}`} className="truncate hover:underline">
                      {staff.email}
                    </a>
                  </div>
                  {staff.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                  {staff.officeRoom && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{staff.officeRoom}</span>
                    </div>
                  )}
                </div>

                {/* Education & Expertise */}
                {(staff.education || staff.expertise) && (
                  <div className="w-full pt-3 border-t border-border/60 space-y-2 text-xs text-left">
                    {staff.education && (
                      <div className="space-y-1">
                        <span className="font-semibold text-foreground/80 flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>{t("staff.educationField")}</span>
                        </span>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {staff.education}
                        </p>
                      </div>
                    )}
                    {staff.expertise && (
                      <div className="space-y-1">
                        <span className="font-semibold text-foreground/80 flex items-center gap-1">
                          <Award className="h-3.5 w-3.5" />
                          <span>{t("staff.expertiseField")}</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {staff.expertise.split(",").slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
