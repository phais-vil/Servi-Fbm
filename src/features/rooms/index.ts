export type {
  MeetingRoomDto,
  RoomBookingDto,
} from "./_internal/services";
export type {
  CreateRoomInput,
  UpdateRoomInput,
  BookRoomInput,
  ReviewBookingInput,
  RoomStatusEnum,
  BookingStatusEnum,
} from "./_internal/validations";
export { roomStatuses, bookingStatuses } from "./_internal/validations";
export { ROOMS_P, ROOMS_PERMISSIONS } from "./permissions";
