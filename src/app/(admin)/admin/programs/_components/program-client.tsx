"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink, BookOpen, Clock, Award, AlertCircle } from "lucide-react";
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
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
} from "@/features/curriculum/actions";
import type { CurriculumProgramDto } from "@/features/curriculum";
import type { DepartmentDto } from "@/features/staff";

interface ProgramClientProps {
  initialPrograms: CurriculumProgramDto[];
  departments: DepartmentDto[];
  canManage: boolean;
}

type DialogState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; item: CurriculumProgramDto }
  | { mode: "delete"; item: CurriculumProgramDto };

export function ProgramClient({ initialPrograms, departments, canManage }: ProgramClientProps) {
  const t = useT();
  const [items, setItems] = useState<CurriculumProgramDto[]>(initialPrograms);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  const [isPending, startTransition] = useTransition();

  // Filters
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [code, setCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [degreeTitleTh, setDegreeTitleTh] = useState("");
  const [degreeTitleEn, setDegreeTitleEn] = useState("");
  const [level, setLevel] = useState<"BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA">("BACHELOR");
  const [totalCredits, setTotalCredits] = useState(120);
  const [durationYears, setDurationYears] = useState(4.0);
  const [tuitionFeePerTerm, setTuitionFeePerTerm] = useState<number | "">("");
  const [departmentId, setDepartmentId] = useState("");
  const [overview, setOverview] = useState("");
  const [careerPaths, setCareerPaths] = useState("");
  const [studyPlan, setStudyPlan] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setCode("");
    setNameTh("");
    setNameEn("");
    setDegreeTitleTh("");
    setDegreeTitleEn("");
    setLevel("BACHELOR");
    setTotalCredits(120);
    setDurationYears(4.0);
    setTuitionFeePerTerm("");
    setDepartmentId("");
    setOverview("");
    setCareerPaths("");
    setStudyPlan("");
    setCoverImage("");
    setIsActive(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialog({ mode: "create" });
  };

  const openEditDialog = (prog: CurriculumProgramDto) => {
    setCode(prog.code);
    setNameTh(prog.nameTh);
    setNameEn(prog.nameEn);
    setDegreeTitleTh(prog.degreeTitleTh);
    setDegreeTitleEn(prog.degreeTitleEn);
    setLevel(prog.level as "BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA");
    setTotalCredits(prog.totalCredits);
    setDurationYears(prog.durationYears);
    setTuitionFeePerTerm(prog.tuitionFeePerTerm ?? "");
    setDepartmentId(prog.departmentId ?? "");
    setOverview(prog.overview ?? "");
    setCareerPaths(prog.careerPaths ?? "");
    setStudyPlan(prog.studyPlan ?? "");
    setCoverImage(prog.coverImage ?? "");
    setIsActive(prog.isActive);
    setDialog({ mode: "edit", item: prog });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        code,
        nameTh,
        nameEn,
        degreeTitleTh,
        degreeTitleEn,
        level,
        totalCredits: Number(totalCredits),
        durationYears: Number(durationYears),
        tuitionFeePerTerm: tuitionFeePerTerm === "" ? null : Number(tuitionFeePerTerm),
        departmentId: departmentId || null,
        overview: overview || null,
        careerPaths: careerPaths || null,
        studyPlan: studyPlan || null,
        coverImage: coverImage || null,
        isActive,
      };

      if (dialog.mode === "create") {
        const res = await createProgramAction(payload);
        if (res.ok) {
          setItems((prev) => [res.data, ...prev]);
          setDialog({ mode: "closed" });
          toast.success(t("curriculum.createSuccess"));
        } else {
          toast.error(res.error.message || "Failed to create program");
        }
      } else if (dialog.mode === "edit") {
        const res = await updateProgramAction({ id: dialog.item.id, ...payload });
        if (res.ok) {
          setItems((prev) => prev.map((it) => (it.id === dialog.item.id ? res.data : it)));
          setDialog({ mode: "closed" });
          toast.success(t("curriculum.updateSuccess"));
        } else {
          toast.error(res.error.message || "Failed to update program");
        }
      }
    });
  };

  const handleDelete = () => {
    if (dialog.mode !== "delete") return;
    startTransition(async () => {
      const res = await deleteProgramAction(dialog.item.id);
      if (res.ok) {
        setItems((prev) => prev.filter((it) => it.id !== dialog.item.id));
        setDialog({ mode: "closed" });
        toast.success(t("curriculum.deleteSuccess"));
      } else {
        toast.error(res.error.message || "Failed to delete program");
      }
    });
  };

  const filteredItems = items.filter((item) => {
    if (selectedLevel !== "ALL" && item.level !== selectedLevel) return false;
    if (selectedDept !== "ALL" && item.departmentId !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = item.code.toLowerCase().includes(q);
      const matchNameTh = item.nameTh.toLowerCase().includes(q);
      const matchNameEn = item.nameEn.toLowerCase().includes(q);
      const matchDegree = item.degreeTitleTh.toLowerCase().includes(q) || item.degreeTitleEn.toLowerCase().includes(q);
      if (!matchCode && !matchNameTh && !matchNameEn && !matchDegree) return false;
    }
    return true;
  });

  const columns: DataTableColumn<CurriculumProgramDto>[] = [
    {
      key: "code",
      header: t("curriculum.codeField"),
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono font-bold text-xs">{row.code}</span>
          <StatusPill tone="info">{row.level}</StatusPill>
        </div>
      ),
    },
    {
      key: "name",
      header: t("curriculum.nameThField"),
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{row.nameTh}</span>
          <span className="text-xs text-muted-foreground">{row.nameEn}</span>
          <span className="text-xs text-primary/80 font-medium mt-0.5">{row.degreeTitleTh}</span>
        </div>
      ),
    },
    {
      key: "dept",
      header: t("curriculum.deptField"),
      render: (row) => (
        <span className="text-xs font-medium text-muted-foreground">
          {row.departmentNameTh || "-"}
        </span>
      ),
    },
    {
      key: "credits_duration",
      header: `${t("curriculum.totalCreditsField")} / ${t("curriculum.durationYearsField")}`,
      render: (row) => (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1 font-medium">
            <Award className="h-3 w-3 text-primary" />
            <span>{row.totalCredits} {t("curriculum.creditsUnit")}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{row.durationYears} {t("curriculum.yearsUnit")}</span>
          </div>
        </div>
      ),
    },
    {
      key: "tuition",
      header: t("curriculum.tuitionFeeField"),
      render: (row) => (
        <span className="text-xs font-semibold">
          {row.tuitionFeePerTerm ? `฿${row.tuitionFeePerTerm.toLocaleString()}` : "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: t("curriculum.statusField"),
      render: (row) => (
        <StatusPill tone={row.isActive ? "ok" : "off"}>
          {row.isActive ? t("curriculum.status.active") : t("curriculum.status.inactive")}
        </StatusPill>
      ),
    },
  ];

  const renderRowMenu = (row: CurriculumProgramDto) => (
    <>
      <RowMenuItem onSelect={() => openEditDialog(row)} icon={<Pencil className="h-4 w-4" />}>
        {t("curriculum.edit")}
      </RowMenuItem>
      <RowMenuItem
        onSelect={() => window.open(`/programs/${encodeURIComponent(row.code)}`, "_blank")}
        icon={<ExternalLink className="h-4 w-4" />}
      >
        {t("curriculum.viewDetails")}
      </RowMenuItem>
      <RowMenuItem
        onSelect={() => setDialog({ mode: "delete", item: row })}
        danger
        icon={<Trash2 className="h-4 w-4" />}
      >
        {t("curriculum.delete")}
      </RowMenuItem>
    </>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("curriculum.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("curriculum.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/programs"
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
              <span>{t("curriculum.create")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md text-sm bg-background"
            placeholder={t("curriculum.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <LiyonSelect
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="ALL">{t("curriculum.levelAll")}</option>
            <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
            <option value="MASTER">{t("curriculum.level.master")}</option>
            <option value="DOCTORAL">{t("curriculum.level.doctoral")}</option>
            <option value="DIPLOMA">{t("curriculum.level.diploma")}</option>
          </LiyonSelect>
        </div>

        <div className="w-full sm:w-48">
          <LiyonSelect
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="ALL">{t("staff.deptAll")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameTh}
              </option>
            ))}
          </LiyonSelect>
        </div>
      </div>

      {/* DataTable */}
      <DataTable<CurriculumProgramDto>
        state={filteredItems.length === 0 ? "empty" : "data"}
        headHeading={
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-semibold">{t("curriculum.title")}</span>
            <span className="text-xs text-muted-foreground">({filteredItems.length})</span>
          </div>
        }
        rows={filteredItems}
        columns={columns}
        getRowId={(row) => row.id}
        renderRowMenu={canManage ? renderRowMenu : undefined}
        empty={{
          title: t("curriculum.empty"),
          description: t("curriculum.subtitle"),
          icon: <BookOpen className="h-8 w-8 text-muted-foreground" />,
        }}
        error={{
          title: "Error loading programs",
          description: "Please refresh the page",
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
        }}
      />

      {/* Create / Edit Dialog */}
      <LiyonDialog
        open={dialog.mode === "create" || dialog.mode === "edit"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        wide
      >
        <LiyonDialogHeader
          title={dialog.mode === "create" ? t("curriculum.create") : t("curriculum.edit")}
          description={t("curriculum.subtitle")}
        />
        <LiyonDialogCloseButton label={t("curriculum.cancel")} />

        <form onSubmit={handleSubmit}>
          <LiyonDialogBody className="space-y-4 max-h-[72vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LiyonField label={t("curriculum.codeField")}>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CPE-BENG"
                  required
                />
              </LiyonField>

              <LiyonField label={t("curriculum.levelField")}>
                <LiyonSelect
                  value={level}
                  onChange={(e) => setLevel(e.target.value as "BACHELOR" | "MASTER" | "DOCTORAL" | "DIPLOMA")}
                >
                  <option value="BACHELOR">{t("curriculum.level.bachelor")}</option>
                  <option value="MASTER">{t("curriculum.level.master")}</option>
                  <option value="DOCTORAL">{t("curriculum.level.doctoral")}</option>
                  <option value="DIPLOMA">{t("curriculum.level.diploma")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("curriculum.deptField")}>
                <LiyonSelect
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="">— ไม่ระบุ —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nameTh}
                    </option>
                  ))}
                </LiyonSelect>
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.nameThField")}>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={nameTh}
                  onChange={(e) => setNameTh(e.target.value)}
                  placeholder="หลักสูตรวิศวกรรมศาสตรบัณฑิต..."
                  required
                />
              </LiyonField>

              <LiyonField label={t("curriculum.nameEnField")}>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Bachelor of Engineering..."
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("curriculum.degreeTitleThField")}>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={degreeTitleTh}
                  onChange={(e) => setDegreeTitleTh(e.target.value)}
                  placeholder="วศ.บ. (วิศวกรรมคอมพิวเตอร์)"
                  required
                />
              </LiyonField>

              <LiyonField label={t("curriculum.degreeTitleEnField")}>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={degreeTitleEn}
                  onChange={(e) => setDegreeTitleEn(e.target.value)}
                  placeholder="B.Eng. (Computer Engineering)"
                  required
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LiyonField label={t("curriculum.totalCreditsField")}>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={totalCredits}
                  onChange={(e) => setTotalCredits(Number(e.target.value))}
                  min={1}
                  required
                />
              </LiyonField>

              <LiyonField label={t("curriculum.durationYearsField")}>
                <input
                  type="number"
                  step="0.5"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={durationYears}
                  onChange={(e) => setDurationYears(Number(e.target.value))}
                  min={0.5}
                  required
                />
              </LiyonField>

              <LiyonField label={t("curriculum.tuitionFeeField")}>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={tuitionFeePerTerm}
                  onChange={(e) => setTuitionFeePerTerm(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="25000"
                />
              </LiyonField>
            </div>

            <LiyonField label={t("curriculum.coverImageField")}>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </LiyonField>

            <LiyonField label={t("curriculum.overviewField")}>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="รายละเอียดภาพรวมของหลักสูตร วัตถุประสงค์..."
              />
            </LiyonField>

            <LiyonField label={t("curriculum.careerPathsField")}>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border rounded-md text-sm"
                value={careerPaths}
                onChange={(e) => setCareerPaths(e.target.value)}
                placeholder="Software Engineer, Data Scientist, Systems Architect (คั่นด้วยจุลภาค)"
              />
            </LiyonField>

            <LiyonField label={t("curriculum.studyPlanField")}>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border rounded-md text-sm font-mono"
                value={studyPlan}
                onChange={(e) => setStudyPlan(e.target.value)}
                placeholder="ปี 1: พื้นฐานวิศวกรรม\nปี 2: โครงสร้างข้อมูล\nปี 3: คลาวด์..."
              />
            </LiyonField>

            <LiyonSwitchRow
              id="curriculum-active-toggle"
              checked={isActive}
              onCheckedChange={setIsActive}
              label={t("curriculum.statusField")}
              description={t("curriculum.status.active")}
            />
          </LiyonDialogBody>

          <LiyonDialogFooter>
            <button
              type="button"
              onClick={() => setDialog({ mode: "closed" })}
              className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition"
            >
              {t("curriculum.cancel")}
            </button>
            <button
              type="submit"
              disabled={isPending || !code.trim() || !nameTh.trim() || !nameEn.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
            >
              {isPending ? "..." : t("curriculum.save")}
            </button>
          </LiyonDialogFooter>
        </form>
      </LiyonDialog>

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) => !open && setDialog({ mode: "closed" })}
        danger
      >
        <LiyonDialogHeader
          title={t("curriculum.delete")}
          description={dialog.mode === "delete" ? `${dialog.item.code} - ${dialog.item.nameTh}` : undefined}
        />
        <LiyonDialogCloseButton label={t("curriculum.cancel")} />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">
            {t("curriculum.deleteConfirm")}
          </p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <button
            type="button"
            onClick={() => setDialog({ mode: "closed" })}
            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted transition"
          >
            {t("curriculum.cancel")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-md hover:bg-destructive/90 transition shadow-sm disabled:opacity-50"
          >
            {isPending ? "..." : t("curriculum.delete")}
          </button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
