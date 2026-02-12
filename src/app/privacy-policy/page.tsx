import { PolicyLayout } from "@/modules/policies/PolicyLayout";

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="Effective Date: [DD Month YYYY] | Last Updated: [DD Month YYYY]"
    >
      <section className="space-y-3">
        <p>
          This Privacy Policy describes how [Company Name] ("we", "us", "our")
          collects, uses, shares, and protects information when you use
          [Platform Name] (the "Service"), including our website and apps.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          1. Information We Collect
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-foreground">Account Info:</span>
            {" "}
            Name, phone number, email address, password (stored in hashed form).
          </li>
          <li>
            <span className="font-semibold text-foreground">Usage Info:</span>
            {" "}
            Pages visited, features used, device details, approximate location.
          </li>
          <li>
            <span className="font-semibold text-foreground">Payment Info:</span>
            {" "}
            Payment status, transaction identifiers, subscription details.
          </li>
          <li>
            <span className="font-semibold text-foreground">
              Content and Performance:
            </span>
            {" "}
            Tests attempted, scores, progress analytics, notes viewed.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and manage your account.</li>
          <li>Provide access to content, tests, and subscriptions.</li>
          <li>Improve learning experience and platform performance.</li>
          <li>Provide analytics and progress tracking.</li>
          <li>Prevent fraud, misuse, and unauthorized access.</li>
          <li>Send service-related updates and announcements.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          3. Cookies and Tracking
        </h2>
        <p>
          We may use cookies or local storage to keep you signed in, store
          preferences, and understand usage patterns. You can control cookies
          via browser settings. Some features may not work without them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          4. Sharing of Information
        </h2>
        <p>
          We do not store full card or bank details. Payments are processed by
          trusted partners.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>With service providers (hosting, analytics, payment processing).</li>
          <li>When required by law or legal process.</li>
          <li>To protect rights, safety, or prevent misuse and fraud.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          5. Data Security
        </h2>
        <p>
          We use reasonable security practices such as encryption, access
          controls, and monitoring. However, no system is 100% secure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          6. Data Retention
        </h2>
        <p>
          We retain data as long as needed to provide the Service, meet legal
          obligations, and resolve disputes. You may request account deletion
          where applicable.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">7. Your Rights</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Access or correct your data.</li>
          <li>Request deletion of your data or account.</li>
          <li>Withdraw consent for certain communications.</li>
        </ul>
        <p>Contact us at: [Support Email]</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          8. Children&apos;s Privacy
        </h2>
        <p>
          The Service is intended for users who can legally use online services
          in their region. If you believe a minor has provided personal
          information, contact us for removal.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          9. Changes to This Policy
        </h2>
        <p>
          We may update this policy from time to time. Updated versions will be
          posted with a revised "Last Updated" date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">10. Contact</h2>
        <p>[Company Name]</p>
        <p>Email: [Support Email]</p>
        <p>Phone: [Support Phone]</p>
        <p>Address: [Business Address]</p>
      </section>
    </PolicyLayout>
  );
}
