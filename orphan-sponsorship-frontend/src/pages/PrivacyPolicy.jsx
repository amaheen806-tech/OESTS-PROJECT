export default function PrivacyPolicy() {
  return (
    <div className="ui-card mx-auto max-w-3xl p-8 md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Legal</p>
      <h1 className="mt-2 text-2xl font-semibold text-nude-900">
        Privacy Policy and Terms of Service
      </h1>

      <div className="mt-8 space-y-6">
        <Section title="1. Purpose of This System">
          The Orphan Educational Sponsorship and Tracking System exists to connect orphan
          children, schools, NGOs, and donors so that donations directly support a child&apos;s
          education in a transparent and accountable way.
        </Section>

        <Section title="2. Information We Collect">
          We collect the information needed to verify orphan children, process donations, and
          track academic progress. This includes names, contact details, guardian information,
          school records, and uploaded documents such as death certificates and photographs.
        </Section>

        <Section title="3. How Your Information Is Used">
          Orphan documents are used only for verification by NGO administrators. Donor
          information is used only to record donations and share progress updates. Academic
          records submitted by schools are shared only with the child&apos;s sponsoring donor
          and the NGO administrator.
        </Section>

        <Section title="4. Data Protection">
          Passwords are stored using secure hashing and are never visible to anyone, including
          administrators. All communication with the system is protected using HTTPS. Access to
          sensitive records is restricted based on user roles.
        </Section>

        <Section title="5. Protecting Orphan Privacy">
          Orphan children are never contacted directly by donors through this system. All
          communication about a sponsored child happens through progress reports and the NGO
          administrator, in order to protect the child&apos;s privacy and safety.
        </Section>

        <Section title="6. User Consent">
          By creating an account, you agree that the information you provide may be used as
          described in this policy. Guardians submitting an orphan&apos;s application confirm
          that they have the right to do so on the child&apos;s behalf.
        </Section>

        <Section title="7. Ethical Commitments">
          This system is built on a commitment to transparency, honesty, and respect for
          cultural values. Misuse of donor funds, falsified documents, or misuse of any
          user&apos;s personal data is strictly against the purpose of this platform.
        </Section>

        <Section title="8. Contact">
          For any questions or concerns regarding this policy, please contact the NGO
          administrator through the platform.
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-1.5 font-semibold text-nude-800">{title}</h2>
      <p className="text-sm leading-relaxed text-nude-600">{children}</p>
    </div>
  )
}
