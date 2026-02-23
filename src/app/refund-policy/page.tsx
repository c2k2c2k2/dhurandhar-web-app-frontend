import { PolicyLayout } from "@/modules/policies/PolicyLayout";

export default function RefundPolicyPage() {
  return (
    <PolicyLayout
      title="Refund Policy"
      subtitle="Effective Date: February 23, 2026 | Last Updated: February 23, 2026"
    >
      <section className="space-y-3">
        <p>
          This Refund Policy applies to all purchases made on Dhurandhar Sir
          Career Point Academy.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          1. Nature of Product
        </h2>
        <p>
          We provide digital educational products and services, including notes,
          practice tests, and subscription-based learning access for competitive
          examination preparation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          2. No Refund and No Return
        </h2>
        <p>
          All purchases are final. Since the products and services are digital
          in nature, we do not provide refunds, cancellations, or returns after
          a successful payment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          3. Subscription Access
        </h2>
        <p>
          Subscription plans provide access to the purchased services for their
          defined validity period. Access begins after successful payment
          confirmation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          4. User Responsibility
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Please review plan details, features, and validity before making a
            payment.
          </li>
          <li>
            By completing a purchase, you acknowledge and accept this No Refund
            and No Return Policy.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          5. Policy Updates
        </h2>
        <p>
          We may update this policy from time to time. Changes will be effective
          once published on this page.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          6. Contact Information
        </h2>
        <p>Business Name: Dhurandhar Sir Career Point Academy</p>
        <p>Contact Person: Prof. Dipak Dhurandhar</p>
        <p>Email: info@dhurandhars.online</p>
        <p>Phone: +91 9545789817</p>
        <p>
          Address: Khandelwal Market, Sundarlal Chowk, Camp, Amravati-444602,
          Maharashtra, India
        </p>
      </section>
    </PolicyLayout>
  );
}
