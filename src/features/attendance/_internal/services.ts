import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateSessionInput,
  CheckInInput,
  UpdateRecordInput,
  ManualCheckInInput,
} from "./validations";
import type {
  Prisma,
  AttendanceSession,
  AttendanceRecord,
  User,
  AttendanceSessionStatus,
  AttendanceRecordStatus,
} from "@/generated/prisma";

export interface AttendanceSessionDto {
  id: string;
  tenantId: string;
  courseCode: string;
  courseName: string;
  title: string;
  roomNumber: string | null;
  lecturerId: string;
  lecturerName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  checkInPin: string;
  qrToken: string | null;
  lateThresholdMinutes: number;
  status: string;
  recordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecordDto {
  id: string;
  tenantId: string;
  sessionId: string;
  courseCode?: string;
  courseName?: string;
  sessionTitle?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  checkInTime: string;
  status: string;
  method: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function resolvePublicTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return tenant?.id ?? "";
}

function mapSessionRow(
  row: AttendanceSession & {
    lecturer: Pick<User, "name">;
    _count?: { records: number };
  }
): AttendanceSessionDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    courseCode: row.courseCode,
    courseName: row.courseName,
    title: row.title,
    roomNumber: row.roomNumber,
    lecturerId: row.lecturerId,
    lecturerName: row.lecturer.name,
    sessionDate: row.sessionDate.toISOString().slice(0, 10),
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    checkInPin: row.checkInPin,
    qrToken: row.qrToken,
    lateThresholdMinutes: row.lateThresholdMinutes,
    status: row.status,
    recordCount: row._count?.records ?? 0,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapRecordRow(
  row: AttendanceRecord & {
    session?: Pick<AttendanceSession, "courseCode" | "courseName" | "title">;
  }
): AttendanceRecordDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    sessionId: row.sessionId,
    courseCode: row.session?.courseCode,
    courseName: row.session?.courseName,
    sessionTitle: row.session?.title,
    studentId: row.studentId,
    studentName: row.studentName,
    studentCode: row.studentCode,
    checkInTime: row.checkInTime.toISOString(),
    status: row.status,
    method: row.method,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAttendanceSessions(
  tenantId: string,
  options?: { lecturerId?: string; courseCode?: string; status?: string }
): Promise<AttendanceSessionDto[]> {
  const where: Prisma.AttendanceSessionWhereInput = { tenantId };

  if (options?.lecturerId) {
    where.lecturerId = options.lecturerId;
  }
  if (options?.courseCode) {
    where.courseCode = { contains: options.courseCode, mode: "insensitive" };
  }
  if (options?.status && options.status !== "ALL") {
    where.status = options.status as Prisma.EnumAttendanceSessionStatusFilter;
  }

  const items = await prisma.attendanceSession.findMany({
    where,
    include: {
      lecturer: { select: { name: true } },
      _count: { select: { records: true } },
    },
    orderBy: { startTime: "desc" },
  });

  return items.map(mapSessionRow);
}

export async function getAttendanceSessionById(
  tenantId: string,
  id: string
): Promise<AttendanceSessionDto | null> {
  const item = await prisma.attendanceSession.findFirst({
    where: { tenantId, id },
    include: {
      lecturer: { select: { name: true } },
      _count: { select: { records: true } },
    },
  });
  if (!item) return null;
  return mapSessionRow(item);
}

export async function createAttendanceSession(
  tenantId: string,
  lecturerId: string,
  input: CreateSessionInput
): Promise<AttendanceSessionDto> {
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  const qrToken = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  const created = await prisma.attendanceSession.create({
    data: {
      tenantId,
      lecturerId,
      courseCode: input.courseCode.trim().toUpperCase(),
      courseName: input.courseName.trim(),
      title: input.title.trim(),
      roomNumber: input.roomNumber?.trim() || null,
      sessionDate: new Date(input.sessionDate),
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      checkInPin: pin,
      qrToken,
      lateThresholdMinutes: input.lateThresholdMinutes,
      status: "ACTIVE", // Created sessions are active right away
    },
    include: {
      lecturer: { select: { name: true } },
      _count: { select: { records: true } },
    },
  });

  return mapSessionRow(created);
}

export async function toggleSessionStatus(
  tenantId: string,
  sessionId: string,
  status: AttendanceSessionStatus
): Promise<AttendanceSessionDto> {
  const updated = await prisma.attendanceSession.update({
    where: { id: sessionId, tenantId },
    data: { status },
    include: {
      lecturer: { select: { name: true } },
      _count: { select: { records: true } },
    },
  });
  return mapSessionRow(updated);
}

export async function submitStudentCheckIn(
  tenantId: string,
  studentId: string,
  input: CheckInInput
): Promise<AttendanceRecordDto> {
  // Find active session matching PIN
  const session = await prisma.attendanceSession.findFirst({
    where: {
      tenantId,
      checkInPin: input.pin.trim(),
      status: "ACTIVE",
    },
  });

  if (!session) {
    throw new Error("Invalid check-in PIN or session is not currently active");
  }

  // Check if already checked in
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: session.id,
        studentId,
      },
    },
  });

  if (existing) {
    throw new Error("You have already checked in for this session");
  }

  // Calculate status: Late or Present
  const now = new Date();
  const lateCutoff = new Date(
    session.startTime.getTime() + session.lateThresholdMinutes * 60000
  );
  const status: AttendanceRecordStatus = now > lateCutoff ? "LATE" : "PRESENT";

  const record = await prisma.attendanceRecord.create({
    data: {
      tenantId,
      sessionId: session.id,
      studentId,
      studentName: input.studentName.trim(),
      studentCode: input.studentCode.trim(),
      checkInTime: now,
      status,
      method: "PIN",
    },
    include: {
      session: { select: { courseCode: true, courseName: true, title: true } },
    },
  });

  return mapRecordRow(record);
}

export async function getSessionRoster(
  tenantId: string,
  sessionId: string
): Promise<AttendanceRecordDto[]> {
  const items = await prisma.attendanceRecord.findMany({
    where: { tenantId, sessionId },
    include: {
      session: { select: { courseCode: true, courseName: true, title: true } },
    },
    orderBy: { checkInTime: "asc" },
  });
  return items.map(mapRecordRow);
}

export async function updateAttendanceRecord(
  tenantId: string,
  input: UpdateRecordInput
): Promise<AttendanceRecordDto> {
  const updated = await prisma.attendanceRecord.update({
    where: { id: input.recordId, tenantId },
    data: {
      status: input.status,
      note: input.note ?? null,
    },
    include: {
      session: { select: { courseCode: true, courseName: true, title: true } },
    },
  });
  return mapRecordRow(updated);
}

export async function manualCheckIn(
  tenantId: string,
  input: ManualCheckInInput
): Promise<AttendanceRecordDto> {
  // Check if student user exists by email/code or find viewer
  let studentUser = await prisma.user.findFirst({
    where: { email: { contains: input.studentCode } },
  });
  if (!studentUser) {
    // fallback to first student/user in tenant
    const anyUser = await prisma.user.findFirst({
      where: { userTenants: { some: { tenantId } } },
    });
    if (!anyUser) throw new Error("No user found in tenant");
    studentUser = anyUser;
  }

  const record = await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId: input.sessionId,
        studentId: studentUser.id,
      },
    },
    update: {
      status: input.status,
      note: input.note ?? null,
    },
    create: {
      tenantId,
      sessionId: input.sessionId,
      studentId: studentUser.id,
      studentName: input.studentName.trim(),
      studentCode: input.studentCode.trim(),
      status: input.status,
      method: "MANUAL",
      note: input.note ?? null,
    },
    include: {
      session: { select: { courseCode: true, courseName: true, title: true } },
    },
  });

  return mapRecordRow(record);
}

export async function getStudentAttendanceRecords(
  tenantId: string,
  studentId: string
): Promise<AttendanceRecordDto[]> {
  const items = await prisma.attendanceRecord.findMany({
    where: { tenantId, studentId },
    include: {
      session: { select: { courseCode: true, courseName: true, title: true } },
    },
    orderBy: { checkInTime: "desc" },
  });
  return items.map(mapRecordRow);
}
