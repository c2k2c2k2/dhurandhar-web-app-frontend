import { PolicyLayout } from "@/modules/policies/PolicyLayout";

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund Policy"
      subtitle="Effective Date: [DD Month YYYY] | Last Updated: [DD Month YYYY]"
    >
      <section className="space-y-3">
        <p>
          This Refund Policy describes refund and cancellation terms for
          purchases made on [Platform Name].
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          1. Subscription Plans
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Subscriptions provide access to premium content and features for the
            period purchased.
          </li>
          <li>
            Subscription benefits are available immediately after successful
            payment.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          2. Refund Eligibility
        </h2>
        <p>Refunds may be considered only if:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Payment was deducted but subscription was not activated.</li>
          <li>Duplicate payment occurred for the same purchase.</li>
          <li>
            A technical issue from our side prevents access and is not resolved
            within a reasonable time.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          3. Non-Refundable Cases
        </h2>
        <p>Refunds will generally not be provided for:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Change of mind after purchase.</li>
          <li>Partial use of subscription period.</li>
          <li>Account sharing or violation of Terms.</li>
          <li>Issues caused by user device or network conditions.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">4. Cancellation</h2>
        <p>
          You may cancel renewal (if auto-renewal exists) from your account
          settings. Cancellation stops future billing; current period access
          remains until expiry unless stated otherwise.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          5. Refund Processing Time
        </h2>
        <p>
          If approved, refunds are processed to the original payment method.
          Timeline depends on the payment partner or bank (typically 5 to 10
          business days).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          6. How to Request a Refund
        </h2>
        <p>Email: [Support Email]</p>
        <p>Please include:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Registered phone or email.</li>
          <li>Transaction ID or order reference.</li>
          <li>Reason for request.</li>
          <li>Screenshot (if applicable).</li>
        </ul>
      </section>
    </PolicyLayout>
  );
}
