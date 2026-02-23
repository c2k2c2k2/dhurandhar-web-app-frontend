import { PolicyLayout } from "@/modules/policies/PolicyLayout";

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms and Conditions"
      subtitle="Effective Date: February 23, 2026 | Last Updated: February 23, 2026"
    >
      <section className="space-y-3">
        <p>
          Welcome to Dhurandhar Sir Career Point Academy. By accessing or using
          this website, purchasing any subscription, or using any paid or free
          educational content, you agree to these Terms and Conditions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          1. Business Identity
        </h2>
        <p>
          Dhurandhar Sir Career Point Academy is operated by an individual
          proprietor and not by a registered company entity. For all policy and
          support communication, the details listed in the Contact section of
          this page apply.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          2. Eligibility and Account
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            You must provide accurate information at the time of registration
            and purchase.
          </li>
          <li>
            You are responsible for maintaining confidentiality of your login
            credentials.
          </li>
          <li>
            You are responsible for all activity carried out through your
            account.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          3. Service Description
        </h2>
        <p>
          We provide digital educational products in the form of notes, practice
          tests, and related learning services for competitive examinations.
          Access to content and features depends on the subscription or plan
          purchased.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          4. Subscriptions and Payments
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Paid features require a successful purchase of the relevant
            subscription or plan.
          </li>
          <li>
            Subscription validity, pricing, and plan benefits are shown before
            checkout.
          </li>
          <li>
            You agree to pay all applicable charges at the time of purchase.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          5. No Refund and No Return
        </h2>
        <p>
          As we provide only digital products and subscription-based educational
          services, all purchases are final. We do not provide refunds or
          returns for any subscription, notes, tests, or related services once
          purchased.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          6. Content Access and Usage Restrictions
        </h2>
        <p>
          All content is owned by Dhurandhar Sir Career Point Academy (or used
          under lawful rights). You agree that you will not:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Copy, reproduce, redistribute, resell, or commercially use content.</li>
          <li>
            Record, capture, download, or share protected content without
            permission.
          </li>
          <li>Share accounts or enable unauthorized access.</li>
        </ul>
        <p>
          Violations may lead to suspension or permanent termination of access
          without notice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">7. User Conduct</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Do not harass, abuse, or harm others.</li>
          <li>Do not upload malicious code or attempt unauthorized access.</li>
          <li>Do not misuse platform features or attempt payment fraud.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          8. Intellectual Property
        </h2>
        <p>
          All trademarks, branding, logos, notes, test content, and platform
          design are protected. Unauthorized use is prohibited.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          9. Availability and Changes
        </h2>
        <p>
          We aim to keep services available, but uninterrupted access is not
          guaranteed. We may update, modify, or discontinue any feature, plan,
          or content at our discretion.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">10. Termination</h2>
        <p>We may suspend or terminate access if:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>You violate these Terms.</li>
          <li>We suspect fraud or misuse.</li>
          <li>Required by law.</li>
        </ul>
        <p>You may stop using the Service anytime.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">11. Disclaimers</h2>
        <p>
          The service is provided on an &quot;as available&quot; basis. We do not
          guarantee specific exam results, ranks, or outcomes. Performance
          depends on individual effort and multiple external factors.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          12. Limitation of Liability
        </h2>
        <p>
          To the maximum extent permitted by law, we are not liable for any
          indirect, incidental, or consequential losses arising from your use of
          the service.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">13. Governing Law</h2>
        <p>
          These Terms are governed by the laws of India. Courts in Amravati,
          Maharashtra shall have jurisdiction for disputes related to these
          Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">14. Contact</h2>
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
