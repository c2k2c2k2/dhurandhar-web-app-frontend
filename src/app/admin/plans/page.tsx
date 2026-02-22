"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Can, RequirePerm } from "@/lib/auth/guards";
import {
  useAdminPlans,
  useCreateAdminPlan,
  useUpdateAdminPlan,
} from "@/modules/admin-plans/hooks";
import type {
  AdminPlan,
  AdminPlanInput,
  AdminPlanUpdateInput,
  PlanDurationUnit,
} from "@/modules/admin-plans/types";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import {
  DataTable,
  type DataTableColumn,
} from "@/modules/shared/components/DataTable";
import { FormInput, FormSelect, FormTextarea } from "@/modules/shared/components/FormField";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useToast } from "@/modules/shared/components/Toast";

function formatCurrency(paise?: number) {
  if (paise === undefined) return "-";
  return `INR ${(paise / 100).toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function parseJson(text: string, field: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${field} must be a valid JSON object.`);
  }

  return parsed as Record<string, unknown>;
}

type PlanFormState = {
  key: string;
  name: string;
  tier: string;
  priceRupees: string;
  durationUnit: PlanDurationUnit;
  durationValue: string;
  isActive: boolean;
  metadataText: string;
  featuresText: string;
};

const EMPTY_FORM: PlanFormState = {
  key: "",
  name: "",
  tier: "",
  priceRupees: "",
  durationUnit: "MONTHS",
  durationValue: "1",
  isActive: true,
  metadataText: "{}",
  featuresText: "{}",
};

function mapPlanToForm(plan: AdminPlan): PlanFormState {
  const unit = plan.validity?.unit ?? "DAYS";
  const value =
    unit === "LIFETIME"
      ? ""
      : String(
          plan.validity?.value ??
            (unit === "MONTHS"
              ? Math.max(1, Math.round(plan.durationDays / 30))
              : unit === "YEARS"
                ? Math.max(1, Math.round(plan.durationDays / 365))
                : plan.durationDays),
        );

  return {
    key: plan.key,
    name: plan.name,
    tier: plan.tier ?? "",
    priceRupees: String((plan.pricePaise / 100).toFixed(2)),
    durationUnit: unit,
    durationValue: value,
    isActive: plan.isActive,
    metadataText: JSON.stringify(plan.metadataJson ?? {}, null, 2),
    featuresText: JSON.stringify(plan.featuresJson ?? {}, null, 2),
  };
}

export default function AdminPlansPage() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<AdminPlan | null>(null);
  const [form, setForm] = React.useState<PlanFormState>(EMPTY_FORM);

  const pageSize = 20;
  const query = {
    isActive: activeFilter === "all" ? undefined : activeFilter,
    page,
    pageSize,
  };

  const { data, isLoading, error } = useAdminPlans(query);
  const createPlan = useCreateAdminPlan(query);
  const updatePlan = useUpdateAdminPlan(query);

  const openCreate = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (plan: AdminPlan) => {
    setEditingPlan(plan);
    setForm(mapPlanToForm(plan));
    setOpen(true);
  };

  const closeModal = () => {
    if (createPlan.isPending || updatePlan.isPending) {
      return;
    }
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const key = form.key.trim();
    const name = form.name.trim();
    const price = Number(form.priceRupees.trim());

    if (!key || !name) {
      toast({
        title: "Missing fields",
        description: "Plan key and name are required.",
        variant: "destructive",
      });
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast({
        title: "Invalid price",
        description: "Enter a valid rupee amount.",
        variant: "destructive",
      });
      return;
    }

    let durationValue: number | undefined;
    if (form.durationUnit !== "LIFETIME") {
      durationValue = Number(form.durationValue.trim());
      if (!Number.isFinite(durationValue) || durationValue <= 0) {
        toast({
          title: "Invalid validity",
          description: "Enter a positive duration value.",
          variant: "destructive",
        });
        return;
      }
    }

    let payload: AdminPlanInput | AdminPlanUpdateInput;
    try {
      payload = {
        key,
        name,
        tier: form.tier.trim() || undefined,
        pricePaise: Math.round(price * 100),
        durationUnit: form.durationUnit,
        durationValue,
        isActive: form.isActive,
        metadataJson: parseJson(form.metadataText, "Metadata"),
        featuresJson: parseJson(form.featuresText, "Features"),
      };
    } catch (err) {
      toast({
        title: "Invalid JSON",
        description: err instanceof Error ? err.message : "Invalid JSON payload.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ planId: editingPlan.id, payload });
        toast({ title: "Plan updated" });
      } else {
        await createPlan.mutateAsync(payload as AdminPlanInput);
        toast({ title: "Plan created" });
      }
      setOpen(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save plan.",
        variant: "destructive",
      });
    }
  };

  const plans = data?.data ?? [];

  const columns = React.useMemo<DataTableColumn<AdminPlan>[]>(
    () => [
      {
        key: "name",
        header: "Plan",
        render: (plan) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{plan.name}</p>
            <p className="text-xs text-muted-foreground">
              {plan.key}
              {plan.tier ? ` • ${plan.tier}` : ""}
            </p>
          </div>
        ),
      },
      {
        key: "pricePaise",
        header: "Price",
        render: (plan) => formatCurrency(plan.pricePaise),
      },
      {
        key: "validity",
        header: "Validity",
        render: (plan) => plan.validity?.label ?? `${plan.durationDays} days`,
      },
      {
        key: "isActive",
        header: "Status",
        render: (plan) => (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              plan.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {plan.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "updatedAt",
        header: "Updated",
        render: (plan) => formatDate(plan.updatedAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (plan) => (
          <Can perm="admin.config.write">
            <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>
              Edit
            </Button>
          </Can>
        ),
      },
    ],
    [],
  );

  return (
    <RequirePerm perm="payments.read">
      <div className="space-y-6">
        <PageHeader
          title="Plans"
          description="Create dynamic subscription plans with amount, validity and feature boundaries."
          actions={
            <Can perm="admin.config.write">
              <Button variant="secondary" onClick={openCreate}>
                Create Plan
              </Button>
            </Can>
          }
        />

        <FiltersBar
          filters={
            <FormSelect
              label="Status"
              value={activeFilter}
              onChange={(event) => {
                setActiveFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </FormSelect>
          }
          actions={
            <Button
              variant="ghost"
              onClick={() => {
                setActiveFilter("all");
                setPage(1);
              }}
            >
              Reset
            </Button>
          }
        />

        <DataTable
          columns={columns}
          rows={plans}
          loading={isLoading}
          error={
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : undefined
          }
          emptyLabel="No plans available."
          pagination={
            data && data.total > data.pageSize
              ? {
                  page: data.page,
                  pageSize: data.pageSize,
                  total: data.total,
                  onPageChange: setPage,
                }
              : undefined
          }
        />

        <Modal
          open={open}
          onOpenChange={setOpen}
          title={editingPlan ? "Edit Plan" : "Create Plan"}
          description="Set amount, validity and entitlement configuration for this subscription."
          className="max-w-2xl"
          footer={
            <>
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="cta"
                onClick={() => {
                  const formElement = document.getElementById("plan-form");
                  if (formElement instanceof HTMLFormElement) {
                    formElement.requestSubmit();
                  }
                }}
                disabled={createPlan.isPending || updatePlan.isPending}
              >
                {editingPlan ? "Update" : "Create"}
              </Button>
            </>
          }
        >
          <form id="plan-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <FormInput
              label="Plan Key"
              value={form.key}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, key: event.target.value }))
              }
              placeholder="ssc-gold-12m"
            />
            <FormInput
              label="Plan Name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="SSC Gold"
            />
            <FormInput
              label="Tier (optional)"
              value={form.tier}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tier: event.target.value }))
              }
              placeholder="gold"
            />
            <FormInput
              label="Price (INR)"
              type="number"
              min="0"
              step="0.01"
              value={form.priceRupees}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, priceRupees: event.target.value }))
              }
              placeholder="999"
            />
            <FormSelect
              label="Validity Unit"
              value={form.durationUnit}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  durationUnit: event.target.value as PlanDurationUnit,
                }))
              }
            >
              <option value="DAYS">Days</option>
              <option value="MONTHS">Months</option>
              <option value="YEARS">Years</option>
              <option value="LIFETIME">Lifetime</option>
            </FormSelect>
            <FormInput
              label="Validity Value"
              type="number"
              min="1"
              value={form.durationValue}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, durationValue: event.target.value }))
              }
              disabled={form.durationUnit === "LIFETIME"}
              placeholder={form.durationUnit === "LIFETIME" ? "N/A" : "1"}
            />
            <label className="md:col-span-2 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
              />
              Active
            </label>
            <div className="md:col-span-2">
              <FormTextarea
                label="Metadata JSON"
                value={form.metadataText}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, metadataText: event.target.value }))
                }
                className="min-h-[120px]"
              />
            </div>
            <div className="md:col-span-2">
              <FormTextarea
                label="Features JSON"
                description='Use this for entitlement boundaries. Example: {"entitlements":[{"kind":"NOTES"}]}'
                value={form.featuresText}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, featuresText: event.target.value }))
                }
                className="min-h-[140px]"
              />
            </div>
          </form>
        </Modal>
      </div>
    </RequirePerm>
  );
}
