"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudentAccess } from "@/modules/student-auth/StudentAuthProvider";
import { getOrderStatus } from "@/modules/student-payments/api";
import { clearPaymentContext, loadPaymentContext } from "@/modules/student-payments/utils";
import { trackStudentEvent } from "@/modules/student-analytics/events";

const TERMINAL = ["SUCCESS", "FAILED", "EXPIRED", "CANCELLED", "REFUNDED"] as const;

export default function StudentPaymentsReturnPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
          Verifying payment...
        </div>
      }
    >
      <PaymentsReturnContent />
    </React.Suspense>
  );
}

function PaymentsReturnContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useStudentAccess();

  const context = loadPaymentContext();
  const merchantTransactionId =
    params.get("merchantTransactionId") ||
    params.get("transactionId") ||
    context.merchantTransactionId ||
    "";
  const nextPath = params.get("next") || context.nextPath || "/student";

  const [status, setStatus] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPolling, setIsPolling] = React.useState(false);

  React.useEffect(() => {
    if (!merchantTransactionId) {
      setError("Missing transaction reference.");
      return;
    }

    let active = true;
    let attempts = 0;
    const maxAttempts = 12;

    const poll = async () => {
      if (!active) return;
      setIsPolling(true);
      try {
        const order = await getOrderStatus(merchantTransactionId);
        if (!active) return;
        setStatus(order.status);
        if (TERMINAL.includes(order.status as (typeof TERMINAL)[number])) {
          setIsPolling(false);
          clearPaymentContext();
          if (order.status === "SUCCESS") {
            await refresh();
            trackStudentEvent("payment_success", { merchantTransactionId });
          } else {
            trackStudentEvent("payment_fail", { merchantTransactionId, status: order.status });
          }
          return;
        }
      } catch (err) {
        if (!active) return;
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: string }).message ?? "")
            : "Unable to fetch payment status.";
        setError(message || "Unable to fetch payment status.");
      } finally {
        attempts += 1;
        if (attempts >= maxAttempts) {
          setIsPolling(false);
        }
      }
    };

    void poll();
    const interval = window.setInterval(() => {
      if (!active || attempts >= maxAttempts) return;
      void poll();
    }, 3000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [merchantTransactionId, refresh]);

  const isSuccess = status === "SUCCESS";
  const isFailure = status && status !== "SUCCESS" && TERMINAL.includes(status as any);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card/90 p-6 text-center shadow-sm">
        {isSuccess ? (
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        ) : isFailure ? (
          <XCircle className="mx-auto h-10 w-10 text-destructive" />
        ) : (
          <Clock className="mx-auto h-10 w-10 text-accent" />
        )}
        <h1 className="mt-4 font-display text-2xl font-semibold">
          {isSuccess
            ? "Payment successful"
            : isFailure
              ? "Payment failed"
              : "Confirming payment"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSuccess
            ? "Your subscription is now active. Enjoy premium access."
            : isFailure
              ? "We could not confirm the payment. You can try again."
              : "We are checking the latest payment status."
          }
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="cta" onClick={() => router.push(nextPath)}>
          Continue
        </Button>
        <Button variant="secondary" onClick={() => router.push("/student/payments")}>
          View plans
        </Button>
        {isPolling ? (
          <span className="text-xs text-muted-foreground">Polling status...</span>
        ) : null}
      </div>
    </div>
  );
}
