import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getOrphans, getDonationHistory, downloadReceipt } from '../services/api'
import OrphanCard from '../components/OrphanCard'
import DummyDonationModal from '../components/DummyDonationModal'
import OrphanDetailModal from '../components/OrphanDetailModal'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import Tabs from '../components/ui/Tabs'
import SuccessNotification from '../components/SuccessNotification'

export default function DonorPortal() {
  const { user } = useAuth()
  const [tab, setTab] = useState('browse')
  const [selectedOrphan, setSelectedOrphan] = useState(null)
  const [selectedOrphanDetails, setSelectedOrphanDetails] = useState(null)
  const [message, setMessage] = useState('')
  const [orphanList, setOrphanList] = useState([])
  const [donationHistory, setDonationHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccessNotice, setShowSuccessNotice] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadOrphans()
    loadHistory()
  }, [])

  async function loadOrphans() {
    try {
      const response = await getOrphans()
      setOrphanList(response.data)
    } catch (err) {
      console.error('Could not load orphans', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory() {
    try {
      const response = await getDonationHistory()
      setDonationHistory(response.data)
    } catch (err) {
      console.error('Could not load donation history', err)
    }
  }

  async function handleDownloadReceipt(donationId) {
    try {
      const response = await downloadReceipt(donationId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `receipt_${donationId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Could not download receipt', err)
    }
  }

  const sponsoredOrphanIds = new Set(donationHistory.map((d) => d.orphan_id))

  function openDonateForm(orphan) {
    setSelectedOrphan(orphan)
    setMessage('')
  }

  function handleDonationSuccess({ amount, orphanName }) {
    setSuccessMessage(
      `Your card details were accepted and PKR ${amount} has been sent to sponsor ${orphanName}. A thank-you email has been sent to your inbox.`
    )
    setShowSuccessNotice(true)
    setMessage(
      `Thank you. Your donation of PKR ${amount} for ${orphanName} has been recorded.`
    )
    loadHistory()
  }

  return (
    <div>
      <SuccessNotification
        open={showSuccessNotice}
        type="donate"
        title="Donation successful"
        message={successMessage}
        duration={6000}
        onClose={() => setShowSuccessNotice(false)}
      />

      <DummyDonationModal
        open={!!selectedOrphan}
        orphan={selectedOrphan}
        onClose={() => setSelectedOrphan(null)}
        onSuccess={handleDonationSuccess}
      />

      <OrphanDetailModal
        open={!!selectedOrphanDetails}
        orphan={selectedOrphanDetails}
        onClose={() => setSelectedOrphanDetails(null)}
        onSponsor={(orphan) => {
          setSelectedOrphanDetails(null)
          openDonateForm(orphan)
        }}
      />

      <PageHeader
        title="Donor Portal"
        subtitle={`Welcome back, ${user?.fullName || user?.full_name || 'Donor'}`}
      />

      {message && (
        <Alert tone="success" className="mb-6">
          {message}
        </Alert>
      )}

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: 'browse', label: 'Browse Orphans' },
          { key: 'history', label: 'Donation History' },
        ]}
      />

      {tab === 'browse' && loading && <Spinner label="Loading orphans..." />}

      {tab === 'browse' && !loading && orphanList.length === 0 && (
        <EmptyState
          icon={Users}
          title="No approved orphans yet"
          message="Approved children will appear here once the NGO admin reviews applications."
        />
      )}

      {tab === 'browse' && !loading && orphanList.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          {orphanList.map((orphan) => {
            const alreadySponsored = sponsoredOrphanIds.has(orphan.id)
            return (
              <OrphanCard
                key={orphan.id}
                orphan={orphan}
                elevated
                actionLabel={alreadySponsored ? null : 'Sponsor This Child'}
                onCardClick={setSelectedOrphanDetails}
                onAction={openDonateForm}
                secondaryAction={
                  alreadySponsored ? (
                    <>
                      <span className="rounded-lg bg-nude-100 py-2 text-center text-xs font-medium text-nude-700">
                        You are sponsoring this child
                      </span>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => navigate(`/progress-report/${orphan.id}`)}
                      >
                        View Progress Report
                      </Button>
                    </>
                  ) : null
                }
              />
            )
          })}
        </div>
      )}

      {tab === 'history' && (
        <div className="ui-card-elevated overflow-hidden">
          {donationHistory.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No donations yet"
                message="When you sponsor a child, your receipts will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th>Child</th>
                    <th>Amount (PKR)</th>
                    <th>Date</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {donationHistory.map((d) => (
                    <tr key={d.id}>
                      <td>{d.child}</td>
                      <td>{d.amount}</td>
                      <td>{new Date(d.donated_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDownloadReceipt(d.id)}
                          className="text-sm font-medium text-gold-600 underline hover:text-gold-500"
                        >
                          Download Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}