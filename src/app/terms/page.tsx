import { PolicyLayout } from "@/modules/policies/PolicyLayout";

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms and Conditions"
      subtitle="Effective Date: [DD Month YYYY] | Last Updated: [DD Month YYYY]"
    >
      <section className="space-y-3">
        <p>
          Welcome to [Platform Name] operated by [Company Name]. By accessing or
          using our Service, you agree to these Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          1. Eligibility and Account
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You must provide accurate registration details.</li>
          <li>You are responsible for maintaining account confidentiality.</li>
          <li>You are responsible for all activity under your account.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          2. Service Description
        </h2>
        <p>
          The Service provides educational content such as notes, practice sets,
          tests, and analytics. Features may vary by plan and may change over
          time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          3. Subscriptions and Payments
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Paid features require an active subscription or purchase.</li>
          <li>Pricing and plan benefits are shown before checkout.</li>
          <li>Taxes and payment gateway fees may apply.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          4. Content Access and Usage Restrictions
        </h2>
        <p>
          All content is owned by [Company Name] or licensed to us. You agree
          that you will not:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Copy, reproduce, redistribute, or sell content.</li>
          <li>Record screens or bypass security controls.</li>
          <li>Share accounts or enable unauthorized access.</li>
        </ul>
        <p>Violations may lead to suspension or termination without refund.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">5. User Conduct</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Do not harass, abuse, or harm others.</li>
          <li>Do not upload malicious code or attempt unauthorized access.</li>
          <li>Do not misuse platform features or attempt fraud.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          6. Intellectual Property
        </h2>
        <p>
          All trademarks, logos, content, and platform design belong to
          [Company Name] (or licensors). Unauthorized use is prohibited.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          7. Availability and Changes
        </h2>
        <p>
          We aim to keep the Service available but do not guarantee uninterrupted
          access. We may update, modify, or discontinue features.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">8. Termination</h2>
        <p>We may suspend or terminate access if:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>You violate these Terms.</li>
          <li>We suspect fraud or misuse.</li>
          <li>Required by law.</li>
        </ul>
        <p>You may stop using the Service anytime.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">9. Disclaimers</h2>
        <p>
          The Service is provided "as is". We do not guarantee exam results or
          specific outcomes. Educational performance depends on individual
          effort and conditions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          10. Limitation of Liability
        </h2>
        <p>
          To the extent permitted by law, [Company Name] will not be liable for
          indirect or consequential damages. Our total liability will not exceed
          the amount paid by you in the last [X] months (if applicable).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India (or your applicable
          jurisdiction). Courts at [City/State] shall have jurisdiction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">12. Contact</h2>
        <p>Email: [Support Email]</p>
        <p>Phone: [Support Phone]</p>
        <p>Address: [Business Address]</p>
      </section>
    </PolicyLayout>
  );
}
