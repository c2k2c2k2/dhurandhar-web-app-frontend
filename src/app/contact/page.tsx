import { PolicyLayout } from "@/modules/policies/PolicyLayout";

export default function ContactPage() {
  return (
    <PolicyLayout
      title="Contact Us"
      subtitle="We are here to help with account, subscription, content access, and technical issues."
    >
      <section className="space-y-3">
        <p>
          Support Email: [Support Email]
          <br />
          Support Phone: [Support Phone]
          <br />
          Business Hours: [Mon-Sat, 10:00 AM - 7:00 PM IST]
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Office Address</h2>
        <p>
          [Company Name]
          <br />
          [Full Address Line 1]
          <br />
          [City, State, PIN]
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
