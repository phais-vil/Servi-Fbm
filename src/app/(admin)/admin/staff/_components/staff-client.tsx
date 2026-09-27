"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink, Users, AlertCircle, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  DataTable,
  type DataTableColumn,
  RowMenuItem,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonField,
  LiyonSelect,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import {
  createStaffAction,
  updateStaffAction,
  deleteStaffAction,
} from "@/features/staff/actions";
import type { StaffProfileDto, DepartmentDto } from "@/features/staff";

interface StaffClientProps {
  initialStaff: StaffProfileDto[];
  departments: DepartmentDto[];
  canManage: boolean;
}

type DialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; item: StaffProfileDto }
  | { mode: "delete"; item: StaffProfileDto };

export function StaffClient({ initialStaff, departments, canManage }: StaffClientProps) {
  const t = useT();
  const [items, setItems] = useState<StaffProfileDto[]>(initialStaff);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [isPending, startTransition] = useTransition();

  // Form State
  const [departmentId, setDepartmentId] = useState("");
  const [staffType, setStaffType] = useState<"ACADEMIC" | "SUPPORT" | "EXECUTIVE">("ACADEMIC");
  const [academicTitle, setAcademicTitle] = useState("");
  const [firstNameTh, setFirstNameTh] = useState("");
  const [lastNameTh, setLastNameTh] = useState("");
  const [firstNameEn, setFirstNameEn] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [officeRoom, setOfficeRoom] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [education, setEducation] = useState("");
  const [expertise, setExpertise] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const openCreateDialog = () => {
    setDepartmentId(departments[0]?.id ?? "");
    setStaffType("ACADEMIC");
    setAcademicTitle("");
    setFirstNameTh("");
    setLastNameTh("");
    setFirstNameEn("");
    setLastNameEn("");
    setPosition("");
    setEmail("");
    setPhone("");
    setOfficeRoom("");
    setAvatarUrl("");
    setEducation("");
    setExpertise("");
    setOrderIndex(items.length + 1);
    setIsActive(true);
    setDialog({ mode: "create" });
  };

  const openEditDialog = (item: StaffProfileDto) => {
    setDepartmentId(item.departmentId ?? "");
    setStaffType(item.staffType as "ACADEMIC" | "SUPPORT" | "EXECUTIVE");
    setAcademicTitle(item.academicTitle ?? "");
    setFirstNameTh(item.firstNameTh);
    setLastNameTh(item.lastNameTh);
    setFirstNameEn(item.firstNameEn);
    setLastNameEn(item.lastNameEn);
    setPosition(item.position ?? "");
    setEmail(item.email);
    setPhone(item.phone ?? "");
    setOfficeRoom(item.officeRoom ?? "");
    setAvatarUrl(item.avatarUrl ?? "");
    setEducation(item.education ?? "");
    setExpertise(item.expertise ?? "");
    setOrderIndex(item.orderIndex);
    setIsActive(item.isActive);
    setDialog({ mode: "edit", item });
  };

  const handleSave = () => {
    startTransition(async () => {
      const payload = {
        departmentId: departmentId || undefined,
        staffType,
        academicTitle: academicTitle.trim() || undefined,
        firstNameTh: firstNameTh.trim(),
        lastNameTh: lastNameTh.trim(),
        firstNameEn: firstNameEn.trim(),
        lastNameEn: lastNameEn.trim(),
        position: position.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        officeRoom: officeRoom.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        education: education.trim() || undefined,
        expertise: expertise.trim() || undefined,
        orderIndex,
        isActive,
      };

      if (dialog.mode === "create") {
        const res = await createStaffAction(payload);
        if (res.ok) {
          toast.success(t("staff.createSuccess"));
          setItems((prev) => [...prev, res.data]);
          setDialog({ mode: "closed" });
        } else {
          toast.error(res.error.message || "Failed to create staff");
        }
      } else if (dialog.mode === "edit") {
        const res = await updateStaffAction({
          id: dialog.item.id,
          ...payload,
        });
        if (res.ok) {
          toast.success(t("staff.updateSuccess"));
          setItems((prev) => prev.map((i) => (i.id === res.data.id ? res.data : i)));
          setDialog({ mode: "closed" });
        } else {
          toast.error(res.error.message || "Failed to update staff");
        }
      }
    });
  };

  const handleDelete = () => {
    if (dialog.mode !== "delete") return;
    const { item } = dialog;
    startTransition(async () => {
      const res = await deleteStaffAction(item.id);
      if (res.ok) {
        toast.success(t("staff.deleteSuccess"));
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setDialog({ mode: "closed" });
      } else {
        toast.error(res.error.message || "Failed to delete staff");
      }
    });
  };

  const columns: DataTableColumn<StaffProfileDto>[] = [
    {
      key: "name",
      header: t("staff.nameThField"),
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.avatarUrl}
              alt={row.fullNameTh}
              className="h-10 w-10 rounded-full object-cover border"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              {row.firstNameTh.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-sm">{row.fullNameTh}</span>
            <span className="text-xs text-muted-foreground">{row.fullNameEn}</span>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: t("staff.deptField"),
      render: (row) => (
        <span className="text-xs text-foreground/80">
          {row.departmentNameTh || "—"}
        </span>
      ),
    },
    {
      key: "position",
      header: t("staff.positionField"),
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.position || "—"}
        </span>
      ),
    },
    {
      key: "contact",
      header: t("staff.contact"),
      render: (row) => (
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span>{row.email}</span>
          </div>
          {row.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("staff.statusField"),
      render: (row) => (
        <StatusPill tone={row.isActive ? "ok" : "off"}>
          {row.isActive ? t("staff.status.active") : t("staff.status.inactive")}
        </StatusPill>
      ),
    },
  ];

  const renderRowMenu = (row: StaffProfileDto) => (
    <>
      <RowMenuItem onSelect={() => openEditDialog(row)} icon={<Pencil className="h-4 w-4" />}>
        {t("staff.edit")}
      </RowMenuItem>
      <RowMenuItem
        onSelect={() => setDialog({ mode: "delete", item: row })}
        danger
        icon={<Trash2 className="h-4 w-4" />}
      >
        {t("staff.delete")}
      </RowMenuItem>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("staff.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("staff.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/staff"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted transition"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Public Portal</span>
          </Link>
          {canManage && (
            <button
              type="button"
              onClick={openCreateDialog}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{t("staff.create")}</span>
            </button>
          )}
        </div>
      </div>

      <DataTable
        state={items.length === 0 ? "empty" : "data"}
        rows={items}
        columns={columns}
        getRowId={(row) => row.id}
        renderRowMenu={canManage ? renderRowMenu : undefined}
        headHeading={
          <div className="flex items-center gap-2">
            <span className="font-semibold">{t("staff.title")}</span>
            <span className="text-xs text-muted-foreground">({items.length})</span>
          </div>
        }
        empty={{
          icon: <Users className="h-8 w-8 text-muted-foreground" />,
          title: t("staff.empty"),
          description: t("staff.subtitle"),
        }}
        error={{
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: "Error loading staff",
          description: "Please refresh the page",
        }}
      />

      {/* Create / Edit Dialog */}
      <LiyonDialog
        open={dialog.mode === "create" || dialog.mode === "edit"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        wide
      >
        <LiyonDialogHeader
          title={dialog.mode === "create" ? t("staff.create") : t("staff.edit")}
          description={t("staff.subtitle")}
        />
        <LiyonDialogCloseButton label={t("staff.cancel")} />
        <LiyonDialogBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label={t("staff.deptField")}>
              <LiyonSelect
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">— ไม่ระบุ —</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameTh} ({d.code})
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("staff.typeField")}>
              <LiyonSelect
                value={staffType}
                onChange={(e) =>
                  setStaffType(e.target.value as "ACADEMIC" | "SUPPORT" | "EXECUTIVE")
                }
              >
                <option value="ACADEMIC">{t("staff.type.academic")}</option>
                <option value="SUPPORT">{t("staff.type.support")}</option>
                <option value="EXECUTIVE">{t("staff.type.executive")}</option>
              </LiyonSelect>
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <LiyonField label={t("staff.academicTitleField")}>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={academicTitle}
                onChange={(e) => setAcademicTitle(e.target.value)}
                placeholder="ศ., รศ.ดร., ผศ., อ."
              />
            </LiyonField>
            <LiyonField label="ชื่อ (ไทย)">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={firstNameTh}
                onChange={(e) => setFirstNameTh(e.target.value)}
                required
              />
            </LiyonField>
            <LiyonField label="นามสกุล (ไทย)">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={lastNameTh}
                onChange={(e) => setLastNameTh(e.target.value)}
                required
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label="First Name (EN)">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={firstNameEn}
                onChange={(e) => setFirstNameEn(e.target.value)}
                required
              />
            </LiyonField>
            <LiyonField label="Last Name (EN)">
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={lastNameEn}
                onChange={(e) => setLastNameEn(e.target.value)}
                required
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <LiyonField label={t("staff.positionField")}>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="หัวหน้าภาควิชา / อาจารย์"
              />
            </LiyonField>
            <LiyonField label={t("staff.emailField")}>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </LiyonField>
            <LiyonField label={t("staff.phoneField")}>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="02-123-4567"
              />
            </LiyonField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiyonField label={t("staff.officeRoomField")}>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={officeRoom}
                onChange={(e) => setOfficeRoom(e.target.value)}
                placeholder="อาคาร 3 ชั้น 4 ห้อง 3401"
              />
            </LiyonField>
            <LiyonField label={t("staff.avatarUrlField")}>
              <input
                type="url"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </LiyonField>
          </div>

          <LiyonField label={t("staff.educationField")}>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="วศ.ด. (วิศวกรรมคอมพิวเตอร์)..."
            />
          </LiyonField>

          <LiyonField label={t("staff.expertiseField")}>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="AI, Machine Learning, Cloud Systems..."
            />
          </LiyonField>

          <LiyonSwitchRow
            id="staff-active-toggle"
            checked={isActive}
            onCheckedChange={setIsActive}
            label={t("staff.statusField")}
            description={t("staff.status.active")}
          />
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            className="px-4 py-2 border rounded-md text-sm hover:bg-muted"
            onClick={() => setDialog({ mode: "closed" })}
            disabled={isPending}
          >
            {t("staff.cancel")}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            onClick={handleSave}
            disabled={
              isPending ||
              !firstNameTh.trim() ||
              !lastNameTh.trim() ||
              !email.trim()
            }
          >
            {isPending ? "..." : t("staff.save")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        danger
      >
        <LiyonDialogHeader
          title={t("staff.delete")}
          description={dialog.mode === "delete" ? dialog.item.fullNameTh : undefined}
        />
        <LiyonDialogCloseButton label={t("staff.cancel")} />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">{t("staff.deleteConfirm")}</p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            className="px-4 py-2 border rounded-md text-sm hover:bg-muted"
            onClick={() => setDialog({ mode: "closed" })}
            disabled={isPending}
          >
            {t("staff.cancel")}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-destructive text-white rounded-md text-sm font-medium hover:bg-destructive/90 disabled:opacity-50"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "..." : t("staff.delete")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
