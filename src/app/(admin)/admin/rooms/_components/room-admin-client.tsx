"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Building,
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertCircle,
  Clock,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  DataTable,
  type DataTableColumn,
  RowMenuItem,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import {
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
  reviewBookingAction,
  cancelBookingAction,
} from "@/features/rooms/actions";
import type { MeetingRoomDto, RoomBookingDto } from "@/features/rooms";

interface RoomAdminClientProps {
  initialRooms: MeetingRoomDto[];
  initialBookings: RoomBookingDto[];
  canManage: boolean;
}

type DialogState =
  | { mode: "closed" }
  | { mode: "createRoom" }
  | { mode: "editRoom"; room: MeetingRoomDto }
  | { mode: "deleteRoom"; room: MeetingRoomDto }
  | { mode: "reviewBooking"; booking: RoomBookingDto };

export function RoomAdminClient({
  initialRooms,
  initialBookings,
  canManage,
}: RoomAdminClientProps) {
  const t = useT();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<"rooms" | "bookings">("rooms");

  const [rooms, setRooms] = useState<MeetingRoomDto[]>(initialRooms);
  const [bookings, setBookings] = useState<RoomBookingDto[]>(initialBookings);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [isPending, startTransition] = useTransition();

  // Room filters
  const [roomSearch, setRoomSearch] = useState("");
  const [roomStatusFilter, setRoomStatusFilter] = useState("ALL");

  // Booking filters
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("ALL");

  // Room form states
  const [roomCode, setRoomCode] = useState("");
  const [roomNameTh, setRoomNameTh] = useState("");
  const [roomNameEn, setRoomNameEn] = useState("");
  const [roomBuilding, setRoomBuilding] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [roomCapacity, setRoomCapacity] = useState(20);
  const [roomAmenities, setRoomAmenities] = useState("");
  const [roomCoverImage, setRoomCoverImage] = useState("");
  const [roomStatus, setRoomStatus] = useState<"AVAILABLE" | "MAINTENANCE" | "CLOSED">("AVAILABLE");

  // Review form states
  const [reviewDecision, setReviewDecision] = useState<"CONFIRMED" | "REJECTED">("CONFIRMED");
  const [reviewNote, setReviewNote] = useState("");

  const openCreateRoom = () => {
    setRoomCode("");
    setRoomNameTh("");
    setRoomNameEn("");
    setRoomBuilding("");
    setRoomFloor("");
    setRoomCapacity(20);
    setRoomAmenities("");
    setRoomCoverImage("");
    setRoomStatus("AVAILABLE");
    setDialog({ mode: "createRoom" });
  };

  const openEditRoom = (room: MeetingRoomDto) => {
    setRoomCode(room.code);
    setRoomNameTh(room.nameTh);
    setRoomNameEn(room.nameEn);
    setRoomBuilding(room.building);
    setRoomFloor(room.floor);
    setRoomCapacity(room.capacity);
    setRoomAmenities(room.amenities || "");
    setRoomCoverImage(room.coverImage || "");
    setRoomStatus(room.status as "AVAILABLE" | "MAINTENANCE" | "CLOSED");
    setDialog({ mode: "editRoom", room });
  };

  const openReviewBooking = (booking: RoomBookingDto) => {
    setReviewDecision("CONFIRMED");
    setReviewNote("");
    setDialog({ mode: "reviewBooking", booking });
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog.mode !== "createRoom" && dialog.mode !== "editRoom") return;

    startTransition(async () => {
      if (dialog.mode === "createRoom") {
        const res = await createRoomAction({
          code: roomCode.trim(),
          nameTh: roomNameTh.trim(),
          nameEn: roomNameEn.trim(),
          building: roomBuilding.trim(),
          floor: roomFloor.trim(),
          capacity: Number(roomCapacity),
          amenities: roomAmenities.trim() || null,
          coverImage: roomCoverImage.trim() || null,
          status: roomStatus,
        });

        if (res.ok) {
          setRooms((prev) => [res.data, ...prev]);
          setDialog({ mode: "closed" });
          toast.success(t("rooms.createSuccess"));
        } else {
          toast.error(res.error.message || "Failed to create room");
        }
      } else {
        const res = await updateRoomAction({
          id: dialog.room.id,
          code: roomCode.trim(),
          nameTh: roomNameTh.trim(),
          nameEn: roomNameEn.trim(),
          building: roomBuilding.trim(),
          floor: roomFloor.trim(),
          capacity: Number(roomCapacity),
          amenities: roomAmenities.trim() || null,
          coverImage: roomCoverImage.trim() || null,
          status: roomStatus,
        });

        if (res.ok) {
          setRooms((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
          setDialog({ mode: "closed" });
          toast.success(t("rooms.updateSuccess"));
        } else {
          toast.error(res.error.message || "Failed to update room");
        }
      }
    });
  };

  const handleDeleteRoom = () => {
    if (dialog.mode !== "deleteRoom") return;
    const { room } = dialog;

    startTransition(async () => {
      const res = await deleteRoomAction(room.id);
      if (res.ok) {
        setRooms((prev) => prev.filter((r) => r.id !== room.id));
        setDialog({ mode: "closed" });
        toast.success(t("rooms.deleteSuccess"));
      } else {
        toast.error(res.error.message || "Failed to delete room");
      }
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog.mode !== "reviewBooking") return;
    const { booking } = dialog;

    startTransition(async () => {
      const res = await reviewBookingAction({
        bookingId: booking.id,
        status: reviewDecision,
        reviewNote: reviewNote.trim() || null,
      });

      if (res.ok) {
        setBookings((prev) => prev.map((b) => (b.id === res.data.id ? res.data : b)));
        setDialog({ mode: "closed" });
        toast.success(t("rooms.reviewSuccess"));
      } else {
        toast.error(res.error.message || "Failed to review booking");
      }
    });
  };

  const handleCancelBooking = (booking: RoomBookingDto) => {
    if (!confirm("คุณต้องการยกเลิกคำขอจองนี้ใช่หรือไม่?")) return;

    startTransition(async () => {
      const res = await cancelBookingAction(booking.id);
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...b, status: "CANCELLED" } : b))
        );
        toast.success("ยกเลิกการจองเรียบร้อยแล้ว");
      } else {
        toast.error(res.error.message || "Failed to cancel booking");
      }
    });
  };

  // Filtered lists
  const filteredRooms = rooms.filter((r) => {
    if (roomStatusFilter !== "ALL" && r.status !== roomStatusFilter) return false;
    if (roomSearch.trim()) {
      const q = roomSearch.toLowerCase();
      const matchCode = r.code.toLowerCase().includes(q);
      const matchTh = r.nameTh.toLowerCase().includes(q);
      const matchEn = r.nameEn.toLowerCase().includes(q);
      const matchBld = r.building.toLowerCase().includes(q);
      if (!matchCode && !matchTh && !matchEn && !matchBld) return false;
    }
    return true;
  });

  const filteredBookings = bookings.filter((b) => {
    if (bookingStatusFilter !== "ALL" && b.status !== bookingStatusFilter) return false;
    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchBooker = b.bookerName.toLowerCase().includes(q) || b.bookerEmail.toLowerCase().includes(q);
      const matchRoom = (b.roomCode?.toLowerCase() || "").includes(q);
      if (!matchTitle && !matchBooker && !matchRoom) return false;
    }
    return true;
  });

  // Rooms columns
  const roomColumns: DataTableColumn<MeetingRoomDto>[] = [
    {
      key: "code",
      header: t("rooms.code"),
      render: (row) => (
        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "ชื่อห้อง",
      render: (row) => (
        <div className="flex flex-col max-w-xs">
          <span className="font-semibold text-sm">{row.nameTh}</span>
          <span className="text-xs text-muted-foreground">{row.nameEn}</span>
        </div>
      ),
    },
    {
      key: "location",
      header: "สถานที่",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building className="h-3.5 w-3.5 text-primary" />
          <span>
            {row.building} ({row.floor})
          </span>
        </div>
      ),
    },
    {
      key: "capacity",
      header: t("rooms.capacity"),
      render: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            {row.capacity} {t("rooms.seatsUnit")}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("rooms.status"),
      render: (row) => {
        const tone = row.status === "AVAILABLE" ? "ok" : row.status === "MAINTENANCE" ? "warn" : "bad";
        const label =
          row.status === "AVAILABLE"
            ? t("rooms.status.available")
            : row.status === "MAINTENANCE"
            ? t("rooms.status.maintenance")
            : t("rooms.status.closed");
        return <StatusPill tone={tone}>{label}</StatusPill>;
      },
    },
  ];

  const renderRoomRowMenu = (row: MeetingRoomDto) => (
    <>
      {canManage && (
        <RowMenuItem onSelect={() => openEditRoom(row)} icon={<Edit className="h-4 w-4" />}>
          {t("rooms.editRoom")}
        </RowMenuItem>
      )}
      <RowMenuItem
        onSelect={() => window.open(`/rooms/${row.id}`, "_blank")}
        icon={<ExternalLink className="h-4 w-4" />}
      >
        <span>ดูบนหน้า Portal</span>
      </RowMenuItem>
      {canManage && (
        <RowMenuItem
          onSelect={() => setDialog({ mode: "deleteRoom", room: row })}
          icon={<Trash2 className="h-4 w-4 text-destructive" />}
        >
          <span className="text-destructive">{t("rooms.deleteRoom")}</span>
        </RowMenuItem>
      )}
    </>
  );

  // Booking columns
  const bookingColumns: DataTableColumn<RoomBookingDto>[] = [
    {
      key: "room",
      header: "ห้องประชุม",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-xs">{row.roomCode || "—"}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.roomNameTh || row.roomNameEn || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "title",
      header: t("rooms.bookingTitle"),
      render: (row) => (
        <div className="flex flex-col max-w-sm">
          <span className="font-semibold text-sm line-clamp-1">{row.title}</span>
          {row.purpose && (
            <span className="text-xs text-muted-foreground line-clamp-1">{row.purpose}</span>
          )}
          <span className="text-[11px] text-muted-foreground mt-0.5">
            ผู้ร่วม: {row.attendeeCount} คน
          </span>
        </div>
      ),
    },
    {
      key: "booker",
      header: "ผู้จอง",
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-foreground">{row.bookerName}</span>
          <span className="text-muted-foreground text-[11px]">{row.bookerEmail}</span>
        </div>
      ),
    },
    {
      key: "time",
      header: t("rooms.timeRange"),
      render: (row) => (
        <div className="flex flex-col text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-primary" />
            <span className="font-medium text-foreground">
              {formatDate(row.startTime, locale, { time: true })}
            </span>
          </div>
          <span className="text-[11px]">ถึง {formatDate(row.endTime, locale, { time: true })}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("rooms.bookingStatus"),
      render: (row) => {
        const tone =
          row.status === "CONFIRMED"
            ? "ok"
            : row.status === "REJECTED"
            ? "bad"
            : row.status === "CANCELLED"
            ? "off"
            : "info";
        const label =
          row.status === "CONFIRMED"
            ? t("rooms.bookingStatus.confirmed")
            : row.status === "REJECTED"
            ? t("rooms.bookingStatus.rejected")
            : row.status === "CANCELLED"
            ? t("rooms.bookingStatus.cancelled")
            : t("rooms.bookingStatus.pending");
        return <StatusPill tone={tone}>{label}</StatusPill>;
      },
    },
  ];

  const renderBookingRowMenu = (row: RoomBookingDto) => (
    <>
      {canManage && row.status === "PENDING" && (
        <RowMenuItem
          onSelect={() => openReviewBooking(row)}
          icon={<CheckCircle2 className="h-4 w-4" />}
        >
          {t("rooms.reviewTitle")}
        </RowMenuItem>
      )}
      {row.status !== "CANCELLED" && (
        <RowMenuItem
          onSelect={() => handleCancelBooking(row)}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
        >
          <span className="text-destructive">{t("rooms.cancelBooking")}</span>
        </RowMenuItem>
      )}
    </>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("rooms.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("rooms.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/rooms"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-xl hover:bg-muted transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Portal ห้องประชุม</span>
          </Link>
          {canManage && activeTab === "rooms" && (
            <button
              onClick={openCreateRoom}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>{t("rooms.createRoom")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("rooms")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "rooms"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="h-4 w-4" />
          <span>ห้องประชุม (Rooms)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
            {rooms.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>รายการขอใช้ห้อง (Bookings)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
            {bookings.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Rooms */}
      {activeTab === "rooms" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-xl text-sm bg-background"
                placeholder={t("rooms.searchPlaceholder")}
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <LiyonSelect
                value={roomStatusFilter}
                onChange={(e) => setRoomStatusFilter(e.target.value)}
              >
                <option value="ALL">สถานะทั้งหมด</option>
                <option value="AVAILABLE">{t("rooms.status.available")}</option>
                <option value="MAINTENANCE">{t("rooms.status.maintenance")}</option>
                <option value="CLOSED">{t("rooms.status.closed")}</option>
              </LiyonSelect>
            </div>
          </div>

          <DataTable<MeetingRoomDto>
            state={filteredRooms.length === 0 ? "empty" : "data"}
            headHeading={
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <span className="font-semibold">ห้องประชุมทั้งหมด</span>
                <span className="text-xs text-muted-foreground">({filteredRooms.length})</span>
              </div>
            }
            rows={filteredRooms}
            columns={roomColumns}
            getRowId={(row) => row.id}
            renderRowMenu={renderRoomRowMenu}
            empty={{
              title: t("rooms.empty"),
              description: "เพิ่มห้องประชุมเพื่อเริ่มต้นให้บริการ",
              icon: <Building className="h-8 w-8 text-muted-foreground" />,
            }}
            error={{
              title: "Error loading rooms",
              description: "Please refresh the page",
              icon: <AlertCircle className="h-8 w-8 text-destructive" />,
            }}
          />
        </div>
      )}

      {/* Tab 2: Bookings */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-xl text-sm bg-background"
                placeholder="ค้นหาตามหัวข้องาน, ผู้จอง หรือรหัสห้อง..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <LiyonSelect
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
              >
                <option value="ALL">สถานะทั้งหมด</option>
                <option value="PENDING">{t("rooms.bookingStatus.pending")}</option>
                <option value="CONFIRMED">{t("rooms.bookingStatus.confirmed")}</option>
                <option value="REJECTED">{t("rooms.bookingStatus.rejected")}</option>
                <option value="CANCELLED">{t("rooms.bookingStatus.cancelled")}</option>
              </LiyonSelect>
            </div>
          </div>

          <DataTable<RoomBookingDto>
            state={filteredBookings.length === 0 ? "empty" : "data"}
            headHeading={
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-semibold">{t("rooms.allBookings")}</span>
                <span className="text-xs text-muted-foreground">({filteredBookings.length})</span>
              </div>
            }
            rows={filteredBookings}
            columns={bookingColumns}
            getRowId={(row) => row.id}
            renderRowMenu={renderBookingRowMenu}
            empty={{
              title: t("rooms.emptyBookings"),
              description: "ยังไม่มีรายการขอใช้ห้องประชุม",
              icon: <Calendar className="h-8 w-8 text-muted-foreground" />,
            }}
            error={{
              title: "Error loading bookings",
              description: "Please refresh the page",
              icon: <AlertCircle className="h-8 w-8 text-destructive" />,
            }}
          />
        </div>
      )}

      {/* Dialog: Create or Edit Room */}
      <LiyonDialog
        open={dialog.mode === "createRoom" || dialog.mode === "editRoom"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        wide
      >
        <LiyonDialogHeader
          title={dialog.mode === "createRoom" ? t("rooms.createRoom") : t("rooms.editRoom")}
          description="กรอกข้อมูลห้องประชุมและสิ่งอำนวยความสะดวกสำหรับบุคลากรและนิสิต"
        />
        <form onSubmit={handleRoomSubmit}>
          <LiyonDialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("rooms.code")}>
                <input
                  type="text"
                  required
                  placeholder="เช่น ENG-3401"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("rooms.capacity")}>
                <input
                  type="number"
                  required
                  min={1}
                  value={roomCapacity}
                  onChange={(e) => setRoomCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("rooms.nameTh")}>
                <input
                  type="text"
                  required
                  placeholder="เช่น ห้องสัมมนาสุรนารี"
                  value={roomNameTh}
                  onChange={(e) => setRoomNameTh(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("rooms.nameEn")}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suranaree Seminar Hall"
                  value={roomNameEn}
                  onChange={(e) => setRoomNameEn(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LiyonField label={t("rooms.building")}>
                <input
                  type="text"
                  required
                  placeholder="เช่น อาคารวิศวกรรม 1"
                  value={roomBuilding}
                  onChange={(e) => setRoomBuilding(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("rooms.floor")}>
                <input
                  type="text"
                  required
                  placeholder="เช่น ชั้น 4"
                  value={roomFloor}
                  onChange={(e) => setRoomFloor(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("rooms.status")}>
                <LiyonSelect
                  value={roomStatus}
                  onChange={(e) =>
                    setRoomStatus(e.target.value as "AVAILABLE" | "MAINTENANCE" | "CLOSED")
                  }
                >
                  <option value="AVAILABLE">{t("rooms.status.available")}</option>
                  <option value="MAINTENANCE">{t("rooms.status.maintenance")}</option>
                  <option value="CLOSED">{t("rooms.status.closed")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            <LiyonField label={t("rooms.amenities")}>
              <input
                type="text"
                placeholder="เช่น จอโปรเจกเตอร์ 4K, ไมค์ลอย 4 ตัว, วิดีโอคอนเฟอเรนซ์ Zoom Room"
                value={roomAmenities}
                onChange={(e) => setRoomAmenities(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
              />
            </LiyonField>

            <LiyonField label={t("rooms.coverImage")}>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={roomCoverImage}
                onChange={(e) => setRoomCoverImage(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
              />
            </LiyonField>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <LiyonDialogCloseButton label="ยกเลิก" />
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Dialog: Delete Room Confirmation */}
      <LiyonDialog
        open={dialog.mode === "deleteRoom"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
      >
        <LiyonDialogHeader
          title={t("rooms.deleteRoom")}
          description={t("rooms.deleteConfirm")}
        />
        {dialog.mode === "deleteRoom" && (
          <LiyonDialogBody>
            <p className="text-sm font-medium">
              ห้องประชุม: <span className="font-bold">{dialog.room.code}</span> -{" "}
              {dialog.room.nameTh}
            </p>
          </LiyonDialogBody>
        )}
        <LiyonDialogFooter>
          <LiyonDialogCloseButton label="ยกเลิก" />
          <button
            type="button"
            disabled={isPending}
            onClick={handleDeleteRoom}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-destructive text-white hover:bg-destructive/90 transition disabled:opacity-50"
          >
            {isPending ? "กำลังลบ..." : "ยืนยันการลบ"}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Dialog: Review Booking */}
      <LiyonDialog
        open={dialog.mode === "reviewBooking"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        wide
      >
        <LiyonDialogHeader
          title={t("rooms.reviewTitle")}
          description="พิจารณาอนุมัติหรือปฏิเสธคำขอใช้ห้องประชุม พร้อมระบุข้อความแจ้งผู้ขอ"
        />
        {dialog.mode === "reviewBooking" && (
          <form onSubmit={handleReviewSubmit}>
            <LiyonDialogBody className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 text-xs space-y-1.5">
                <div className="font-bold text-sm text-foreground">
                  {dialog.booking.title}
                </div>
                <div className="text-muted-foreground">
                  ห้อง: <span className="font-medium text-foreground">{dialog.booking.roomCode}</span> ({dialog.booking.roomNameTh})
                </div>
                <div className="text-muted-foreground">
                  ผู้ขอจอง: <span className="font-medium text-foreground">{dialog.booking.bookerName}</span> ({dialog.booking.bookerEmail})
                </div>
                <div className="text-muted-foreground">
                  เวลา: <span className="font-medium text-foreground">
                    {formatDate(dialog.booking.startTime, locale, { time: true })} - {formatDate(dialog.booking.endTime, locale, { time: true })}
                  </span>
                </div>
                {dialog.booking.purpose && (
                  <div className="text-muted-foreground">
                    วัตถุประสงค์: <span className="italic">{dialog.booking.purpose}</span>
                  </div>
                )}
                {dialog.booking.equipmentRequested && (
                  <div className="text-muted-foreground">
                    อุปกรณ์ที่ต้องการ: <span className="italic">{dialog.booking.equipmentRequested}</span>
                  </div>
                )}
              </div>

              <LiyonField label={t("rooms.reviewDecision")}>
                <LiyonSelect
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as "CONFIRMED" | "REJECTED")}
                >
                  <option value="CONFIRMED">{t("rooms.confirmBooking")}</option>
                  <option value="REJECTED">{t("rooms.rejectBooking")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("rooms.reviewNote")}>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="เช่น อนุมัติการใช้ห้องตามเวลาที่ระบุ / หรือ ระบุเหตุผลในกรณีปฏิเสธ..."
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </LiyonField>
            </LiyonDialogBody>
            <LiyonDialogFooter>
              <LiyonDialogCloseButton label="ยกเลิก" />
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isPending ? "กำลังบันทึก..." : "บันทึกผลการพิจารณา"}
              </button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>
    </div>
  );
}
