import "server-only";

export {
  listMeetingRooms,
  getMeetingRoomById,
  listRoomBookings,
  checkBookingConflict,
  resolvePublicTenantId,
  type MeetingRoomDto,
  type RoomBookingDto,
} from "./_internal/services";
export { ROOMS_P, ROOMS_PERMISSIONS } from "./permissions";
