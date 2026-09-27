# Architecture Blueprint: Curriculum & Programs

## Component Hierarchy & Data Flow

```mermaid
flowchart TD
    subgraph Client Layer
        PortalPage["Public Portal: /programs"]
        DetailPage["Detail Portal: /programs/[code]"]
        AdminPage["Admin Page: /admin/programs"]
        AdminClient["Admin Client Component: ProgramClient"]
    end

    subgraph Feature Boundary ["src/features/curriculum/"]
        PublicAPI["Public API: index.ts / server.ts / actions.ts"]
        Permissions["permissions.ts"]
        Messages["messages.ts"]
        subgraph Internal ["_internal/ (Encapsulated)"]
            Validations["validations.ts (Zod)"]
            Services["services.ts (Prisma Data Access)"]
        end
    end

    subgraph Data Store
        DB[(PostgreSQL)]
        AuditLog[(audit_logs)]
    end

    PortalPage -->|SSR Query| PublicAPI
    DetailPage -->|SSR Query| PublicAPI
    AdminPage -->|SSR Query| PublicAPI
    AdminClient -->|Server Actions| PublicAPI
    PublicAPI --> Validations
    PublicAPI --> Services
    Services --> DB
    Services --> AuditLog
```

## Security & Access Control
- Public: Anyone can read active programs via `/programs` and `/programs/[code]`.
- Admin: Requires `curriculum:read` to view table, `curriculum:manage` to create/edit/delete.
