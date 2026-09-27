import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateRoomInput,
  UpdateRoomInput,
  BookRoomInput,
  ReviewBookingInput,
} from "./validations";
import type { Prisma, MeetingRoom, RoomBooking, User } from "@/generated/prisma";

export interface MeetingRoomDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  building: string;
  floor: string;
  capacity: number;
  amenities: string | null;
  coverImage: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomBookingDto {
  id: string;
  tenantId: string;
  roomId: string;
  roomCode?: string;
  roomNameTh?: string;
  roomNameEn?: string;
  bookedById: string;
  bookerName: string;
  bookerEmail: string;
  title: string;
  purpose: string | null;
  attendeeCount: number;
  equipmentRequested: string | null;
  startTime: string;
  endTime: string;
  status: string;
  reviewNote: string | null;
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

function mapRoomRow(row: MeetingRoom): MeetingRoomDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    code: row.code,
    nameTh: row.nameTh,
    nameEn: row.nameEn,
    building: row.building,
    floor: row.floor,
    capacity: row.capacity,
    amenities: row.amenities,
    coverImage: row.coverImage,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapBookingRow(
  row: RoomBooking & {
    room?: Pick<MeetingRoom, "code" | "nameTh" | "nameEn">;
    bookedBy: Pick<User, "name" | "email">;
  }
): RoomBookingDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    roomId: row.roomId,
    roomCode: row.room?.code,
    roomNameTh: row.room?.nameTh,
    roomNameEn: row.room?.nameEn,
    bookedById: row.bookedById,
    bookerName: row.bookedBy.name,
    bookerEmail: row.bookedBy.email,
    title: row.title,
    purpose: row.purpose,
    attendeeCount: row.attendeeCount,
    equipmentRequested: row.equipmentRequested,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    status: row.status,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listMeetingRooms(
  tenantId: string,
  options?: { status?: string; search?: string }
): Promise<MeetingRoomDto[]> {
  const where: Prisma.MeetingRoomWhereInput = { tenantId };

  if (options?.status && options.status !== "ALL") {
    where.status = options.status as Prisma.EnumRoomStatusFilter;
  }
  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { nameTh: { contains: q, mode: "insensitive" } },
      { nameEn: { contains: q, mode: "insensitive" } },
      { building: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.meetingRoom.findMany({
    where,
    orderBy: [{ building: "asc" }, { code: "asc" }],
  });

  return items.map(mapRoomRow);
}

export async function getMeetingRoomById(
  tenantId: string,
  id: string
): Promise<MeetingRoomDto | null> {
  const item = await prisma.meetingRoom.findFirst({
    where: { tenantId, id },
  });
  if (!item) return null;
  return mapRoomRow(item);
}

export async function createMeetingRoom(
  tenantId: string,
  input: CreateRoomInput
): Promise<MeetingRoomDto> {
  const created = await prisma.meetingRoom.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      building: input.building,
      floor: input.floor,
      capacity: input.capacity,
      amenities: input.amenities ?? null,
      coverImage: input.coverImage ?? null,
      status: input.status,
    },
  });

  return mapRoomRow(created);
}

export async function updateMeetingRoom(
  tenantId: string,
  input: UpdateRoomInput
): Promise<MeetingRoomDto> {
  const updated = await prisma.meetingRoom.update({
    where: { id: input.id, tenantId },
    data: {
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      building: input.building,
      floor: input.floor,
      capacity: input.capacity,
      amenities: input.amenities ?? null,
      coverImage: input.coverImage ?? null,
      status: input.status,
    },
  });

  return mapRoomRow(updated);
}

export async function deleteMeetingRoom(tenantId: string, id: string): Promise<void> {
  await prisma.meetingRoom.delete({
    where: { id, tenantId },
  });
}

export async function checkBookingConflict(
  tenantId: string,
  roomId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const where: Prisma.RoomBookingWhereInput = {
    tenantId,
    roomId,
    status: { in: ["PENDING", "CONFIRMED"] },
    AND: [
      { startTime: { lt: endTime } },
      { endTime: { gt: startTime } },
    ],
  };

  if (excludeBookingId) {
    where.id = { not: excludeBookingId };
  }

  const conflictCount = await prisma.roomBooking.count({ where });
  return conflictCount > 0;
}

export async function listRoomBookings(
  tenantId: string,
  options?: {
    roomId?: string;
    bookedById?: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }
): Promise<RoomBookingDto[]> {
  const where: Prisma.RoomBookingWhereInput = { tenantId };

  if (options?.roomId && options.roomId !== "ALL") {
    where.roomId = options.roomId;
  }
  if (options?.bookedById) {
    where.bookedById = options.bookedById;
  }
  if (options?.status && options.status !== "ALL") {
    where.status = options.status as Prisma.EnumBookingStatusFilter;
  }
  if (options?.fromDate) {
    where.endTime = { gte: options.fromDate };
  }
  if (options?.toDate) {
    where.startTime = { lte: options.toDate };
  }

  const items = await prisma.roomBooking.findMany({
    where,
    include: {
      room: { select: { code: true, nameTh: true, nameEn: true } },
      bookedBy: { select: { name: true, email: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return items.map(mapBookingRow);
}

export async function bookRoom(
  tenantId: string,
  bookedById: string,
  input: BookRoomInput
): Promise<RoomBookingDto> {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  const hasConflict = await checkBookingConflict(tenantId, input.roomId, start, end);
  if (hasConflict) {
    throw new Error("ห้องประชุมนี้มีผู้จองแล้วในช่วงเวลาดังกล่าว กรุณาเลือกช่วงเวลาอื่น");
  }

  const created = await prisma.roomBooking.create({
    data: {
      tenantId,
      roomId: input.roomId,
      bookedById,
      title: input.title,
      purpose: input.purpose ?? null,
      attendeeCount: input.attendeeCount,
      equipmentRequested: input.equipmentRequested ?? null,
      startTime: start,
      endTime: end,
      status: "PENDING",
    },
    include: {
      room: { select: { code: true, nameTh: true, nameEn: true } },
      bookedBy: { select: { name: true, email: true } },
    },
  });

  return mapBookingRow(created);
}

export async function reviewBooking(
  tenantId: string,
  input: ReviewBookingInput
): Promise<RoomBookingDto> {
  const updated = await prisma.roomBooking.update({
    where: { id: input.bookingId, tenantId },
    data: {
      status: input.status,
      reviewNote: input.reviewNote ?? null,
    },
    include: {
      room: { select: { code: true, nameTh: true, nameEn: true } },
      bookedBy: { select: { name: true, email: true } },
    },
  });

  return mapBookingRow(updated);
}

export async function cancelBooking(
  tenantId: string,
  bookedById: string,
  bookingId: string
): Promise<void> {
  await prisma.roomBooking.updateMany({
    where: {
      id: bookingId,
      tenantId,
      bookedById,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    data: {
      status: "CANCELLED",
    },
  });
}
