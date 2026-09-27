"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { LiyonField } from "@/shared/components/liyon";
import { bookRoomAction } from "@/features/rooms/actions";
import { Send, Calendar, Clock, Users } from "lucide-react";

interface RoomBookingFormProps {
  roomId: string;
  roomCapacity: number;
}

export function RoomBookingForm({ roomId, roomCapacity }: RoomBookingFormProps) {
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [equipmentRequested, setEquipmentRequested] = useState("");
  
  // Default to today + next hour
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const defaultStart = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  
  const end = new Date(now);
  end.setHours(end.getHours() + 2);
  const defaultEnd = new Date(end.getTime() - end.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [startTimeLocal, setStartTimeLocal] = useState(defaultStart);
  const [endTimeLocal, setEndTimeLocal] = useState(defaultEnd);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(t("rooms.validation.titleMin") || "Please enter meeting subject");
      return;
    }

    const start = new Date(startTimeLocal);
    const end = new Date(endTimeLocal);

    if (end <= start) {
      toast.error(t("rooms.validation.timeRangeInvalid") || "End time must be after start time");
      return;
    }

    startTransition(async () => {
      const res = await bookRoomAction({
        roomId,
        title: title.trim(),
        purpose: purpose.trim() || null,
        attendeeCount: Number(attendeeCount) || 1,
        equipmentRequested: equipmentRequested.trim() || null,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      if (res.ok) {
        toast.success(t("rooms.bookSuccess"));
        setTitle("");
        setPurpose("");
        setEquipmentRequested("");
        router.refresh();
      } else {
        toast.error(res.error.message || "Failed to submit booking");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card border shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-base font-bold tracking-tight">{t("rooms.bookRoom")}</h3>
      </div>

      <LiyonField label={t("rooms.bookingTitle")}>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น ประชุมเตรียมความพร้อมการตรวจประเมินหลักสูตร ABET"
          className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </LiyonField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LiyonField label={t("rooms.startTime")}>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="datetime-local"
              required
              value={startTimeLocal}
              onChange={(e) => setStartTimeLocal(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </LiyonField>

        <LiyonField label={t("rooms.endTime")}>
          <div className="relative">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="datetime-local"
              required
              value={endTimeLocal}
              onChange={(e) => setEndTimeLocal(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </LiyonField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LiyonField label={t("rooms.attendeeCount")}>
          <div className="relative">
            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="number"
              min={1}
              max={roomCapacity * 2}
              value={attendeeCount}
              onChange={(e) => setAttendeeCount(Math.max(1, Number(e.target.value)))}
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </LiyonField>

        <LiyonField label={t("rooms.equipmentRequested")}>
          <input
            type="text"
            value={equipmentRequested}
            onChange={(e) => setEquipmentRequested(e.target.value)}
            placeholder="เช่น ไมโครโฟนไร้สาย 2 ตัว, จอโปรเจกเตอร์"
            className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </LiyonField>
      </div>

      <LiyonField label={t("rooms.bookingPurpose")}>
        <textarea
          rows={3}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="รายละเอียดวาระการประชุม หรือวัตถุประสงค์โดยย่อ..."
          className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
        />
      </LiyonField>

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary/90 transition shadow-xs disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        <span>{isPending ? "กำลังบันทึก..." : t("rooms.bookRoom")}</span>
      </button>
    </form>
  );
}
