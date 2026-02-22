"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Can, RequirePerm } from "@/lib/auth/guards";
import {
  useAdminCoupons,
  useCreateAdminCoupon,
  useUpdateAdminCoupon,
} from "@/modules/admin-coupons/hooks";
import type {
  AdminCoupon,
  AdminCouponInput,
  AdminCouponUpdateInput,
  CouponType,
} from "@/modules/admin-coupons/types";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import {
  DataTable,
  type DataTableColumn,
} from "@/modules/shared/components/DataTable";
import { FormInput, FormSelect, FormTextarea } from "@/modules/shared/components/FormField";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { useToast } from "@/modules/shared/components/Toast";

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCouponValue(type: CouponType, value: number) {
  if (type === "PERCENT") {
    return `${value}%`;
  }
  return `INR ${(value / 100).toFixed(2)}`;
}

function parseJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Metadata must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

type CouponFormState = {
  code: string;
  type: CouponType;
  value: string;
  minAmountRupees: string;
  maxRedemptions: string;
  maxRedemptionsPerUser: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  metadataText: string;
};

const EMPTY_FORM: CouponFormState = {
  code: "",
  type: "PERCENT",
  value: "",
  minAmountRupees: "",
  maxRedemptions: "",
  maxRedemptionsPerUser: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
  metadataText: "{}",
};

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function toIso(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function mapCouponToForm(coupon: AdminCoupon): CouponFormState {
  return {
    code: coupon.code,
    type: coupon.type,
    value:
      coupon.type === "PERCENT"
        ? String(coupon.value)
        : String((coupon.value / 100).toFixed(2)),
    minAmountRupees:
      coupon.minAmountPaise !== null && coupon.minAmountPaise !== undefined
        ? String((coupon.minAmountPaise / 100).toFixed(2))
        : "",
    maxRedemptions:
      coupon.maxRedemptions !== null && coupon.maxRedemptions !== undefined
        ? String(coupon.maxRedemptions)
        : "",
    maxRedemptionsPerUser:
      coupon.maxRedemptionsPerUser !== null &&
      coupon.maxRedemptionsPerUser !== undefined
        ? String(coupon.maxRedemptionsPerUser)
        : "",
    startsAt: toDateTimeLocal(coupon.startsAt),
    endsAt: toDateTimeLocal(coupon.endsAt),
    isActive: coupon.isActive,
    metadataText: JSON.stringify(coupon.metadataJson ?? {}, null, 2),
  };
}

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [open, setOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<AdminCoupon | null>(
    null,
  );
  const [form, setForm] = React.useState<CouponFormState>(EMPTY_FORM);

  const pageSize = 20;
  const query = {
    isActive: activeFilter === "all" ? undefined : activeFilter,
    page,
    pageSize,
  };

  const { data, isLoading, error } = useAdminCoupons(query);
  const createCoupon = useCreateAdminCoupon(query);
  const updateCoupon = useUpdateAdminCoupon(query);

  const openCreate = () => {
    setEditingCoupon(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon);
    setForm(mapCouponToForm(coupon));
    setOpen(true);
  };

  const closeModal = () => {
    if (createCoupon.isPending || updateCoupon.isPending) {
      return;
    }
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const code = form.code.trim().toUpperCase();
    const value = Number(form.value.trim());

    if (!code) {
      toast({
        title: "Invalid code",
        description: "Coupon code is required.",
        variant: "destructive",
      });
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      toast({
        title: "Invalid value",
        description: "Enter a positive coupon value.",
        variant: "destructive",
      });
      return;
    }

    const minAmountRupees = Number(form.minAmountRupees.trim());
    const maxRedemptions = Number(form.maxRedemptions.trim());
    const maxRedemptionsPerUser = Number(form.maxRedemptionsPerUser.trim());

    let payload: AdminCouponInput | AdminCouponUpdateInput;
    try {
      payload = {
        code,
        type: form.type,
        value: form.type === "PERCENT" ? Math.round(value) : Math.round(value * 100),
        minAmountPaise:
          Number.isFinite(minAmountRupees) && minAmountRupees > 0
            ? Math.round(minAmountRupees * 100)
            : undefined,
        maxRedemptions:
          Number.isFinite(maxRedemptions) && maxRedemptions > 0
            ? Math.round(maxRedemptions)
            : undefined,
        maxRedemptionsPerUser:
          Number.isFinite(maxRedemptionsPerUser) && maxRedemptionsPerUser > 0
            ? Math.round(maxRedemptionsPerUser)
            : undefined,
        startsAt: toIso(form.startsAt),
        endsAt: toIso(form.endsAt),
        isActive: form.isActive,
        metadataJson: parseJson(form.metadataText),
      };
    } catch (err) {
      toast({
        title: "Invalid JSON",
        description: err instanceof Error ? err.message : "Invalid metadata JSON.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCoupon) {
        await updateCoupon.mutateAsync({ couponId: editingCoupon.id, payload });
        toast({ title: "Coupon updated" });
      } else {
        await createCoupon.mutateAsync(payload as AdminCouponInput);
        toast({ title: "Coupon created" });
      }
      setOpen(false);
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to save coupon.",
        variant: "destructive",
      });
    }
  };

  const coupons = data?.data ?? [];

  const columns = React.useMemo<DataTableColumn<AdminCoupon>[]>(
    () => [
      {
        key: "code",
        header: "Coupon",
        render: (coupon) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{coupon.code}</p>
            <p className="text-xs text-muted-foreground">{coupon.type}</p>
          </div>
        ),
      },
      {
        key: "value",
        header: "Value",
        render: (coupon) => formatCouponValue(coupon.type, coupon.value),
      },
      {
        key: "minAmountPaise",
        header: "Min Order",
        render: (coupon) =>
          coupon.minAmountPaise
            ? `INR ${(coupon.minAmountPaise / 100).toFixed(2)}`
            : "-",
      },
      {
        key: "window",
        header: "Window",
        render: (coupon) => `${formatDate(coupon.startsAt)} to ${formatDate(coupon.endsAt)}`,
      },
      {
        key: "isActive",
        header: "Status",
        render: (coupon) => (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              coupon.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {coupon.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (coupon) => (
          <Can perm="admin.config.write">
            <Button variant="ghost" size="sm" onClick={() => openEdit(coupon)}>
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
          title="Coupons"
          description="Manage discount codes used during student checkout."
          actions={
            <Can perm="admin.config.write">
              <Button variant="secondary" onClick={openCreate}>
                Create Coupon
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
          rows={coupons}
          loading={isLoading}
          error={
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : undefined
          }
          emptyLabel="No coupons found."
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
          title={editingCoupon ? "Edit Coupon" : "Create Coupon"}
          description="Configure coupon value, limits and active window."
          className="max-w-2xl"
          footer={
            <>
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="cta"
                onClick={() => {
                  const formElement = document.getElementById("coupon-form");
                  if (formElement instanceof HTMLFormElement) {
                    formElement.requestSubmit();
                  }
                }}
                disabled={createCoupon.isPending || updateCoupon.isPending}
              >
                {editingCoupon ? "Update" : "Create"}
              </Button>
            </>
          }
        >
          <form
            id="coupon-form"
            className="grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <FormInput
              label="Coupon Code"
              value={form.code}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, code: event.target.value }))
              }
              placeholder="WELCOME10"
            />
            <FormSelect
              label="Type"
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  type: event.target.value as CouponType,
                }))
              }
            >
              <option value="PERCENT">Percent</option>
              <option value="FIXED">Fixed amount</option>
            </FormSelect>
            <FormInput
              label={form.type === "PERCENT" ? "Value (%)" : "Value (INR)"}
              type="number"
              min="0"
              step={form.type === "PERCENT" ? "1" : "0.01"}
              value={form.value}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, value: event.target.value }))
              }
            />
            <FormInput
              label="Minimum order (INR)"
              type="number"
              min="0"
              step="0.01"
              value={form.minAmountRupees}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, minAmountRupees: event.target.value }))
              }
            />
            <FormInput
              label="Max redemptions"
              type="number"
              min="1"
              value={form.maxRedemptions}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, maxRedemptions: event.target.value }))
              }
            />
            <FormInput
              label="Max redemptions per user"
              type="number"
              min="1"
              value={form.maxRedemptionsPerUser}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, maxRedemptionsPerUser: event.target.value }))
              }
            />
            <FormInput
              label="Starts at"
              type="datetime-local"
              value={form.startsAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startsAt: event.target.value }))
              }
            />
            <FormInput
              label="Ends at"
              type="datetime-local"
              value={form.endsAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endsAt: event.target.value }))
              }
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
          </form>
        </Modal>
      </div>
    </RequirePerm>
  );
}
