# Implementation Plan: Document & Workflow Management

## Milestones
1. **Schema & Migration**: Add enums (`DocumentType`, `DocumentStatus`, `ApprovalDecision`) and models (`DocumentRequest`, `DocumentApproval`) to `prisma/schema.prisma`. Run `prisma db push` and `prisma generate`.
2. **Feature Structure & Validation**:
   - `src/features/documents/_internal/validations.ts` & `validations.test.ts`
   - `src/features/documents/_internal/services.ts`
   - `src/features/documents/permissions.ts`
   - `src/features/documents/messages.ts`
   - `src/features/documents/actions.ts`
   - `src/features/documents/server.ts`
   - `src/features/documents/index.ts`
3. **Registration & Seeding**:
   - Register in `src/permissions.ts`
   - Register in `src/i18n/index.ts`
   - Seed sample requests & approvals in `prisma/seed.ts`
   - Run `npm run db:seed`
4. **UI Implementation**:
   - Add `/requests` to `PUBLIC_PREFIXES` in `src/proxy.ts`
   - Portal: `src/app/(portal)/requests/page.tsx`, `new/page.tsx`, `[code]/page.tsx`
   - Admin: `src/app/(admin)/admin/documents/page.tsx` & `_components/document-client.tsx`
   - Add nav link in Portal layout and Admin sidebar
5. **Verification**:
   - Run full check (`type-check`, `lint`, `deps:check`, `test`, `e2e/http`)
