import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getT } from "@/i18n/server";
import { getSessionContext } from "@/features/identity/server";
import { GraduationCap, LogIn, LayoutDashboard } from "lucide-react";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const session = await getSessionContext();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
              <span className="p-2 rounded-xl bg-primary text-white shadow-xs">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span>{t("app.name")}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
              <Link
                href="/"
                className="text-foreground/80 hover:text-foreground transition"
              >
                {t("portal.home")}
              </Link>
              <Link
                href="/news"
                className="text-foreground/80 hover:text-foreground transition"
              >
                {t("news.publicTitle")}
              </Link>
              <Link
                href="/staff"
                className="text-foreground/80 hover:text-foreground transition"
              >
                {t("staff.publicTitle")}
              </Link>
              <Link
                href="/programs"
                className="text-foreground/80 hover:text-foreground transition"
              >
                {t("curriculum.publicTitle")}
              </Link>
              <Link
                href="/requests"
                className="text-foreground/80 hover:text-foreground transition"
              >
                {t("documents.portalTitle")}
              </Link>
              <Link
                href="/rooms"
                className="text-foreground/80 hover:text-foreground transition"
              >
                {t("rooms.publicTitle")}
              </Link>
              <Link
                href="/services"
                className="text-foreground/80 hover:text-foreground transition"
              >
                {t("services.publicTitle")}
              </Link>
              <Link
                href="/checkin"
                className="text-foreground/80 hover:text-foreground transition"
              >
                {t("attendance.publicTitle")}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher className="lang" />
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition shadow-xs"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{t("portal.adminConsole")}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border border-border hover:bg-muted transition"
              >
                <LogIn className="h-4 w-4" />
                <span>{t("auth.login")}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-10 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2 font-semibold text-foreground text-sm">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>{t("app.name")} — {t("app.tagline")}</span>
          </div>
          <p>© 2026 Faculty Web Platform. Built with Next.js 16, Prisma & Liyon Design System</p>
        </div>
      </footer>
    </div>
  );
}
