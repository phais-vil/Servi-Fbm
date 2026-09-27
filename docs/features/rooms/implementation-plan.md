# Implementation Plan: Faculty Meeting Room Booking

## Milestones
1. **Schema & Migration**: Add enums (`RoomStatus`, `BookingStatus`) and models (`MeetingRoom`, `RoomBooking`) to `prisma/schema.prisma`. Run `prisma db push` and `prisma generate`.
2. **Feature Structure & Validation**:
   - `src/features/rooms/_internal/validations.ts` & `validations.test.ts`
   - `src/features/rooms/_internal/services.ts` (with overlap conflict checker)
   - `src/features/rooms/permissions.ts`
   - `src/features/rooms/messages.ts`
   - `src/features/rooms/actions.ts`
   - `src/features/rooms/server.ts`
   - `src/features/rooms/index.ts`
3. **Registration & Seeding**:
   - Register in `src/permissions.ts`
   - Register in `src/i18n/index.ts`
   - Seed sample meeting rooms & bookings in `prisma/seed.ts`
   - Run `npm run db:seed`
4. **UI Implementation**:
   - Add `/rooms` to `PUBLIC_PREFIXES` in `src/proxy.ts`
   - Portal: `src/app/(portal)/rooms/page.tsx` (Directory & Schedule), `[id]/page.tsx` (Booking Form & Details)
   - Admin: `src/app/(admin)/admin/rooms/page.tsx` & `_components/room-admin-client.tsx`
   - Add nav link in Portal layout and Admin sidebar
5. **Verification**:
   - Run full check (`type-check`, `lint`, `deps:check`, `test`, `e2e/http`)
