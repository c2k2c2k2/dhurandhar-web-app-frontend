import { PolicyLayout } from "@/modules/policies/PolicyLayout";

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle="Effective Date: February 23, 2026 | Last Updated: February 23, 2026"
    >
      <section className="space-y-3">
        <p>
          This Privacy Policy explains how Dhurandhar Sir Career Point Academy
          collects, uses, stores, and protects your personal information when
          you use our website and digital learning services.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          1. Who We Are
        </h2>
        <p>
          Dhurandhar Sir Career Point Academy is operated by an individual
          proprietor and not as a registered company entity.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          2. Information We Collect
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Name, email address, phone number, and account credentials.</li>
          <li>Course and subscription purchase details.</li>
          <li>Payment transaction references and payment status.</li>
          <li>Usage data such as visited pages, test activity, and progress.</li>
          <li>
            Device and technical information such as browser and IP data for
            security and analytics.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          3. How We Use Your Information
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>To create and manage user accounts.</li>
          <li>To provide purchased subscriptions and digital content access.</li>
          <li>To process payments and maintain transaction records.</li>
          <li>To track learning progress and improve service quality.</li>
          <li>To secure the platform and prevent misuse or fraud.</li>
          <li>To send service updates and important communication.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          4. Cookies and Tracking Technologies
        </h2>
        <p>
          We may use cookies, local storage, and similar technologies to keep
          you signed in, remember preferences, and analyze usage. You can
          control cookies through browser settings; however, certain features
          may not function properly without them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          5. Sharing of Information
        </h2>
        <p>
          We do not sell your personal information. We may share limited data
          only in the following situations:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>With trusted service providers such as hosting and payment partners.</li>
          <li>When required by law, regulation, or lawful government request.</li>
          <li>To enforce our Terms and to prevent fraud or abuse.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          6. Data Security
        </h2>
        <p>
          We use reasonable security measures to protect personal data.
          However, no digital system can be guaranteed as completely secure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          7. Data Retention
        </h2>
        <p>
          We retain your data for as long as needed to provide services, comply
          with legal obligations, and resolve disputes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">8. Your Rights</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>You may request access or correction of your data.</li>
          <li>You may request account closure where applicable.</li>
          <li>You may opt out of non-essential communication.</li>
        </ul>
        <p>For requests, contact: info@dhurandhars.online</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          9. Children&apos;s Privacy
        </h2>
        <p>
          Our services are intended for users who are legally permitted to use
          online educational services. If you believe a minor has shared data
          improperly, contact us for review and action.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          10. Changes to This Policy
        </h2>
        <p>
          We may revise this Privacy Policy from time to time. Updated versions
          will be posted on this page with the revised date.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">11. Contact</h2>
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
