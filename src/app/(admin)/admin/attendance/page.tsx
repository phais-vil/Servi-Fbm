import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  ATTENDANCE_P,
  listAttendanceSessions,
  getSessionRoster,
} from "@/features/attendance/server";
import { AttendanceAdminClient } from "./_components/attendance-admin-client";

export default async function AttendanceAdminPage() {
  const ctx = await requirePermission(ATTENDANCE_P.attendanceRead);
  const initialSessions = await listAttendanceSessions(ctx.tenantId);

  // Load roster for the first session if available
  const initialRoster = initialSessions.length > 0
    ? await getSessionRoster(ctx.tenantId, initialSessions[0].id)
    : [];

  return (
    <AttendanceAdminClient
      initialSessions={initialSessions}
      initialRoster={initialRoster}
      canManage={hasPermission(ctx, ATTENDANCE_P.attendanceManage)}
    />
  );
}
