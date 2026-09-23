import {
  ShieldCheck,
  HeartHandshake,
  TrendingUp,
  Users,
  FileCheck,
  School,
  Wallet,
  ClipboardCheck,
} from 'lucide-react'

const steps = [
  {
    icon: FileCheck,
    title: 'Verification First',
    text: 'Every orphan application is reviewed by our NGO administrators before it goes live. Guardians submit personal details along with supporting documents, such as a death certificate and a recent photograph. Nothing is shown to donors until it has been checked and approved.',
  },
  {
    icon: HeartHandshake,
    title: 'Connecting Donors to Real Children',
    text: "Once approved, a child's profile becomes visible to donors, who can browse verified profiles and choose to sponsor a specific child. Every donation is recorded immediately and a receipt is generated automatically.",
  },
  {
    icon: School,
    title: 'Schools Keep Everyone Informed',
    text: 'Partner schools submit monthly reports for each enrolled student, covering attendance and academic performance. This keeps the entire process transparent and up to date, month after month.',
  },
  {
    icon: TrendingUp,
    title: 'Donors Track Real Progress',
    text: "Donors can open a live progress report for the child they sponsor at any time, showing attendance trends, marks, and teacher remarks, so they always know their support is making a difference.",
  },
]

const values = [
  {
    icon: ShieldCheck,
    title: 'Transparency',
    text: 'Every donation is traceable to a specific child, and every report is dated and attributed to the school that submitted it.',
  },
  {
    icon: Users,
    title: 'Privacy and Dignity',
    text: "Children are never contacted directly by donors. All communication flows through progress reports and the NGO administrator, protecting each child's privacy.",
  },
  {
    icon: ClipboardCheck,
    title: 'Accountability',
    text: 'Admins review every application personally, and role-based access means each user can only see and do what is relevant to them.',
  },
  {
    icon: Wallet,
    title: 'Every Rupee Tracked',
    text: 'From the moment a donation is made, it is linked to a receipt, a date, and a specific sponsorship, so nothing gets lost in the process.',
  },
]

export default function AboutUs() {
  return (
    <div>
      <section className="bg-nude-800 text-nude-50">
        <div className="page-container py-16 text-center md:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
            Our Story
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Built to Make Every Donation Count
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-nude-200">
            The Orphan Educational Sponsorship and Tracking System was created to solve a
            simple problem: donors want to help, but they rarely get to see what happens after
            they give. We built a platform where every child is verified, every donation is
            tracked, and every rupee has a story you can follow.
          </p>
        </div>
      </section>

      <div className="page-container flex flex-col gap-16 py-14 md:py-16">
        <section className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-nude-900">Our Mission</h2>
            <p className="mt-3 leading-relaxed text-nude-600">
              We exist to remove the guesswork from charitable giving. Too often, donors send
              money to a cause and never learn whether it reached the child it was meant for,
              or whether that child is still in school at all. Schools, meanwhile, have no
              easy way to update donors on a student&apos;s progress, and NGOs are left
              manually chasing paperwork instead of focusing on the children in their care.
            </p>
            <p className="mt-4 leading-relaxed text-nude-600">
              Our platform brings NGOs, schools, donors, and orphan guardians onto a single
              system, so that verification, sponsorship, and academic tracking all happen in
              one place — visible to everyone who needs to see it, and private from everyone
              who shouldn&apos;t.
            </p>
            <div className="mt-6 rounded-lg bg-gold-50 p-4 border border-gold-200">
              <p className="text-sm font-semibold text-gold-800">
                Location Notice:
              </p>
              <p className="mt-1 text-sm text-gold-700">
                Please note that our services, partner schools, and operations are currently active exclusively within Lahore.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl shadow-sm">
            <img
              src="/about-mission.jpg"
              alt="Children studying at a partner school"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section>
          <h2 className="text-center text-2xl font-semibold text-nude-900">How We Work</h2>
          <p className="mx-auto mb-10 mt-2 max-w-xl text-center text-nude-500">
            From application to sponsorship to progress report, here is exactly what happens
            behind the scenes.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {steps.map((step, index) => (
              <div key={step.title} className="ui-card flex gap-4 p-6">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-nude-900">
                  <step.icon size={20} />
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-gold-600">Step {index + 1}</p>
                  <h3 className="font-semibold text-nude-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-nude-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-center text-2xl font-semibold text-nude-900">What We Stand For</h2>
          <p className="mx-auto mb-10 mt-2 max-w-xl text-center text-nude-500">
            These principles shape every feature we build.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {values.map((value) => (
              <div key={value.title} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-nude-100 text-gold-600">
                  <value.icon size={22} />
                </div>
                <h3 className="font-semibold text-nude-900">{value.title}</h3>
                <p className="text-sm text-nude-500">{value.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-nude-100 p-8 text-center">
          <h2 className="text-lg font-semibold text-nude-900">More Than a Website</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-nude-600">
            We kept seeing the same problem — donors giving generously but never knowing
            where their money actually went, or whether the child they sponsored was still in
            school. So we built something that connects NGOs, schools, and donors on one
            system, where every child is verified and every rupee can be traced back to a
            real classroom.
          </p>
        </section>
      </div>
    </div>
  )
}
