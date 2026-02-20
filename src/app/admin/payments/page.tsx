"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Can, RequirePerm } from "@/lib/auth/guards";
import { useToast } from "@/modules/shared/components/Toast";
import { FiltersBar } from "@/modules/shared/components/FiltersBar";
import { Modal } from "@/modules/shared/components/Modal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import {
  DataTable,
  type DataTableColumn,
} from "@/modules/shared/components/DataTable";
import {
  usePaymentOrders,
  useFinalizePaymentOrder,
  useRefundPaymentOrder,
} from "@/modules/payments/hooks";
import type {
  PaymentOrder,
  PaymentTransaction,
  PaymentEvent,
} from "@/modules/payments/types";
import { FormInput } from "@/modules/shared/components/FormField";

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

function formatAmount(paise?: number | null) {
  if (!paise && paise !== 0) return "-";
  return `INR ${(paise / 100).toFixed(2)}`;
}

function statusBadge(status?: string | null) {
  const normalized = status || "UNKNOWN";
  const classes: Record<string, string> = {
    SUCCESS: "bg-emerald-50 text-emerald-700",
    FAILED: "bg-rose-50 text-rose-700",
    PENDING: "bg-amber-50 text-amber-700",
    CREATED: "bg-amber-50 text-amber-700",
    EXPIRED: "bg-slate-100 text-slate-600",
    CANCELLED: "bg-slate-100 text-slate-600",
    REFUNDED: "bg-indigo-50 text-indigo-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${classes[normalized] ?? "bg-muted text-muted-foreground"}`}
    >
      {normalized}
    </span>
  );
}

function TransactionList({ items }: { items?: PaymentTransaction[] }) {
  if (!items || !items.length) {
    return (
      <p className="text-sm text-muted-foreground">No transactions logged.</p>
    );
  }
  return (
    <div className="space-y-2 text-sm">
      {items.map((transaction) => (
        <div
          key={transaction.id}
          className="rounded-xl border border-border bg-muted/40 px-3 py-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">
              {transaction.status || "UNKNOWN"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(transaction.createdAt)}
            </span>
          </div>
          {transaction.providerTransactionId ? (
            <p className="text-xs text-muted-foreground">
              Provider ID: {transaction.providerTransactionId}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EventList({ items }: { items?: PaymentEvent[] }) {
  if (!items || !items.length) {
    return <p className="text-sm text-muted-foreground">No events recorded.</p>;
  }
  return (
    <div className="space-y-2 text-sm">
      {items.map((event) => (
        <div
          key={event.id}
          className="rounded-xl border border-border bg-muted/40 px-3 py-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">{event.eventType || "EVENT"}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(event.createdAt)}
            </span>
          </div>
          {event.providerEventId ? (
            <p className="text-xs text-muted-foreground">
              Provider ID: {event.providerEventId}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const { toast } = useToast();
  const [status, setStatus] = React.useState("");
  const [userId, setUserId] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [activeOrder, setActiveOrder] = React.useState<PaymentOrder | null>(
    null,
  );
  const pageSize = 20;

  const query = {
    status: status || undefined,
    userId: userId || undefined,
    from: from || undefined,
    to: to || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, error } = usePaymentOrders(query);
  const finalizeOrder = useFinalizePaymentOrder(query);
  const refundOrder = useRefundPaymentOrder(query);

  const handleFinalize = React.useCallback(
    async (orderId: string) => {
      try {
        await finalizeOrder.mutateAsync(orderId);
        toast({ title: "Order refreshed" });
      } catch (err) {
        toast({
          title: "Finalize failed",
          description:
            err && typeof err === "object" && "message" in err
              ? String(err.message)
              : "Unable to finalize order.",
          variant: "destructive",
        });
      }
    },
    [finalizeOrder, toast],
  );

  const handleRefund = React.useCallback(
    async (order: PaymentOrder) => {
      const amountInput = window.prompt(
        "Refund amount in paise (leave empty for full remaining refund):",
        "",
      );
      if (amountInput === null) return;

      let amountPaise: number | undefined;
      const trimmedAmount = amountInput.trim();
      if (trimmedAmount) {
        const parsed = Number(trimmedAmount);
        if (
          !Number.isFinite(parsed) ||
          parsed <= 0 ||
          !Number.isInteger(parsed)
        ) {
          toast({
            title: "Invalid amount",
            description: "Enter a positive integer amount in paise.",
            variant: "destructive",
          });
          return;
        }
        amountPaise = parsed;
      }

      const reasonInput = window.prompt("Refund reason (optional):", "") ?? "";
      const reason = reasonInput.trim() || undefined;

      try {
        const result = await refundOrder.mutateAsync({
          orderId: order.id,
          payload: {
            amountPaise,
            reason,
          },
        });
        toast({
          title: "Refund initiated",
          description: `Refund ID: ${result.merchantRefundId} (${result.state || "PENDING"})`,
        });
      } catch (err) {
        toast({
          title: "Refund failed",
          description:
            err && typeof err === "object" && "message" in err
              ? String(err.message)
              : "Unable to initiate refund.",
          variant: "destructive",
        });
      }
    },
    [refundOrder, toast],
  );

  const columns = React.useMemo<DataTableColumn<PaymentOrder>[]>(
    () => [
      {
        key: "order",
        header: "Order",
        render: (order) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">{order.id}</p>
            <p className="text-xs text-muted-foreground">
              {order.user?.email || order.userId || "Unknown user"}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (order) => statusBadge(order.status),
      },
      {
        key: "amount",
        header: "Amount",
        render: (order) => (
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {formatAmount(order.finalAmountPaise ?? order.amountPaise)}
            </p>
            {order.amountPaise &&
            order.finalAmountPaise &&
            order.amountPaise !== order.finalAmountPaise ? (
              <p className="text-xs text-muted-foreground">
                Base {formatAmount(order.amountPaise)}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: "createdAt",
        header: "Created",
        render: (order) => formatDate(order.createdAt),
      },
      {
        key: "actions",
        header: "",
        className: "text-right",
        render: (order) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveOrder(order)}
            >
              View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={finalizeOrder.isPending}
              onClick={() => handleFinalize(order.id)}
            >
              Finalize
            </Button>
            {order.status === "SUCCESS" || order.status === "REFUNDED" ? (
              <Can perm="payments.refund">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={refundOrder.isPending}
                  onClick={() => handleRefund(order)}
                >
                  Refund
                </Button>
              </Can>
            ) : null}
          </div>
        ),
      },
    ],
    [
      finalizeOrder.isPending,
      refundOrder.isPending,
      handleFinalize,
      handleRefund,
    ],
  );

  const orders = data?.data ?? [];

  return (
    <RequirePerm perm="payments.read">
      <div className="space-y-6">
        <PageHeader
          title="Payments"
          description="Review payment orders and refresh pending transactions."
        />
        <FiltersBar
          filters={
            <>
              <Input
                placeholder="User ID (optional)"
                value={userId}
                onChange={(event) => {
                  setUserId(event.target.value);
                  setPage(1);
                }}
              />
              <select
                className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All statuses</option>
                <option value="CREATED">Created</option>
                <option value="PENDING">Pending</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <FormInput
                label="From"
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(1);
                }}
              />
              <FormInput
                label="To"
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(1);
                }}
              />
            </>
          }
          actions={
            <Button
              variant="secondary"
              onClick={() => {
                setStatus("");
                setUserId("");
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              Reset
            </Button>
          }
        />

        <DataTable
          columns={columns}
          rows={orders}
          loading={isLoading}
          error={
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : error
                ? "Unable to load orders."
                : null
          }
          emptyLabel="No payment orders found."
          pagination={
            data && data.total > data.pageSize
              ? {
                  page: data.page,
                  pageSize: data.pageSize,
                  total: data.total,
                  onPageChange: (nextPage) => setPage(nextPage),
                }
              : undefined
          }
        />
      </div>

      <Modal
        open={Boolean(activeOrder)}
        onOpenChange={(open) => {
          if (!open) setActiveOrder(null);
        }}
        title="Order Details"
        description="Payment order summary and events."
        className="max-w-3xl"
      >
        {activeOrder ? (
          <div className="space-y-5 text-sm">
            <div className="grid gap-3 rounded-2xl border border-border bg-muted/40 p-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-medium">{activeOrder.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Merchant Txn ID</p>
                <p className="font-medium">
                  {activeOrder.merchantTransactionId || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                {statusBadge(activeOrder.status)}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">User</p>
                <p>{activeOrder.user?.email || activeOrder.userId || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Merchant User ID
                </p>
                <p>{activeOrder.merchantUserId || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="font-medium">
                  {formatAmount(
                    activeOrder.finalAmountPaise ?? activeOrder.amountPaise,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p>{formatDate(activeOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p>{formatDate(activeOrder.completedAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">Transactions</p>
              <TransactionList items={activeOrder.transactions} />
            </div>

            <div>
              <p className="text-sm font-semibold">Events</p>
              <EventList items={activeOrder.events} />
            </div>

            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleFinalize(activeOrder.id)}
                  disabled={finalizeOrder.isPending}
                >
                  Refresh Status
                </Button>
                {activeOrder.status === "SUCCESS" ||
                activeOrder.status === "REFUNDED" ? (
                  <Can perm="payments.refund">
                    <Button
                      variant="secondary"
                      onClick={() => handleRefund(activeOrder)}
                      disabled={refundOrder.isPending}
                    >
                      Refund
                    </Button>
                  </Can>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </RequirePerm>
  );
}
