"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmOrder } from "@/modules/student-payments/api";
import {
  useCheckoutPreview,
  useCreateOrder,
  usePlanOptions,
  usePlans,
} from "@/modules/student-payments/hooks";
import type {
  CheckoutResponse,
  PlanPurchase,
} from "@/modules/student-payments/types";
import {
  formatCurrency,
  storePaymentContext,
} from "@/modules/student-payments/utils";
import { trackStudentEvent } from "@/modules/student-analytics/events";

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id?: string;
  subscription_id?: string;
  recurring?: boolean;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayCheckoutInstance = {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailureResponse) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayCheckoutOptions,
    ) => RazorpayCheckoutInstance;
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

function normalizeFeatures(features: unknown): string[] {
  if (features && typeof features === "object" && !Array.isArray(features)) {
    const explicitList = (features as Record<string, unknown>).featureList;
    if (Array.isArray(explicitList)) {
      return explicitList.map((item) => String(item).trim()).filter(Boolean);
    }
  }
  if (Array.isArray(features)) {
    return features.map((item) => String(item).trim()).filter(Boolean);
  }
  if (features && typeof features === "object") {
    return Object.values(features as Record<string, unknown>)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  return [];
}

function getProviderLabel(provider?: "PHONEPE" | "RAZORPAY") {
  if (provider === "RAZORPAY") {
    return "Razorpay";
  }
  if (provider === "PHONEPE") {
    return "PhonePe";
  }
  return "payment gateway";
}

function buildReturnUrl(merchantTransactionId: string, nextPath?: string) {
  const url = new URL("/student/payments/return", window.location.origin);
  url.searchParams.set("merchantTransactionId", merchantTransactionId);
  if (nextPath) {
    url.searchParams.set("next", nextPath);
  }
  return url.toString();
}

function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not available."));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Razorpay Checkout.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay Checkout."));
    document.body.appendChild(script);
  }).catch((error) => {
    razorpayScriptPromise = null;
    throw error;
  });

  return razorpayScriptPromise;
}

export default function StudentPaymentsCheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent />
    </React.Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = params.get("planId") ?? "";
  const nextPath = params.get("next") ?? undefined;

  const { data: planOptions = [], isLoading: loadingOptions } =
    usePlanOptions();
  const { data: basicPlans = [], isLoading: loadingBasicPlans } = usePlans();
  const preview = useCheckoutPreview();
  const createOrder = useCreateOrder();

  const [couponCode, setCouponCode] = React.useState("");
  const [enableAutoPay, setEnableAutoPay] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isGatewayBusy, setIsGatewayBusy] = React.useState(false);

  const isLoadingPlans = loadingOptions || loadingBasicPlans;

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

  const selectedPlan = React.useMemo(
    () => plans.find((plan) => plan.id === planId),
    [planId, plans],
  );

  const previewKeyRef = React.useRef<string>("");
  React.useEffect(() => {
    if (!planId) return;

    const key = JSON.stringify({
      planId,
      couponCode: couponCode.trim().toUpperCase(),
      enableAutoPay,
    });
    if (previewKeyRef.current === key) {
      return;
    }

    const timeout = window.setTimeout(() => {
      previewKeyRef.current = key;
      preview
        .mutateAsync({
          planId,
          couponCode: couponCode.trim() || undefined,
          enableAutoPay,
        })
        .then((response) => {
          setError(null);
          if (!response.autoPay.eligible && enableAutoPay) {
            setEnableAutoPay(false);
          }
        })
        .catch((err) => {
          const message =
            err && typeof err === "object" && "message" in err
              ? String((err as { message?: string }).message ?? "")
              : "Unable to prepare checkout.";
          setError(message || "Unable to prepare checkout.");
        });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [planId, couponCode, enableAutoPay, preview]);

  const previewData = preview.data;
  const features = normalizeFeatures(selectedPlan?.featuresJson);
  const canPurchase = selectedPlan?.purchase?.canPurchase !== false;
  const providerLabel = getProviderLabel(previewData?.paymentProvider);

  const launchRazorpayCheckout = React.useCallback(
    async (order: CheckoutResponse) => {
      if (!order.razorpay) {
        throw new Error("Razorpay checkout details are missing.");
      }
      if (order.flow === "AUTOPAY_SETUP" && !order.razorpay.subscriptionId) {
        throw new Error("Razorpay subscription details are missing.");
      }
      if (order.flow !== "AUTOPAY_SETUP" && !order.razorpay.orderId) {
        throw new Error("Razorpay order details are missing.");
      }

      await loadRazorpayCheckoutScript();
      if (!window.Razorpay) {
        throw new Error("Razorpay Checkout is unavailable.");
      }

      const returnUrl = buildReturnUrl(order.merchantTransactionId, nextPath);
      let hasNavigated = false;
      const navigateToReturn = () => {
        if (hasNavigated) return;
        hasNavigated = true;
        window.location.assign(returnUrl);
      };

      const checkout = new window.Razorpay({
        key: order.razorpay.keyId,
        amount: order.razorpay.amountPaise,
        currency: order.razorpay.currency,
        name: order.razorpay.name,
        description: order.razorpay.description,
        order_id: order.razorpay.orderId,
        subscription_id: order.razorpay.subscriptionId,
        recurring: order.flow === "AUTOPAY_SETUP" ? true : undefined,
        prefill: order.razorpay.prefill,
        notes: {
          merchantTransactionId: order.merchantTransactionId,
          orderId: order.orderId,
        },
        modal: {
          ondismiss: () => {
            setIsGatewayBusy(false);
            navigateToReturn();
          },
        },
        handler: (response) => {
          void (async () => {
            try {
              await confirmOrder({
                merchantTransactionId: order.merchantTransactionId,
                providerOrderId: response.razorpay_order_id,
                providerSubscriptionId: response.razorpay_subscription_id,
                providerPaymentId: response.razorpay_payment_id,
                providerSignature: response.razorpay_signature,
              });
            } catch {
              // Return page polling will reconcile the latest provider state.
            } finally {
              navigateToReturn();
            }
          })();
        },
      });

      checkout.on("payment.failed", (response) => {
        trackStudentEvent("payment_fail", {
          merchantTransactionId: order.merchantTransactionId,
          provider: "RAZORPAY",
          code: response.error?.code,
          description: response.error?.description,
        });
      });

      checkout.open();
    },
    [nextPath],
  );

  const handleConfirm = async () => {
    if (!planId) return;

    setError(null);
    setIsGatewayBusy(true);
    try {
      const order = await createOrder.mutateAsync({
        planId,
        couponCode: couponCode.trim() || undefined,
        enableAutoPay,
      });

      storePaymentContext({
        merchantTransactionId: order.merchantTransactionId,
        nextPath,
      });

      trackStudentEvent("payment_initiated", {
        planId,
        merchantTransactionId: order.merchantTransactionId,
        flow: order.flow,
        provider: order.provider,
        autoPay: enableAutoPay,
      });

      if (order.provider === "RAZORPAY") {
        await launchRazorpayCheckout(order);
        return;
      }

      if (!order.redirectUrl) {
        throw new Error("Unable to prepare the payment redirect.");
      }

      window.location.assign(order.redirectUrl);
    } catch (err) {
      setIsGatewayBusy(false);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message ?? "")
          : "Unable to start payment.";
      setError(message || "Unable to start payment.");
    }
  };

  if (!planId) {
    return (
      <div className="rounded-3xl border border-border bg-card/90 p-6 text-sm text-muted-foreground">
        Missing plan selection.{" "}
        <Link href="/student/payments" className="underline">
          Go back to plans
        </Link>
        .
      </div>
    );
  }

  if (!isLoadingPlans && !selectedPlan) {
    return (
      <div className="rounded-3xl border border-border bg-card/90 p-6 text-sm text-muted-foreground">
        Selected plan is not available anymore.{" "}
        <Link href="/student/payments" className="underline">
          Choose another plan
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Checkout
          </p>
          <h1 className="font-display text-2xl font-semibold">
            Confirm your plan
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review the plan, final payable amount, and AutoPay setup before
            continuing to {providerLabel}.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => router.push("/student/payments")}
        >
          Back
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm lg:col-span-3">
          <h2 className="text-lg font-semibold">
            {selectedPlan?.name ?? "Selected plan"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Validity:{" "}
            {selectedPlan?.validity?.label ??
              `${selectedPlan?.durationDays ?? 0} days`}
          </p>

          <div className="mt-5 space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Coupon code
              </label>
              <input
                className="mt-2 h-10 w-full rounded-2xl border border-border bg-background px-3 text-sm"
                placeholder="Enter coupon (optional)"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
              />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-border bg-background/80 p-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={enableAutoPay}
                onChange={(event) => setEnableAutoPay(event.target.checked)}
                disabled={previewData?.autoPay?.eligible === false}
              />
              <div>
                <p className="text-sm font-semibold">Enable AutoPay</p>
                <p className="text-xs text-muted-foreground">
                  {previewData?.autoPay?.message ||
                    "Automatically renew this plan on each billing cycle to avoid interruption."}
                </p>
              </div>
            </label>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-3 text-xs text-emerald-700">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Secure payment with {providerLabel}
            </div>
            <p className="mt-1">
              {previewData?.paymentProvider === "RAZORPAY"
                ? previewData?.autoPay?.requested
                  ? "Razorpay Checkout will open securely to authorize AutoPay and complete the first payment."
                  : "Razorpay Checkout will open securely to complete payment authorization."
                : "You will be redirected securely to complete payment authorization."}
            </p>
          </div>

          <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
            {(
              features.length
                ? features
                : ["Full access to notes, tests, and practice"]
            )
              .slice(0, 6)
              .map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {feature}
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm lg:col-span-2">
          <p className="text-sm font-semibold">Payment summary</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plan price</span>
              <span>
                {formatCurrency(
                  previewData?.baseAmountPaise ?? selectedPlan?.pricePaise ?? 0,
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-emerald-600">
                -
                {formatCurrency(previewData?.discountPaise ?? 0)}
              </span>
            </div>
            <div className="border-t border-border pt-2" />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total payable</span>
              <span>
                {formatCurrency(
                  previewData?.finalAmountPaise ?? selectedPlan?.pricePaise ?? 0,
                )}
              </span>
            </div>
          </div>

          {previewData?.autoPay?.requested ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Renewal cycle: every {previewData.autoPay.intervalCount}{" "}
              {previewData.autoPay.intervalUnit.toLowerCase()}
              {previewData.autoPay.intervalCount > 1 ? "s" : ""}.
            </p>
          ) : null}

          <Button
            variant="cta"
            className="mt-6 w-full"
            disabled={
              !canPurchase ||
              createOrder.isPending ||
              preview.isPending ||
              isGatewayBusy
            }
            onClick={handleConfirm}
          >
            {createOrder.isPending || isGatewayBusy
              ? "Preparing payment..."
              : "Proceed to payment"}
          </Button>

          {!canPurchase ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {selectedPlan?.purchase?.message ||
                "This plan cannot be purchased right now."}
            </p>
          ) : null}

          {error ? (
            <div className="mt-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
