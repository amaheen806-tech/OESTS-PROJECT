import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, Download, Inbox } from 'lucide-react'
import { getStudentReports } from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Alert from '../components/ui/Alert'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

export default function ProgressReport() {
  const { orphanId } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadReport()
  }, [orphanId])

  async function loadReport() {
    setLoading(true)
    setError('')
    try {
      const response = await getStudentReports(orphanId)
      setReport(response.data)
    } catch (err) {
      setError('Could not load the progress report for this student.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Spinner label="Loading progress report..." />
  }

  if (error) {
    return (
      <Alert tone="error" className="max-w-3xl">
        {error}
      </Alert>
    )
  }

  if (!report || report.records.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title={`Progress Report — ${report?.name || 'Student'}`}
          subtitle={
            report ? `${report.school} · Class ${report.className}` : undefined
          }
        />
        <EmptyState
          icon={Inbox}
          title="No monthly reports yet"
          message="No monthly reports have been submitted for this student yet."
        />
      </div>
    )
  }

  const latest = report.records[0]
  const averageAttendance =
    report.records.reduce((sum, r) => sum + r.attendance, 0) / report.records.length

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Progress Report — ${report.name}`}
        subtitle={`${report.school} · Class ${report.className}`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Latest Attendance" value={`${latest.attendance}%`} />
        <SummaryCard label="Average Attendance" value={`${averageAttendance.toFixed(1)}%`} />
        <SummaryCard label="Latest Marks" value={`${latest.average_marks}%`} />
      </div>

      <div className="ui-card-elevated overflow-hidden">
        <div className="border-b border-nude-100 px-5 py-4">
          <h2 className="font-semibold text-nude-900">Monthly Report History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Attendance</th>
                <th>Marks</th>
                <th>Report Card</th>
              </tr>
            </thead>
            <tbody>
              {report.records.map((r) => (
                <tr key={r.id}>
                  <td>{r.report_month}</td>
                  <td>{r.attendance}%</td>
                  <td>{r.average_marks}%</td>
                  <td>
                    {r.report_card ? (
                      <a
                        href={r.report_card}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-gold-600 underline hover:text-gold-500"
                      >
                        <Download size={14} /> Download
                      </a>
                    ) : (
                      <span className="text-nude-400">Not uploaded</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-nude-100 p-5">
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-nude-900">
          <FileText size={18} className="text-gold-600" /> Latest Teacher Remarks
        </h2>
        <p className="text-sm italic text-nude-700">
          {latest.teacher_comments ? `"${latest.teacher_comments}"` : 'No comments provided.'}
        </p>
      </div>
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="ui-card-elevated p-4 text-center">
      <p className="text-xl font-semibold tracking-tight text-nude-900">{value}</p>
      <p className="mt-1 text-xs text-nude-500">{label}</p>
    </div>
  )
}
