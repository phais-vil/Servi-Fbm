"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requireSession, requirePermission } from "@/features/identity/server";
import { ROOMS_P } from "../permissions";
import {
  createRoomSchema,
  updateRoomSchema,
  bookRoomSchema,
  reviewBookingSchema,
} from "./validations";
import {
  createMeetingRoom,
  updateMeetingRoom,
  deleteMeetingRoom,
  bookRoom,
  reviewBooking,
  cancelBooking,
  type MeetingRoomDto,
  type RoomBookingDto,
} from "./services";

export async function bookRoomAction(input: unknown): Promise<ActionResult<RoomBookingDto>> {
  return runAction(async () => {
    const ctx = await requireSession();
    const parsed = bookRoomSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await bookRoom(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function reviewBookingAction(input: unknown): Promise<ActionResult<RoomBookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    const parsed = reviewBookingSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await reviewBooking(ctx.tenantId, parsed);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function cancelBookingAction(bookingId: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requireSession();
    await cancelBooking(ctx.tenantId, ctx.userId, bookingId);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
  });
}

export async function createRoomAction(input: unknown): Promise<ActionResult<MeetingRoomDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    const parsed = createRoomSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createMeetingRoom(ctx.tenantId, parsed);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function updateRoomAction(input: unknown): Promise<ActionResult<MeetingRoomDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    const parsed = updateRoomSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateMeetingRoom(ctx.tenantId, parsed);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
    return result;
  });
}

export async function deleteRoomAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(ROOMS_P.roomsManage);
    await deleteMeetingRoom(ctx.tenantId, id);
    revalidatePath("/rooms");
    revalidatePath("/admin/rooms");
  });
}
