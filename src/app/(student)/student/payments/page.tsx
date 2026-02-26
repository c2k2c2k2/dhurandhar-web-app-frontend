"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/modules/i18n";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import { usePlanOptions, usePlans } from "@/modules/student-payments/hooks";
import type { PlanPurchase } from "@/modules/student-payments/types";
import { formatCurrency } from "@/modules/student-payments/utils";

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
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const { data: planOptions = [], isLoading: loadingOptions } = usePlanOptions();
  const { data: basicPlans = [], isLoading: loadingBasicPlans } = usePlans();
  const { subscription } = useStudentAccess();
  const isLoading = loadingOptions || loadingBasicPlans;

  const plans = React.useMemo(
    () =>
      planOptions.length
        ? planOptions
        : basicPlans.map((plan) => {
            const purchase: PlanPurchase = {
              canPurchase: true,
              mode: "NEW",
              reason: "AVAILABLE",
              message: undefined,
            };
            return {
              ...plan,
              purchase,
              activeSubscription: null,
            };
          }),
    [basicPlans, planOptions],
  );

  const handleCheckout = (planId: string) => {
    const query = new URLSearchParams();
    query.set("planId", planId);
    const next = params.get("next");
    if (next) {
      query.set("next", next);
    }
    router.push(`/student/payments/checkout?${query.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Plans
        </p>
        <h1 className="font-display text-2xl font-semibold">
          {t("student.payments.heading")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("student.payments.subheading")}
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
                Valid until{" "}
                {subscription.endsAt
                  ? new Date(subscription.endsAt).toLocaleDateString("en-IN")
                  : "-"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No active subscription yet.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
          <p className="text-sm font-semibold">Checkout step added</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Review plan details, coupon discount, and AutoPay options before redirecting to
            PhonePe.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan, index) => {
          const features = normalizeFeatures(plan.featuresJson);
          const validityLabel =
            plan.validity?.label || `${plan.durationDays} days`;
          const highlight = subscription?.plan?.id
            ? subscription.plan.id === plan.id
            : index === 1;
          const purchase = plan.purchase;
          const disabled = purchase?.canPurchase === false;
          const ctaLabel =
            purchase?.mode === "RENEW"
              ? `Renew ${plan.name}`
              : `Continue with ${plan.name}`;
          return (
            <div
              key={plan.id}
              className={
                highlight
                  ? "rounded-3xl border border-accent bg-card p-6 shadow-lg"
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
                {validityLabel}
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
                disabled={disabled}
              >
                {ctaLabel}
              </Button>
              {purchase?.message ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {purchase.message}
                </p>
              ) : null}
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
