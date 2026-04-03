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
  const intervalRef = React.useRef<number | null>(null);
  const requestInFlightRef = React.useRef(false);

  React.useEffect(() => {
    if (!merchantTransactionId) {
      setError("Missing transaction reference.");
      return;
    }

    let active = true;
    let attempts = 0;
    const maxAttempts = 18;
    const pollIntervalMs = 5000;

    const stopPolling = () => {
      setIsPolling(false);
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const poll = async () => {
      if (!active || requestInFlightRef.current) return;
      requestInFlightRef.current = true;
      setIsPolling(true);
      try {
        const order = await getOrderStatus(merchantTransactionId);
        if (!active) return;
        setError(null);
        setStatus(order.status);
        if (TERMINAL.includes(order.status as (typeof TERMINAL)[number])) {
          stopPolling();
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
        const statusCode =
          err && typeof err === "object" && "status" in err
            ? Number((err as { status?: number }).status ?? 0)
            : 0;
        if (statusCode !== 429) {
          setError(message || "Unable to fetch payment status.");
        }
      } finally {
        attempts += 1;
        requestInFlightRef.current = false;
        if (attempts >= maxAttempts) {
          stopPolling();
        }
      }
    };

    void poll();
    intervalRef.current = window.setInterval(() => {
      if (!active || attempts >= maxAttempts) return;
      void poll();
    }, pollIntervalMs);

    return () => {
      active = false;
      requestInFlightRef.current = false;
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [merchantTransactionId, refresh]);

  const isSuccess = status === "SUCCESS";
  const isTerminalStatus = status
    ? TERMINAL.includes(status as (typeof TERMINAL)[number])
    : false;
  const isFailure = Boolean(status && status !== "SUCCESS" && isTerminalStatus);

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
