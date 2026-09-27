import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getT, getLocale } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import {
  getMeetingRoomById,
  listRoomBookings,
  resolvePublicTenantId,
} from "@/features/rooms/server";
import { getSessionContext } from "@/features/identity/server";
import { StatusPill } from "@/shared/components/liyon";
import {
  ArrowLeft,
  Building,
  MapPin,
  Users,
  Calendar,
  Clock,
  Sparkles,
  CalendarDays,
  LogIn,
} from "lucide-react";
import { RoomBookingForm } from "./_components/room-booking-form";

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const t = await getT();
  const locale = await getLocale();
  const tenantId = await resolvePublicTenantId();

  if (!tenantId) {
    notFound();
  }

  const room = await getMeetingRoomById(tenantId, id);
  if (!room) {
    notFound();
  }

  const session = await getSessionContext();
  const upcomingBookings = await listRoomBookings(tenantId, {
    roomId: id,
    status: "CONFIRMED",
    fromDate: new Date(),
  });

  const name = locale === "en" ? room.nameEn : room.nameTh;
  const amenitiesList = room.amenities
    ? room.amenities.split(/[,;\n]/).map((a) => a.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("rooms.publicTitle")}</span>
        </Link>
      </div>

      {/* Main Grid: Left = Details & Schedule, Right = Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Details + Schedule) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cover & Basic Info */}
          <div className="p-6 rounded-3xl bg-card border shadow-xs space-y-5">
            <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-muted overflow-hidden">
              {room.coverImage ? (
                <Image
                  src={room.coverImage}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary/30">
                  <CalendarDays className="h-20 w-20" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-background/90 text-foreground backdrop-blur-xs shadow-xs">
                  {room.code}
                </span>
                <StatusPill tone={room.status === "AVAILABLE" ? "ok" : "warn"}>
                  {room.status === "AVAILABLE" ? t("rooms.status.available") : room.status}
                </StatusPill>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {name}
              </h1>
              {locale === "th" && (
                <p className="text-sm text-muted-foreground mt-0.5">{room.nameEn}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/40 text-center">
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Building className="h-3.5 w-3.5 text-primary" />
                  <span>{t("rooms.building")}</span>
                </div>
                <div className="font-bold text-sm sm:text-base">{room.building}</div>
              </div>
              <div className="space-y-0.5 border-x">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>{t("rooms.floor")}</span>
                </div>
                <div className="font-bold text-sm sm:text-base">{room.floor}</div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>{t("rooms.capacity")}</span>
                </div>
                <div className="font-bold text-sm sm:text-base">
                  {room.capacity} {t("rooms.seatsUnit")}
                </div>
              </div>
            </div>

            {amenitiesList.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>{t("rooms.amenities")}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl text-xs font-medium bg-muted/70 text-foreground border"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Schedule for this room */}
          <div className="p-6 rounded-3xl bg-card border shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold tracking-tight">
                ตารางการใช้งานห้องนี้ (Confirmed Schedule)
              </h3>
            </div>

            {upcomingBookings.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center bg-muted/20 rounded-2xl border border-dashed">
                ขณะนี้ยังไม่มีการจองที่อนุมัติแล้วสำหรับห้องนี้ สามารถเลือกช่วงเวลาที่ต้องการได้ทันที
              </p>
            ) : (
              <div className="space-y-2.5">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl border bg-muted/10 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-foreground">{b.title}</div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>
                          {formatDate(b.startTime, locale, { time: true })} -{" "}
                          {formatDate(b.endTime, locale, { time: true })}
                        </span>
                      </div>
                    </div>
                    <StatusPill tone="ok">{t("rooms.bookingStatus.confirmed")}</StatusPill>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reservation Form or Auth CTA */}
        <div className="lg:col-span-5 sticky top-24">
          {session ? (
            <RoomBookingForm roomId={room.id} roomCapacity={room.capacity} />
          ) : (
            <div className="p-8 rounded-3xl bg-card border shadow-xs text-center space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <LogIn className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight">เข้าสู่ระบบเพื่อจองห้องประชุม</h3>
                <p className="text-xs text-muted-foreground">
                  คณาจารย์ บุคลากร และนิสิต กรุณาลงชื่อเข้าใช้ด้วยบัญชีมหาวิทยาลัยเพื่อส่งคำขอจองห้อง
                </p>
              </div>
              <Link
                href={`/login?callbackUrl=/rooms/${room.id}`}
                className="inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition shadow-xs"
              >
                <LogIn className="h-4 w-4" />
                <span>เข้าสู่ระบบ (Sign In)</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
