"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import { useCreateOrder, usePlans } from "@/modules/student-payments/hooks";
import { formatCurrency, storePaymentContext } from "@/modules/student-payments/utils";
import { trackStudentEvent } from "@/modules/student-analytics/events";

function normalizeFeatures(features: unknown): string[] {
  if (Array.isArray(features)) {
    return features.map((item) => String(item));
  }
  if (features && typeof features === "object") {
    return Object.values(features as Record<string, unknown>).map((item) => String(item));
  }
  return [];
}

export default function StudentPaymentsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading plans...
        </div>
      }
    >
      <PaymentsContent />
    </React.Suspense>
  );
}

function PaymentsContent() {
  const params = useSearchParams();
  const { data: plans = [], isLoading } = usePlans();
  const { subscription } = useStudentAccess();
  const createOrder = useCreateOrder();
  const [couponCode, setCouponCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    setError(null);
    try {
      const order = await createOrder.mutateAsync({
        planId,
        couponCode: couponCode.trim() || undefined,
      });
      storePaymentContext({
        merchantTransactionId: order.merchantTransactionId,
        nextPath: params.get("next") ?? undefined,
      });
      trackStudentEvent("payment_initiated", {
        planId,
        merchantTransactionId: order.merchantTransactionId,
      });
      window.location.href = order.redirectUrl;
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "Unable to start payment.";
      setError(message || "Unable to start payment.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Plans
        </p>
        <h1 className="font-display text-2xl font-semibold">
          Choose a plan that fits your prep
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Unlock premium notes, tests, and practice packs for your exams.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Crown className="h-4 w-4 text-accent" />
            Current subscription
          </div>
          {subscription?.status === "ACTIVE" ? (
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-medium">{subscription.plan?.name ?? "Active plan"}</p>
              <p className="text-xs text-muted-foreground">
                Valid until {subscription.endsAt ? new Date(subscription.endsAt).toLocaleDateString("en-IN") : "-"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No active subscription yet.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <p className="text-sm font-semibold">Have a coupon?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Apply a coupon code during checkout.
          </p>
          <input
            className="mt-3 h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan, index) => {
          const features = normalizeFeatures(plan.featuresJson);
          const highlight = subscription?.plan?.id
            ? subscription.plan.id === plan.id
            : index === 1;
          return (
            <div
              key={plan.id}
              className={
                highlight
                  ? "rounded-3xl border border-accent bg-white p-6 shadow-lg"
                  : "rounded-3xl border border-border bg-card/90 p-6 shadow-sm"
              }
            >
              {highlight ? (
                <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-wide text-accent">
                  {subscription?.plan?.id === plan.id ? "Current plan" : "Most popular"}
                </span>
              ) : null}
              <h3 className="mt-3 text-lg font-semibold">{plan.name}</h3>
              <p className="text-2xl font-semibold">{formatCurrency(plan.pricePaise)}</p>
              <p className="text-xs text-muted-foreground">
                {plan.durationDays} days
              </p>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                {features.length ? (
                  features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-accent" />
                      {feature}
                    </li>
                  ))
                ) : (
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-accent" />
                    Full access to notes, practice, and tests
                  </li>
                )}
              </ul>
              <Button
                variant={highlight ? "cta" : "secondary"}
                className="mt-6 w-full"
                onClick={() => handleCheckout(plan.id)}
                disabled={createOrder.isPending}
              >
                Buy {plan.name}
              </Button>
            </div>
          );
        })}
        {!isLoading && plans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            No plans available yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
