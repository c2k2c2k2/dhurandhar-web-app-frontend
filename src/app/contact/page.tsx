import { PolicyLayout } from "@/modules/policies/PolicyLayout";

export default function ContactPage() {
  return (
    <PolicyLayout
      title="Contact Us"
      subtitle="We are here to help with account, subscription, content access, and technical issues."
    >
      <section className="space-y-3">
        <p>
          Business Name: Dhurandhar Sir Career Point Academy
          <br />
          Contact Person: Prof. Dipak Dhurandhar
          <br />
          Support Email: info@dhurandhars.online
          <br />
          Support Phone: +91 9545789817
          <br />
          Business Type: Individual Proprietor
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Office Address</h2>
        <p>
          Khandelwal Market, Sundarlal Chowk, Camp
          <br />
          Amravati-444602, Maharashtra
          <br />
          India
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          For faster support, please share
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Your registered phone or email.</li>
          <li>Screenshot of the issue (if any).</li>
          <li>Order or transaction ID (for payment issues).</li>
        </ul>
      </section>
    </PolicyLayout>
  );
}
