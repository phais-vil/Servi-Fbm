import { requirePermission, hasPermission } from "@/features/identity/server";
import {
  ROOMS_P,
  listMeetingRooms,
  listRoomBookings,
} from "@/features/rooms/server";
import { RoomAdminClient } from "./_components/room-admin-client";

export default async function RoomsAdminPage() {
  const ctx = await requirePermission(ROOMS_P.roomsRead);
  const [initialRooms, initialBookings] = await Promise.all([
    listMeetingRooms(ctx.tenantId),
    listRoomBookings(ctx.tenantId),
  ]);

  return (
    <RoomAdminClient
      initialRooms={initialRooms}
      initialBookings={initialBookings}
      canManage={hasPermission(ctx, ROOMS_P.roomsManage)}
    />
  );
}
