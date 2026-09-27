import { getT, getLocale } from "@/i18n/server";
import {
  listMeetingRooms,
  listRoomBookings,
  resolvePublicTenantId,
} from "@/features/rooms/server";
import { StatusPill } from "@/shared/components/liyon";
import {
  CalendarDays,
  Users,
  Building,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface RoomsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PublicRoomsPage({ searchParams }: RoomsPageProps) {
  const { q = "" } = await searchParams;
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  const [rooms, upcomingBookings] = tenantId
    ? await Promise.all([
        listMeetingRooms(tenantId, { search: q || undefined }),
        listRoomBookings(tenantId, {
          status: "CONFIRMED",
          fromDate: new Date(),
        }),
      ])
    : [[], []];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("rooms.publicTitle")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t("rooms.publicSubtitle")}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b">
        <form method="GET" action="/rooms" className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={t("rooms.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </form>

        <div className="text-xs text-muted-foreground font-medium self-end sm:self-center">
          พบ {rooms.length} ห้องประชุม
        </div>
      </div>

      {/* Meeting Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed text-muted-foreground">
          <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-semibold">{t("rooms.empty")}</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const name = locale === "en" ? room.nameEn : room.nameTh;
            const amenitiesList = room.amenities
              ? room.amenities.split(/[,;\n]/).map((a) => a.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={room.id}
                className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-md hover:border-primary/50 transition duration-200"
              >
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  {room.coverImage ? (
                    <Image
                      src={room.coverImage}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary/30">
                      <CalendarDays className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-background/90 text-foreground backdrop-blur-xs">
                      {room.code}
                    </span>
                    <StatusPill tone={room.status === "AVAILABLE" ? "ok" : "warn"}>
                      {room.status === "AVAILABLE" ? t("rooms.status.available") : room.status}
                    </StatusPill>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition line-clamp-1">
                      {name}
                    </h2>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-primary" />
                        {room.building}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {room.floor}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        {room.capacity} {t("rooms.seatsUnit")}
                      </span>
                    </div>

                    {amenitiesList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {amenitiesList.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground"
                          >
                            {item}
                          </span>
                        ))}
                        {amenitiesList.length > 3 && (
                          <span className="text-[11px] text-muted-foreground self-center">
                            +{amenitiesList.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/rooms/${room.id}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-xs"
                  >
                    <span>{t("rooms.bookRoom")}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming Confirmed Bookings Schedule */}
      <section className="p-6 rounded-3xl bg-card border shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">
            ตารางการใช้งานห้องประชุมเร็วๆ นี้ (Confirmed Schedule)
          </h2>
        </div>

        {upcomingBookings.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            {t("rooms.emptyBookings")} (ห้องประชุมว่างพร้อมให้จอง)
          </p>
        ) : (
          <div className="divide-y rounded-xl border overflow-hidden">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-muted/10 hover:bg-muted/30 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {booking.roomCode}
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      {booking.title}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    ห้อง: {booking.roomNameTh} • ผู้ขอใช้: {booking.bookerName}
                  </p>
                </div>

                <div className="flex items-center gap-2 font-medium text-foreground self-start sm:self-auto">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>
                    {new Date(booking.startTime).toLocaleDateString("th-TH")}{" "}
                    {new Date(booking.startTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(booking.endTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
