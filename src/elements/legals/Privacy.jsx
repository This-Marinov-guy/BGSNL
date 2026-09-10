import { REGION_EMAIL } from "../../util/defines/REGIONS_DESIGN";

const Privacy = () => (
  <div className="container">
    <h2 className="center_text">Privacy Policy for Bulgarian Society Netherlands</h2>
    <h5 style={{ textAlign: "right" }}>Effective: September 10, 2026</h5>
    <div className="mt--80 mb--80">
      <h3>1. Controller and contact</h3>
      <p className="ml--20">
        Bulgarian Society Netherlands (BGSNL), KvK 95335048, is the controller
        for the personal data described below. For privacy questions or to make
        a request, contact <a href={`mailto:${REGION_EMAIL.netherlands}`}>{REGION_EMAIL.netherlands}</a>.
        Please do not send passwords, payment-card information or identity
        documents by ordinary email unless we specifically ask for a secure,
        proportionate verification method.
      </p>

      <h3>2. Data we process</h3>
      <p className="ml--20">Depending on how you use BGSNL, this can include:</p>
      <ul className="list-style--1 ml--20">
        <li>account and profile data, such as name, email address, phone number, region, photo and optional education or professional information;</li>
        <li>authentication and security data, including password hashes, Google sign-in identifiers, passkey public credentials, session/security records and account-recovery records;</li>
        <li>subscription, payment and invoice references, billing status and transaction history. Card details are processed by Stripe and are not stored by BGSNL;</li>
        <li>event registrations, ticket information, attendance, submitted preferences and communications needed to deliver an event;</li>
        <li>internship applications and supporting material you choose to submit;</li>
        <li>support reports, messages, attachments, screenshots and related browser/device information necessary to investigate a report;</li>
        <li>marketing preferences, consent evidence and unsubscribe/suppression records; and</li>
        <li>technical, security and consent records, and optional analytics data where you allow it.</li>
      </ul>

      <h3>3. Why we process data and our legal bases</h3>
      <ul className="list-style--1 ml--20">
        <li><strong>Account, subscriptions, tickets and support:</strong> to take steps at your request and perform our contract with you.</li>
        <li><strong>Payments, invoices, accounting and legal requests:</strong> to comply with legal obligations and keep the required administration.</li>
        <li><strong>Security, fraud prevention, service reliability and community safety:</strong> for BGSNL&apos;s legitimate interests, balanced against your rights and freedoms.</li>
        <li><strong>Optional profile information, public alumni presentation, marketing and non-essential analytics:</strong> where consent is required, we rely on your separate choice. You can withdraw consent at any time; withdrawal does not affect earlier lawful processing.</li>
      </ul>
      <p className="ml--20">
        Information marked required in a form is needed to create an account,
        process a payment, issue a ticket, answer a request or protect the
        service. If it is not provided, we may be unable to provide that part of
        the service. Optional information is not required for those purposes.
      </p>

      <h3>4. Recipients and international transfers</h3>
      <p className="ml--20">
        We use carefully selected service providers acting on our instructions,
        including payment processing, database and file hosting, email delivery,
        authentication, customer support, analytics, event administration and
        spreadsheet/office tools. We may also disclose information where law
        requires it, to protect rights and safety, or where you ask us to share
        it (for example, an internship application with the relevant opportunity
        provider). Sponsors do not receive contact lists for their own marketing
        without a separate lawful basis.
      </p>
      <p className="ml--20">
        Some providers may process data outside the EEA. Where that happens, we
        use the transfer mechanism required for the particular provider and
        transfer, such as an adequacy decision or appropriate contractual
        safeguards. You may ask us for information about the relevant safeguards.
      </p>

      <h3>5. Retention and deletion</h3>
      <p className="ml--20">
        We keep data only for the period needed for the purpose below, subject
        to longer retention where law, a dispute or a security investigation
        requires it. We regularly review data that is no longer needed.
      </p>
      <ul className="list-style--1 ml--20">
        <li><strong>Financial and tax records:</strong> generally seven years, or longer where a specific legal obligation applies.</li>
        <li><strong>Account, authentication and profile data:</strong> while the account is active and for a limited period needed to handle closure, security and disputes; unnecessary profile data is deleted or anonymised sooner.</li>
        <li><strong>Event attendance and support records:</strong> for the event/support purpose and a justified post-event or post-resolution period, unless a dispute, safety or legal obligation requires longer.</li>
        <li><strong>Marketing consent and suppression records:</strong> only as long as needed to demonstrate a choice and prevent accidental re-enrolment.</li>
        <li><strong>Logs and backups:</strong> on a restricted-access, rolling basis; deleted production data may remain in protected backups until the normal backup cycle expires.</li>
      </ul>
      <p className="ml--20">
        Cancelling a subscription does not itself erase records we must retain,
        such as invoices. A valid deletion request leads us to verify identity
        proportionately, revoke access where appropriate, delete or anonymise
        eligible data across our active systems, and explain any lawful
        exception. We normally respond within one month; if an extension is
        legally permitted, we will tell you why.
      </p>

      <h3>6. Your rights and automated decisions</h3>
      <p className="ml--20">
        Subject to applicable conditions, you may request access, correction,
        deletion, restriction, portability or objection, and may withdraw consent.
        You can object at any time to direct marketing. You can also complain to
        the Dutch supervisory authority, the Autoriteit Persoonsgegevens.
      </p>
      <p className="ml--20">
        Automated security, payment-status and eligibility checks can restrict
        benefits or access to protect the service. We do not intend those checks
        to be the sole basis of a legally significant decision without an
        appropriate review path. Contact us if you believe a restriction is
        incorrect and want human review.
      </p>

      <h3>7. Security, public profiles and policy updates</h3>
      <p className="ml--20">
        We use technical and organisational measures appropriate to the risk,
        including access controls and authenticated services. No online service
        can guarantee absolute security. Alumni names, biographies, photos and
        tiers are published only where the relevant display is enabled or another
        valid basis applies; do not submit information you do not want made public.
      </p>
      <p className="ml--20">
        We may update this Policy to reflect changes to our processing, providers
        or legal obligations. The effective date above identifies the current
        version. Material changes will be communicated where required.
      </p>
    </div>
  </div>
);

export default Privacy;
