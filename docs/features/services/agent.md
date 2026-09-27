# Agent Coding Rules: Student Services & Credential Verification

## 1. Modular Monolith Architecture
- All feature code MUST be located under `src/features/services/`.
- Public API contract:
  - `src/features/services/index.ts` (Client types & constants)
  - `src/features/services/server.ts` (Server functions & data loaders)
  - `src/features/services/actions.ts` (Next.js Server Actions)
- All private implementations, pure helpers, and database services MUST live in `src/features/services/_internal/`.
- Cross-feature rule: NEVER import from other features' `_internal/` directories.

## 2. Security & Verification
- Public verification endpoint `/verify/[code]` must NOT require user authentication. It reads public certification data by code and tenant.
- Sensitive mutations (approving certificates, issuing credentials) MUST require `services:manage` permission.
- Always use `ctx.tenantId` from authenticated session context for mutations.

## 3. UI & Design System (Liyon)
- Use standard Liyon primitives from `@/shared/components/liyon`: `DataTable`, `StatusPill`, `LiyonDialog`, `LiyonField`, `LiyonSelect`.
- No hardcoded strings. All user-facing text must use `t("services.*")` or standard keys.
