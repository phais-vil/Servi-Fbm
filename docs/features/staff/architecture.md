# Technical Architecture & Flow
## ฟีเจอร์: ระบบจัดการบุคลากร (Staff & Faculty Directory)

### 1. โครงสร้างโฟลเดอร์ของฟีเจอร์ (Folder Structure)
```
src/features/staff/
├── index.ts              # Client-safe exports (types, enums, DTOs)
├── server.ts             # Server functions (listStaff, listDepartments)
├── actions.ts            # Server Actions re-export
├── permissions.ts        # RBAC permissions (STAFF_P, STAFF_PERMISSIONS)
├── messages.ts           # i18n messages (TH/EN)
└── _internal/
    ├── services.ts       # Database queries & business logic
    ├── validations.ts    # Zod schemas (createStaffSchema, updateStaffSchema)
    ├── actions.ts        # Internal Server Actions implementation
    └── validations.test.ts # Unit tests for validations
```

### 2. Route Mapping
| เส้นทาง (Route) | ประเภท | รายละเอียด |
| :--- | :--- | :--- |
| `src/app/(portal)/staff/page.tsx` | Server Component | หน้ารวมไดเรกทอรีคณาจารย์และบุคลากรสาธารณะ แยกตามภาควิชา |
| `src/app/(admin)/admin/staff/page.tsx` | Server Component | หน้าจัดการบุคลากรฝั่งผู้ดูแลระบบ (Admin) |
| `src/app/(admin)/admin/staff/_components/staff-client.tsx` | Client Component | ตารางบุคลากร ตัวกรอง และโมดอลเพิ่ม/แก้ไข |

### 3. Permissions (RBAC)
ลงทะเบียนสิทธิ์ใน `src/permissions.ts`:
- `staff:read` — สิทธิ์เข้าดูข้อมูลบุคลากรในระบบหลังบ้าน
- `staff:manage` — สิทธิ์เพิ่ม ลบ และแก้ไขข้อมูลบุคลากร
- `staff:profile:update` — สิทธิ์อัปเดตประวัติตนเอง
