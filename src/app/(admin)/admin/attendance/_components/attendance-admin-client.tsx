"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Users,
  Plus,
  Play,
  StopCircle,
  ExternalLink,
  AlertCircle,
  UserCheck,
  Tv,
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
  createSessionAction,
  toggleSessionStatusAction,
  updateRecordAction,
  manualCheckInAction,
} from "@/features/attendance/actions";
import type { AttendanceSessionDto, AttendanceRecordDto } from "@/features/attendance";

interface AttendanceAdminClientProps {
  initialSessions: AttendanceSessionDto[];
  initialRoster: AttendanceRecordDto[];
  canManage: boolean;
}

type DialogState =
  | { mode: "closed" }
  | { mode: "createSession" }
  | { mode: "projector"; session: AttendanceSessionDto }
  | { mode: "manualCheckIn"; session: AttendanceSessionDto };

function getInitialDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function getInitialStartTime(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function getInitialEndTime(): string {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000 + 10800000).toISOString().slice(0, 16);
}

export function AttendanceAdminClient({
  initialSessions,
  initialRoster,
  canManage,
}: AttendanceAdminClientProps) {
  const t = useT();
  const locale = useLocale();

  const [sessions, setSessions] = useState<AttendanceSessionDto[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialSessions[0]?.id || ""
  );
  const [roster, setRoster] = useState<AttendanceRecordDto[]>(initialRoster);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [isPending, startTransition] = useTransition();

  // Create Session Form State
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [title, setTitle] = useState("");
  const [roomNumber, setRoomNumber] = useState("ENG-3401");
  const [sessionDate, setSessionDate] = useState(getInitialDate);
  const [startTimeLocal, setStartTimeLocal] = useState(getInitialStartTime);
  const [endTimeLocal, setEndTimeLocal] = useState(getInitialEndTime);
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState(15);

  // Manual Check-in Form State
  const [manualCode, setManualCode] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualStatus, setManualStatus] = useState<"PRESENT" | "LATE" | "ABSENT" | "EXCUSED">("PRESENT");
  const [manualNote, setManualNote] = useState("");

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const openCreateDialog = () => {
    setCourseCode("CPE-");
    setCourseName("");
    setTitle("");
    setRoomNumber("ENG-3401");
    setDialog({ mode: "createSession" });
  };

  const openProjectorDialog = (session: AttendanceSessionDto) => {
    setDialog({ mode: "projector", session });
  };

  const openManualCheckIn = (session: AttendanceSessionDto) => {
    setManualCode("");
    setManualName("");
    setManualStatus("PRESENT");
    setManualNote("");
    setDialog({ mode: "manualCheckIn", session });
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog.mode !== "createSession") return;

    startTransition(async () => {
      const res = await createSessionAction({
        courseCode: courseCode.trim().toUpperCase(),
        courseName: courseName.trim(),
        title: title.trim(),
        roomNumber: roomNumber.trim() || null,
        sessionDate,
        startTime: new Date(startTimeLocal).toISOString(),
        endTime: new Date(endTimeLocal).toISOString(),
        lateThresholdMinutes: Number(lateThresholdMinutes),
      });

      if (res.ok) {
        setSessions((prev) => [res.data, ...prev]);
        setSelectedSessionId(res.data.id);
        setDialog({ mode: "closed" });
        toast.success(t("attendance.createSuccess"));
      } else {
        toast.error(res.error.message || "Failed to create session");
      }
    });
  };

  const handleToggleStatus = (session: AttendanceSessionDto) => {
    const nextStatus = session.status === "ACTIVE" ? "CLOSED" : "ACTIVE";

    startTransition(async () => {
      const res = await toggleSessionStatusAction(session.id, nextStatus);
      if (res.ok) {
        setSessions((prev) => prev.map((s) => (s.id === res.data.id ? res.data : s)));
        toast.success(
          nextStatus === "ACTIVE"
            ? "เปิดการเช็คชื่อสำหรับคาบนี้แล้ว"
            : "ปิดการเช็คชื่อสำหรับคาบนี้แล้ว"
        );
      } else {
        toast.error(res.error.message || "Failed to toggle status");
      }
    });
  };

  const handleUpdateRecordStatus = (
    record: AttendanceRecordDto,
    status: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED"
  ) => {
    startTransition(async () => {
      const res = await updateRecordAction({
        sessionId: record.sessionId,
        recordId: record.id,
        status,
        note: record.note,
      });

      if (res.ok) {
        setRoster((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
        toast.success(t("attendance.updateSuccess"));
      } else {
        toast.error(res.error.message || "Failed to update record");
      }
    });
  };

  const handleManualCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dialog.mode !== "manualCheckIn") return;

    startTransition(async () => {
      const res = await manualCheckInAction({
        sessionId: dialog.session.id,
        studentCode: manualCode.trim(),
        studentName: manualName.trim(),
        status: manualStatus,
        note: manualNote.trim() || null,
      });

      if (res.ok) {
        setRoster((prev) => {
          const idx = prev.findIndex((r) => r.id === res.data.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = res.data;
            return next;
          }
          return [res.data, ...prev];
        });
        setSessions((prev) =>
          prev.map((s) =>
            s.id === dialog.session.id ? { ...s, recordCount: s.recordCount + 1 } : s
          )
        );
        setDialog({ mode: "closed" });
        toast.success("บันทึกการเช็คชื่อเรียบร้อย");
      } else {
        toast.error(res.error.message || "Failed to submit check-in");
      }
    });
  };

  // Sessions Table Columns
  const sessionColumns: DataTableColumn<AttendanceSessionDto>[] = [
    {
      key: "course",
      header: "วิชา / คาบเรียน",
      render: (row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-muted">
              {row.courseCode}
            </span>
            <span className="font-semibold text-xs text-foreground line-clamp-1">
              {row.courseName}
            </span>
          </div>
          <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {row.title}
          </span>
        </div>
      ),
    },
    {
      key: "pin",
      header: t("attendance.pin"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-extrabold text-sm px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20">
            {row.checkInPin}
          </span>
          {canManage && (
            <button
              onClick={() => openProjectorDialog(row)}
              title={t("attendance.projectorMode")}
              className="p-1.5 rounded-lg border hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <Tv className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
    {
      key: "attendees",
      header: "ผู้เข้าเรียน",
      render: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-bold text-foreground">{row.recordCount}</span>
          <span className="text-muted-foreground">คน</span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("attendance.sessionStatus"),
      render: (row) => {
        const tone = row.status === "ACTIVE" ? "ok" : "off";
        const label =
          row.status === "ACTIVE"
            ? t("attendance.sessionStatus.active")
            : t("attendance.sessionStatus.closed");
        return <StatusPill tone={tone}>{label}</StatusPill>;
      },
    },
    {
      key: "time",
      header: "เวลาสอน",
      render: (row) => (
        <div className="flex flex-col text-[11px] text-muted-foreground">
          <span>{row.sessionDate}</span>
          <span>
            {formatDate(row.startTime, locale, { time: true })} -{" "}
            {formatDate(row.endTime, locale, { time: true })}
          </span>
        </div>
      ),
    },
  ];

  const renderSessionRowMenu = (row: AttendanceSessionDto) => (
    <>
      <RowMenuItem
        onSelect={() => openProjectorDialog(row)}
        icon={<Tv className="h-4 w-4" />}
      >
        <span>{t("attendance.projectorMode")}</span>
      </RowMenuItem>
      {canManage && (
        <RowMenuItem
          onSelect={() => openManualCheckIn(row)}
          icon={<UserCheck className="h-4 w-4" />}
        >
          <span>{t("attendance.manualCheckIn")}</span>
        </RowMenuItem>
      )}
      {canManage && (
        <RowMenuItem
          onSelect={() => handleToggleStatus(row)}
          icon={
            row.status === "ACTIVE" ? (
              <StopCircle className="h-4 w-4 text-amber-600" />
            ) : (
              <Play className="h-4 w-4 text-emerald-600" />
            )
          }
        >
          <span>
            {row.status === "ACTIVE" ? "ปิดการเช็คชื่อ" : "เปิดการเช็คชื่ออีกครั้ง"}
          </span>
        </RowMenuItem>
      )}
    </>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("attendance.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("attendance.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/checkin"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-xl hover:bg-muted transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Portal เช็คชื่อ</span>
          </Link>
          {canManage && (
            <button
              onClick={openCreateDialog}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>{t("attendance.createSession")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left = Sessions, Right = Active Session Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sessions Table */}
        <div className="lg:col-span-7 space-y-4">
          <DataTable<AttendanceSessionDto>
            state={sessions.length === 0 ? "empty" : "data"}
            headHeading={
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="font-semibold">คาบเรียนทั้งหมด</span>
                <span className="text-xs text-muted-foreground">({sessions.length})</span>
              </div>
            }
            rows={sessions}
            columns={sessionColumns}
            getRowId={(row) => row.id}
            renderRowMenu={renderSessionRowMenu}
            empty={{
              title: t("attendance.empty"),
              description: "สร้างคาบเรียนเพื่อเปิดให้นิสิตเช็คชื่อ",
              icon: <CheckSquare className="h-8 w-8 text-muted-foreground" />,
            }}
            error={{
              title: "Error loading sessions",
              description: "Please refresh the page",
              icon: <AlertCircle className="h-8 w-8 text-destructive" />,
            }}
          />
        </div>

        {/* Right Column: Roster & Fast Actions for Selected Session */}
        <div className="lg:col-span-5 space-y-4">
          {selectedSession ? (
            <div className="p-6 rounded-3xl bg-card border shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {selectedSession.courseCode}
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      PIN: {selectedSession.checkInPin}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {selectedSession.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openProjectorDialog(selectedSession)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-xs"
                  >
                    <Tv className="h-3.5 w-3.5" />
                    <span>ฉายจอ</span>
                  </button>
                  {canManage && (
                    <button
                      onClick={() => openManualCheckIn(selectedSession)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border hover:bg-muted transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>เพิ่มชื่อ</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Roster Stream */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>{t("attendance.roster")}</span>
                  <span>{roster.length} คน</span>
                </div>

                {roster.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-8 text-center bg-muted/20 rounded-2xl border border-dashed">
                    ยังไม่มีนิสิตเช็คชื่อในคาบนี้ เปิดโหมดฉายจอเพื่อให้นิสิตสแกนหรือใส่รหัส PIN
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {roster.map((rec) => {
                      const tone =
                        rec.status === "PRESENT"
                          ? "ok"
                          : rec.status === "LATE"
                          ? "warn"
                          : rec.status === "EXCUSED"
                          ? "info"
                          : "bad";

                      return (
                        <div
                          key={rec.id}
                          className="p-3 rounded-2xl border bg-muted/10 flex items-center justify-between text-xs gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="font-semibold text-foreground">
                              {rec.studentName}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {rec.studentCode} •{" "}
                              {formatDate(rec.checkInTime, locale, { time: true })}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <StatusPill tone={tone}>
                              {rec.status === "PRESENT"
                                ? t("attendance.status.present")
                                : rec.status === "LATE"
                                ? t("attendance.status.late")
                                : rec.status === "EXCUSED"
                                ? t("attendance.status.excused")
                                : t("attendance.status.absent")}
                            </StatusPill>

                            {canManage && (
                              <select
                                value={rec.status}
                                onChange={(e) =>
                                  handleUpdateRecordStatus(
                                    rec,
                                    e.target.value as "PRESENT" | "LATE" | "ABSENT" | "EXCUSED"
                                  )
                                }
                                className="text-[11px] bg-background border rounded-lg px-1.5 py-1 focus:outline-none"
                              >
                                <option value="PRESENT">มาเรียน</option>
                                <option value="LATE">มาสาย</option>
                                <option value="EXCUSED">มีใบลา</option>
                                <option value="ABSENT">ขาดเรียน</option>
                              </select>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-card border text-center text-xs text-muted-foreground">
              เลือกคาบเรียนเพื่อดูรายชื่อผู้เข้าเรียน
            </div>
          )}
        </div>
      </div>

      {/* Dialog: Create Session */}
      <LiyonDialog
        open={dialog.mode === "createSession"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        wide
      >
        <LiyonDialogHeader
          title={t("attendance.createSession")}
          description="กรอกรายละเอียดวิชาและช่วงเวลาสำหรับเปิดให้นิสิตเช็คชื่อ"
        />
        <form onSubmit={handleCreateSessionSubmit}>
          <LiyonDialogBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("attendance.courseCode")}>
                <input
                  type="text"
                  required
                  placeholder="เช่น CPE-301"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
              <LiyonField label={t("attendance.courseName")}>
                <input
                  type="text"
                  required
                  placeholder="เช่น Software Engineering Principles"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("attendance.sessionTitle")}>
              <input
                type="text"
                required
                placeholder="เช่น สัปดาห์ที่ 5: Modular Monolith Architecture & Next.js"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
              />
            </LiyonField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LiyonField label={t("attendance.roomNumber")}>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="เช่น ENG-3401"
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>

              <LiyonField label={t("attendance.lateThreshold")}>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={lateThresholdMinutes}
                  onChange={(e) => setLateThresholdMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LiyonField label={t("attendance.sessionDate")}>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>

              <LiyonField label={t("attendance.startTime")}>
                <input
                  type="datetime-local"
                  required
                  value={startTimeLocal}
                  onChange={(e) => setStartTimeLocal(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>

              <LiyonField label={t("attendance.endTime")}>
                <input
                  type="datetime-local"
                  required
                  value={endTimeLocal}
                  onChange={(e) => setEndTimeLocal(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>
            </div>
          </LiyonDialogBody>
          <LiyonDialogFooter>
            <LiyonDialogCloseButton label="ยกเลิก" />
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition shadow-xs disabled:opacity-50"
            >
              {isPending ? "กำลังบันทึก..." : "เปิดคาบเรียน"}
            </button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Dialog: Live Projector Mode */}
      <LiyonDialog
        open={dialog.mode === "projector"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        wide
      >
        <LiyonDialogHeader
          title={t("attendance.projectorMode")}
          description="ฉายหน้าจอนี้ขึ้นโปรเจกเตอร์หรือทีวีในห้องเรียน ให้นิสิตสแกนหรือใส่รหัส PIN"
        />
        {dialog.mode === "projector" && (
          <div className="p-8 text-center space-y-6 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl border">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary">
                {dialog.session.courseCode} - {dialog.session.courseName}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-2 text-foreground">
                {dialog.session.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                ห้องเรียน: {dialog.session.roomNumber || "ทั่วไป"} • ตัดสายเมื่อเลย {dialog.session.lateThresholdMinutes} นาที
              </p>
            </div>

            {/* Giant PIN Display */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                รหัส PIN สำหรับเช็คชื่อเข้าเรียน
              </div>
              <div className="inline-block px-8 py-4 rounded-3xl bg-background border-2 border-primary/30 shadow-lg">
                <span className="font-mono text-5xl sm:text-6xl font-black tracking-[0.3em] text-primary">
                  {dialog.session.checkInPin}
                </span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-card border shadow-xs text-xs space-y-2 text-left">
              <div className="font-bold text-foreground">ขั้นตอนการเช็คชื่อสำหรับนิสิต:</div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>เปิดเบราว์เซอร์บนมือถือไปที่เว็บไซต์คณะ</li>
                <li>ไปที่เมนู <span className="font-semibold text-foreground">&ldquo;เช็คชื่อเข้าเรียน (Fast Check-in)&rdquo;</span></li>
                <li>กรอกรหัส PIN <span className="font-mono font-bold text-primary">{dialog.session.checkInPin}</span> และกดยืนยัน</li>
              </ol>
            </div>
          </div>
        )}
        <LiyonDialogFooter>
          <LiyonDialogCloseButton label="ปิดหน้าต่างฉายจอ" />
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Dialog: Manual Check-In */}
      <LiyonDialog
        open={dialog.mode === "manualCheckIn"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
      >
        <LiyonDialogHeader
          title={t("attendance.manualCheckIn")}
          description="บันทึกหรือปรับสถานะการเข้าเรียนให้นิสิตโดยตรง"
        />
        {dialog.mode === "manualCheckIn" && (
          <form onSubmit={handleManualCheckInSubmit}>
            <LiyonDialogBody className="space-y-4">
              <LiyonField label={t("attendance.studentCode")}>
                <input
                  type="text"
                  required
                  placeholder="เช่น 65010999"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>

              <LiyonField label={t("attendance.studentName")}>
                <input
                  type="text"
                  required
                  placeholder="ชื่อ-นามสกุล นิสิต"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-background"
                />
              </LiyonField>

              <LiyonField label={t("attendance.status")}>
                <LiyonSelect
                  value={manualStatus}
                  onChange={(e) =>
                    setManualStatus(
                      e.target.value as "PRESENT" | "LATE" | "ABSENT" | "EXCUSED"
                    )
                  }
                >
                  <option value="PRESENT">{t("attendance.status.present")}</option>
                  <option value="LATE">{t("attendance.status.late")}</option>
                  <option value="EXCUSED">{t("attendance.status.excused")}</option>
                  <option value="ABSENT">{t("attendance.status.absent")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label="หมายเหตุ (ถ้ามี)">
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="เช่น ลากิจแข่งขันวิชาการ หรือมีใบรับรองแพทย์"
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
                {isPending ? "กำลังบันทึก..." : "บันทึกผล"}
              </button>
            </LiyonDialogFooter>
          </form>
        )}
      </LiyonDialog>
    </div>
  );
}
