# Implementation Plan: Curriculum & Programs (ระบบจัดการหลักสูตร)

## Steps
1. **Schema & Migration**: Add `DegreeLevel` enum and `CurriculumProgram` model to `prisma/schema.prisma`, update relations on `Tenant` and `Department`. Run `npx prisma db push` and `npx prisma generate`.
2. **Core Feature Structure**:
   - `src/features/curriculum/_internal/validations.ts` & `validations.test.ts`
   - `src/features/curriculum/_internal/services.ts`
   - `src/features/curriculum/permissions.ts`
   - `src/features/curriculum/messages.ts`
   - `src/features/curriculum/actions.ts`
   - `src/features/curriculum/server.ts`
   - `src/features/curriculum/index.ts`
3. **Integration & Seeds**:
   - Register permissions in `src/permissions.ts`
   - Register i18n in `src/i18n/index.ts`
   - Seed sample programs in `prisma/seed.ts`
   - Run `npm run db:seed`
4. **Public & Admin UI**:
   - Add `/programs` to `PUBLIC_PREFIXES` in `src/proxy.ts`
   - Public Directory: `src/app/(portal)/programs/page.tsx`
   - Public Detail: `src/app/(portal)/programs/[code]/page.tsx`
   - Admin Management: `src/app/(admin)/admin/programs/page.tsx` & `_components/program-client.tsx`
   - Navigation links in Portal layout and Admin sidebar
5. **Quality Gates & Verification**:
   - `npm run type-check; npm run type-check:tests; npm run lint; npm run deps:check; npm run test`
