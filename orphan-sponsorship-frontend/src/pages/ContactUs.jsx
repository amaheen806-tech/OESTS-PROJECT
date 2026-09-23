import { useState } from 'react'
import { Send } from 'lucide-react'
import { submitContactMessage } from '../services/api'
import Button from '../components/ui/Button'
import Input, { Textarea } from '../components/ui/Input'
import Alert from '../components/ui/Alert'

const faqs = [
  {
    question: 'How do I sponsor a child?',
    answer:
      'Create a donor account, browse the list of verified orphan profiles, and select a child to sponsor. You can donate any amount and will receive a receipt immediately.',
  },
  {
    question: 'How do I know my donation is being used properly?',
    answer:
      'Every sponsored child has a progress report that includes attendance, exam marks, and teacher comments, submitted monthly by their school. You can view this at any time from your donor portal.',
  },
  {
    question: 'How can a school join the platform?',
    answer:
      'Register a School account from the homepage. Once verified by an NGO administrator, you can view your enrolled students and submit monthly academic reports for each of them.',
  },
  {
    question: 'How can a guardian apply for sponsorship?',
    answer:
      "Register as an Orphan/Guardian, then fill out the application form with the child's details and upload the required documents. An NGO administrator will review and approve the application.",
  },
]

export default function ContactUs() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name || !email || !message) {
      setError('Please fill in your name, email, and message.')
      return
    }

    setLoading(true)
    try {
      await submitContactMessage({ name, email, subject, message })
      setSubmitted(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err) {
      setError('Could not send your message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <section className="bg-nude-800 text-nude-50">
        <div className="page-container py-14 text-center md:py-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
            Get in Touch
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            We&apos;d Love to Hear From You
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-nude-200">
            Whether you have a question about sponsoring a child, registering your school, or
            anything else, our team is ready to help.
          </p>
        </div>
      </section>

      <div className="page-container flex flex-col gap-14 py-14">
        <section className="ui-card grid overflow-hidden md:grid-cols-2">
          <div className="min-h-[240px] bg-nude-100">
            <img
              src="/contact-us.jpg"
              alt="Support team ready to help"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-6 md:p-8">
            <h2 className="font-semibold text-nude-900">Send Us a Message</h2>
            <p className="mt-1 text-sm text-nude-500">
              Fill out the form and our team will get back to you shortly.
            </p>

            {error && (
              <Alert tone="error" className="mt-4">
                {error}
              </Alert>
            )}
            {submitted && (
              <Alert tone="success" className="mt-4">
                Thank you for reaching out. We have received your message and will respond soon.
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <Input
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is this about?"
              />
              <Textarea
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Write your message here..."
              />
              <Button type="submit" variant="primary" loading={loading} className="w-full sm:w-auto">
                <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </section>

        <section>
          <h2 className="text-center text-2xl font-semibold text-nude-900">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mb-8 mt-2 max-w-xl text-center text-nude-500">
            Quick answers to the questions we hear most often.
          </p>
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl bg-nude-100 p-5">
                <h3 className="font-semibold text-nude-900">{faq.question}</h3>
                <p className="mt-1 text-sm leading-relaxed text-nude-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
