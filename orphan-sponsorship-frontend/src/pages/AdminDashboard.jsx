import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  School,
  HeartHandshake,
  FileBarChart2,
  MessageSquareText,
  Menu,
  X,
  RefreshCw,
  Inbox,
  FileText,
  Mail,
  Image as ImageIcon,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getDashboardStats,
  getAdminApplications,
  getAdminOrphanDetail,
  approveOrphan,
  rejectOrphan,
  approveSchool,
  rejectSchool,
  getPartnerSchools,
  getAdminReports,
  getAdminDonors,
  getAdminFeedback,
  getAdminNewsletter,
  getAdminPayroll,
  payOrphanFee,
  updateOrphanFee,
  acceptFeedback,
  rejectFeedback,
  getAdminContactMessages,
} from '../services/api'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import StatusBadge from '../components/ui/StatusBadge'
import SuccessNotification from '../components/SuccessNotification'

const CLASS_OPTIONS = ['Nursery', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orphans', label: 'Orphans', icon: Users },
  { id: 'reports', label: 'Student Monthly Reports', icon: FileBarChart2 },
  { id: 'schools', label: 'Schools', icon: School },
  { id: 'payroll', label: 'Payroll Management', icon: FileText },
  { id: 'donors', label: 'Donors', icon: HeartHandshake },
  { id: 'messages', label: 'User Messages', icon: Mail },
  { id: 'feedback', label: 'Website Feedback', icon: MessageSquareText },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState('overview')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [schools, setSchools] = useState([])
  const [reports, setReports] = useState([])
  const [donorsData, setDonorsData] = useState({ registered: [], donations: [] })
  const [feedback, setFeedback] = useState([])
  const [messages, setMessages] = useState([])
  const [newsletter, setNewsletter] = useState([])
  const [loading, setLoading] = useState(true)

  const [actionMessage, setActionMessage] = useState('')
  const [toast, setToast] = useState({ open: false, type: 'success', message: '' })
  const [assignments, setAssignments] = useState({})

  const [orphanDetail, setOrphanDetail] = useState(null)
  const [orphanDetailLoading, setOrphanDetailLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedDonation, setSelectedDonation] = useState(null)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [statsRes, applicationsRes, schoolsRes, reportsRes, donorsRes, feedbackRes, newsletterRes, messagesRes] =
        await Promise.all([
          getDashboardStats(),
          getAdminApplications(),
          getPartnerSchools(),
          getAdminReports(),
          getAdminDonors(),
          getAdminFeedback(),
          getAdminNewsletter(),
          getAdminContactMessages(),
        ])
      setStats(statsRes.data)
      setApplications(applicationsRes.data)
      setSchools(schoolsRes.data)
      setReports(reportsRes.data)
      setDonorsData(donorsRes.data)
      setFeedback(feedbackRes.data)
      setNewsletter(newsletterRes.data)
      setMessages(messagesRes.data)

      const nextAssignments = {}
      for (const app of applicationsRes.data) {
        const matchedSchool = schoolsRes.data.find(
          (s) => s.name?.toLowerCase() === (app.school || '').toLowerCase()
        )
        nextAssignments[app.id] = {
          schoolId: matchedSchool?.id ? String(matchedSchool.id) : '',
          studentClass: app.className || '',
          monthlyFee: '',
        }
      }
      setAssignments(nextAssignments)
    } catch (err) {
      console.error('Could not load admin dashboard', err)
      setActionMessage('Could not load admin data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  function updateAssignment(appId, field, value) {
    setAssignments((prev) => ({
      ...prev,
      [appId]: {
        ...(prev[appId] || { schoolId: '', studentClass: '', monthlyFee: '' }),
        [field]: value,
      },
    }))
  }

  async function openOrphanDetail(id) {
    setOrphanDetailLoading(true)
    setOrphanDetail(null)
    try {
      const res = await getAdminOrphanDetail(id)
      setOrphanDetail(res.data)
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Could not load orphan details.')
    } finally {
      setOrphanDetailLoading(false)
    }
  }

  async function handleApprove(id) {
    const assignment = assignments[id] || {}
    if (!assignment.schoolId) {
      setActionMessage('Please select a registered school before approving.')
      return
    }
    if (!assignment.studentClass) {
      setActionMessage('Please select a class before approving.')
      return
    }

    try {
      const response = await approveOrphan(id, {
        school_id: Number(assignment.schoolId),
        student_class: assignment.studentClass,
        monthly_fee: assignment.monthlyFee || 0,
      })
      setActionMessage(response.data?.message || 'Application approved.')
      setToast({
        open: true,
        type: 'approve',
        message: response.data?.message || 'The orphan application has been approved successfully.',
      })
      setOrphanDetail(null)
      loadAll()
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Could not approve this application.')
    }
  }

  async function handleReject(id) {
    try {
      await rejectOrphan(id)
      setActionMessage('Application rejected.')
      setToast({
        open: true,
        type: 'reject',
        message: 'The orphan application has been rejected.',
      })
      setOrphanDetail(null)
      loadAll()
    } catch (err) {
      setActionMessage('Could not reject this application.')
    }
  }

  async function handleUpdateFee(id, fee) {
    try {
      const response = await updateOrphanFee(id, fee)
      setActionMessage(response.data?.message || 'Fee updated successfully.')
      setToast({
        open: true,
        type: 'success',
        message: response.data?.message || 'Fee updated successfully.',
      })
      if (selectedOrphan) {
        loadDetail(selectedOrphan)
      }
    } catch (err) {
      setToast({
        open: true,
        type: 'error',
        message: err.response?.data?.message || 'Could not update fee.',
      })
    }
  }

  async function handleApproveSchool(id) {
    try {
      const response = await approveSchool(id)
      setActionMessage(response.data?.message || 'School approved.')
      setToast({
        open: true,
        type: 'approve',
        message: response.data?.message || 'The school has been approved successfully.',
      })
      loadAll()
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Could not approve this school.')
    }
  }

  async function handleRejectSchool(id) {
    try {
      const response = await rejectSchool(id)
      setActionMessage(response.data?.message || 'School rejected.')
      setToast({
        open: true,
        type: 'reject',
        message: response.data?.message || 'The school has been rejected.',
      })
      loadAll()
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Could not reject this school.')
    }
  }

  async function handleAcceptFeedback(id) {
    try {
      await acceptFeedback(id)
      setToast({ open: true, type: 'success', message: 'Feedback accepted and published publicly.' })
      setSelectedFeedback(null)
      loadAll()
    } catch (err) {
      setToast({ open: true, type: 'error', message: 'Could not accept feedback.' })
    }
  }

  async function handleRejectFeedback(id) {
    try {
      await rejectFeedback(id)
      setToast({ open: true, type: 'success', message: 'Feedback rejected.' })
      setSelectedFeedback(null)
      loadAll()
    } catch (err) {
      setToast({ open: true, type: 'error', message: 'Could not reject feedback.' })
    }
  }

  function selectSection(id) {
    setSection(id)
    setDrawerOpen(false)
  }

  const sectionTitle = NAV_ITEMS.find((n) => n.id === section)?.label || 'Admin'
  const donations = donorsData.donations || []

  return (
    <div className="w-full">
      <SuccessNotification
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />

      <div className="flex w-full items-start border-y border-nude-200/80 bg-white">
        {drawerOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-nude-900/45 md:hidden"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-nude-900 to-[#1a2744] p-5 text-white shadow-xl transition-all duration-300 md:sticky md:top-0 md:z-30 md:h-screen md:translate-x-0 md:self-start md:shadow-none ${
            drawerOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'
          } ${collapsed ? 'md:w-20' : 'md:w-64'}`}
        >
          <div className={`mb-8 flex items-start ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <div className="overflow-hidden whitespace-nowrap transition-all duration-300">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400">
                  Admin Panel
                </p>
                <p className="mt-2 text-base font-semibold text-white truncate max-w-[180px]">
                  {user?.fullName || user?.full_name || 'NGO Admin'}
                </p>
                <p className="mt-0.5 text-xs text-white/55">Orphan Sponsorship System</p>
              </div>
            )}
            <button
              type="button"
              className="rounded-lg p-2 text-white/70 hover:bg-white/10 md:hidden"
              onClick={() => setDrawerOpen(false)}
            >
              <X size={18} />
            </button>
            <button
              type="button"
              className="hidden md:block rounded-lg p-2 text-white/70 hover:bg-white/10"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5 overflow-hidden">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = section === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectSection(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-all ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    active
                      ? 'bg-gold-500 text-nude-900 shadow-md shadow-gold-500/20'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
                </button>
              )
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1.5 pt-6 overflow-hidden">
            <button
              type="button"
              onClick={() => navigate('/')}
              title={collapsed ? 'Home' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-white/75 transition-all hover:bg-white/10 hover:text-white ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <Home size={18} className="shrink-0" />
              {!collapsed && <span className="truncate whitespace-nowrap">Home</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              title={collapsed ? 'Log Out' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-red-400 transition-all hover:bg-white/10 hover:text-red-300 ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut size={18} className="shrink-0" />
              {!collapsed && <span className="truncate whitespace-nowrap">Log Out</span>}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-nude-50/60 md:min-h-screen">
          <div className="border-b border-nude-200/80 bg-white/90 px-5 pb-5 pt-8 sm:px-8 sm:pt-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 text-left">
                <button
                  type="button"
                  className="mt-1 rounded-lg border border-nude-200 bg-white p-2 text-nude-700 shadow-sm md:hidden"
                  onClick={() => setDrawerOpen(true)}
                >
                  <Menu size={18} />
                </button>
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-nude-900 md:text-3xl">
                    {sectionTitle}
                  </h1>
                  <p className="mt-1 text-sm text-nude-600 md:text-base">NGO Administration</p>
                </div>
              </div>
              <Button variant="outline" onClick={loadAll} title="Refresh" className="self-start">
                <RefreshCw size={16} /> Refresh
              </Button>
            </div>
          </div>

          <div className="px-5 py-6 text-left sm:px-8 sm:py-8">
            {actionMessage && (
              <Alert tone="info" className="mb-6">
                {actionMessage}
              </Alert>
            )}

            {loading ? (
              <Spinner label="Loading admin panel..." />
            ) : (
              <>
                {section === 'overview' && (
                  <OverviewSection
                    stats={stats}
                    applications={applications}
                    donations={donations}
                    schools={schools}
                    onOpenOrphan={openOrphanDetail}
                    onGoSection={selectSection}
                  />
                )}
                {section === 'orphans' && (
                  <OrphansSection
                    applications={applications}
                    schools={schools}
                    assignments={assignments}
                    updateAssignment={updateAssignment}
                    onOpenDetail={openOrphanDetail}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                )}
                {section === 'reports' && (
                  <ReportsSection reports={reports} onOpen={setSelectedReport} />
                )}
                {section === 'payroll' && (
                  <PayrollSection />
                )}
                {section === 'schools' && (
                  <SchoolsSection
                    schools={schools}
                    onApproveSchool={handleApproveSchool}
                    onRejectSchool={handleRejectSchool}
                  />
                )}
                {section === 'donors' && (
                  <DonorsSection
                    registered={donorsData.registered || []}
                    donations={donations}
                    onOpenDonation={setSelectedDonation}
                  />
                )}
                {section === 'feedback' && (
                  <FeedbackSection
                    feedback={feedback}
                    newsletter={newsletter}
                    onOpenFeedback={setSelectedFeedback}
                    onAccept={handleAcceptFeedback}
                    onReject={handleRejectFeedback}
                  />
                )}
                {section === 'messages' && (
                  <MessagesSection
                    messages={messages}
                    onOpen={setSelectedMessage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {(orphanDetail || orphanDetailLoading) && (
        <OrphanAdminDetailModal
          loading={orphanDetailLoading}
          detail={orphanDetail}
          schools={schools}
          assignment={orphanDetail ? assignments[orphanDetail.id] : null}
          updateAssignment={updateAssignment}
          onClose={() => setOrphanDetail(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onUpdateFee={handleUpdateFee}
        />
      )}

      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}

      {selectedDonation && (
        <DonationDetailModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
        />
      )}

      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onAccept={handleAcceptFeedback}
          onReject={handleRejectFeedback}
        />
      )}

      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  )
}

function OverviewSection({ stats, applications, donations, schools, onOpenOrphan, onGoSection }) {
  return (
    <div className="flex flex-col gap-8 text-left">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Orphans" value={stats?.totalOrphans ?? 0} />
        <StatCard
          icon={FileBarChart2}
          label="Pending Applications"
          value={stats?.pendingApplications ?? 0}
        />
        <StatCard
          icon={HeartHandshake}
          label="Total Donations"
          value={`PKR ${stats?.totalDonations ?? 0}`}
        />
        <StatCard icon={School} label="Partner Schools" value={stats?.partnerSchools ?? 0} />
      </div>

      <SectionCard
        title="All Applications"
        action={
          <button
            type="button"
            className="text-sm font-medium text-gold-600 hover:text-gold-500"
            onClick={() => onGoSection('orphans')}
          >
            Manage orphans →
          </button>
        }
      >
        {applications.length === 0 ? (
          <EmptyState icon={Inbox} title="No applications yet" message="Submitted applications will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>School</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 8).map((app) => (
                  <tr key={app.id}>
                    <td>
                      <button
                        type="button"
                        className="font-medium text-nude-900 underline-offset-2 hover:underline"
                        onClick={() => onOpenOrphan(app.id)}
                      >
                        {app.name}
                      </button>
                    </td>
                    <td>{app.age != null ? app.age : '—'}</td>
                    <td>{app.school || '—'}</td>
                    <td>{app.date}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="All Donations"
        action={
          <button
            type="button"
            className="text-sm font-medium text-gold-600 hover:text-gold-500"
            onClick={() => onGoSection('donors')}
          >
            View donors →
          </button>
        }
      >
        {donations.length === 0 ? (
          <EmptyState title="No donations yet" message="Donor payments will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Donor Email</th>
                  <th>Sponsored Child</th>
                  <th>Amount (PKR)</th>
                  <th>Receipt No.</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.slice(0, 8).map((d) => (
                  <tr key={d.id}>
                    <td>{d.donor_name}</td>
                    <td>{d.donor_email}</td>
                    <td>{d.child_name}</td>
                    <td>{d.amount}</td>
                    <td>{d.receipt_number}</td>
                    <td>{new Date(d.donated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Partner Schools"
        action={
          <button
            type="button"
            className="text-sm font-medium text-gold-600 hover:text-gold-500"
            onClick={() => onGoSection('schools')}
          >
            View schools →
          </button>
        }
      >
        {schools.length === 0 ? (
          <EmptyState title="No schools registered" message="School accounts will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Enrolled Students</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{s.studentCount}</td>
                    <td>
                      <StatusBadge status={s.status || (s.is_approved ? 'Approved' : 'Pending')} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function OrphansSection({
  applications,
  schools,
  assignments,
  updateAssignment,
  onOpenDetail,
  onApprove,
  onReject,
}) {
  return (
    <SectionCard title="Orphan Applications">
      {applications.length === 0 ? (
        <EmptyState icon={Inbox} title="No applications yet" message="Submitted applications will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>School / Status</th>
                <th>Assign School</th>
                <th>Assign Class</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const assignment = assignments[app.id] || { schoolId: '', studentClass: '' }
                return (
                  <tr key={app.id}>
                    <td>
                      <button
                        type="button"
                        className="font-medium text-nude-900 underline-offset-2 hover:underline"
                        onClick={() => onOpenDetail(app.id)}
                      >
                        {app.name}
                      </button>
                    </td>
                    <td>{app.age != null ? app.age : '—'}</td>
                    <td>
                      <div className="text-sm">{app.school || '—'}</div>
                      {!app.is_currently_studying && (
                        <span className="text-xs text-amber-700">Not currently studying</span>
                      )}
                    </td>
                    <td className="min-w-[180px]">
                      {app.status === 'Pending' ? (
                        <Select
                          value={assignment.schoolId}
                          onChange={(e) => updateAssignment(app.id, 'schoolId', e.target.value)}
                        >
                          <option value="">Select school</option>
                          {schools.map((school) => (
                            <option key={school.id} value={school.id}>
                              {school.name}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span className="text-sm text-nude-600">{app.school}</span>
                      )}
                    </td>
                    <td className="min-w-[140px]">
                      {app.status === 'Pending' ? (
                        <Select
                          value={assignment.studentClass}
                          onChange={(e) => updateAssignment(app.id, 'studentClass', e.target.value)}
                        >
                          <option value="">Select class</option>
                          {CLASS_OPTIONS.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <span className="text-sm text-nude-600">{app.className || '—'}</span>
                      )}
                    </td>
                    <td>{app.date}</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      {app.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => onApprove(app.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => onReject(app.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="text-xs text-gold-600 hover:underline"
                          onClick={() => onOpenDetail(app.id)}
                        >
                          View details
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

function ReportsSection({ reports, onOpen }) {
  return (
    <SectionCard title="Student Monthly Reports">
      {reports.length === 0 ? (
        <EmptyState title="No reports yet" message="School-submitted monthly reports will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>School</th>
                <th>Month</th>
                <th>Attendance</th>
                <th>Marks</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer hover:bg-nude-50"
                  onClick={() => onOpen(r)}
                >
                  <td className="font-medium text-nude-900">{r.student_name}</td>
                  <td>{r.school_name}</td>
                  <td>{r.report_month}</td>
                  <td>{r.attendance}%</td>
                  <td>{r.average_marks}%</td>
                  <td>{new Date(r.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

function SchoolsSection({ schools, onApproveSchool, onRejectSchool }) {
  return (
    <SectionCard title="Registered Schools">
      {schools.length === 0 ? (
        <EmptyState title="No schools registered" message="School accounts will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr>
                <th>School Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Enrolled Students</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s) => {
                const status = s.status || (s.is_approved ? 'Approved' : 'Pending')
                return (
                  <tr key={s.id}>
                    <td className="font-medium">{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone || '—'}</td>
                    <td>{s.studentCount}</td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {status !== 'Approved' && (
                          <Button
                            variant="primary"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => onApproveSchool(s.id)}
                          >
                            Approve
                          </Button>
                        )}
                        {status !== 'Rejected' && (
                          <Button
                            variant="danger"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => onRejectSchool(s.id)}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

function DonorsSection({ registered, donations, onOpenDonation }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionCard title="Registered Donors">
        {registered.length === 0 ? (
          <EmptyState title="No donors yet" message="Donor accounts will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Donations</th>
                  <th>Total Donated</th>
                </tr>
              </thead>
              <tbody>
                {registered.map((d) => (
                  <tr key={d.id}>
                    <td className="font-medium">{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.phone || '—'}</td>
                    <td>{d.donation_count}</td>
                    <td>PKR {d.total_donated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Donors Who Donated">
        {donations.length === 0 ? (
          <EmptyState title="No donations yet" message="Completed donations will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Email</th>
                  <th>Sponsored Child</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr
                    key={d.id}
                    className="cursor-pointer hover:bg-nude-50"
                    onClick={() => onOpenDonation(d)}
                  >
                    <td className="font-medium text-nude-900">{d.donor_name}</td>
                    <td>{d.donor_email}</td>
                    <td>{d.child_name}</td>
                    <td>PKR {d.amount}</td>
                    <td>{new Date(d.donated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function FeedbackSection({ feedback, newsletter, onOpenFeedback, onAccept, onReject }) {
  return (
    <div className="flex flex-col gap-8">
      <SectionCard title="Website Feedback">
        {feedback.length === 0 ? (
          <EmptyState title="No feedback yet" message="Public feedback submissions will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Feedback</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => (
                  <tr
                    key={f.id}
                    className="cursor-pointer hover:bg-nude-50"
                    onClick={() => onOpenFeedback?.(f)}
                  >
                    <td className="font-medium text-nude-900">{f.name || 'Anonymous'}</td>
                    <td>{f.email || '—'}</td>
                    <td className="max-w-xl truncate">{f.comments}</td>
                    <td><StatusBadge status={f.status || 'Pending'} /></td>
                    <td>{new Date(f.created_at).toLocaleString()}</td>
                    <td>
                      {(!f.status || f.status === 'Pending') && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="primary"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => onAccept(f.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="danger"
                            className="!px-3 !py-1.5 text-xs"
                            onClick={() => onReject(f.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {f.status === 'Accepted' && <span className="text-xs text-emerald-600 font-medium">Published</span>}
                      {f.status === 'Rejected' && <span className="text-xs text-red-500 font-medium">Rejected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Newsletter Subscribers">
        {newsletter.length === 0 ? (
          <EmptyState title="No subscribers yet" message="Homepage Stay Updated emails will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subscribed On</th>
                </tr>
              </thead>
              <tbody>
                {newsletter.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.email}</td>
                    <td>{new Date(s.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function MessagesSection({ messages, onOpen }) {
  return (
    <SectionCard title="Contact Us Messages">
      {messages.length === 0 ? (
        <EmptyState icon={Mail} title="No messages yet" message="Messages from the Contact Us form will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr
                  key={m.id}
                  className="cursor-pointer hover:bg-nude-50"
                  onClick={() => onOpen(m)}
                >
                  <td className="font-medium text-nude-900">{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.subject || '—'}</td>
                  <td className="max-w-xs truncate">{m.message}</td>
                  <td>{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

function MessageDetailModal({ message, onClose }) {
  return (
    <ModalShell onClose={onClose} title="Contact Message Details">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Name" value={message.name} />
          <DetailItem label="Email" value={message.email} />
          <DetailItem label="Subject" value={message.subject || '—'} />
          <DetailItem
            label="Submitted"
            value={new Date(message.created_at).toLocaleString()}
          />
        </div>
        <div className="rounded-xl border border-nude-100 bg-nude-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-nude-400">
            Message
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-nude-700">
            {message.message}
          </p>
        </div>
      </div>
    </ModalShell>
  )
}

function OrphanAdminDetailModal({
  loading,
  detail,
  schools,
  assignment,
  updateAssignment,
  onClose,
  onApprove,
  onReject,
  onUpdateFee,
}) {
  const [newFee, setNewFee] = useState('')

  // Sync state when detail changes
  useEffect(() => {
    if (detail && detail.monthly_fee !== undefined) {
      setNewFee(detail.monthly_fee)
    }
  }, [detail])

  return (
    <ModalShell onClose={onClose} title="Orphan Application Details">
      {loading || !detail ? (
        <Spinner label="Loading details..." />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-nude-900">{detail.full_name}</h3>
            <StatusBadge status={detail.status} />
          </div>

          {detail.photo && (
            <div className="overflow-hidden rounded-xl border border-nude-100 bg-nude-50">
              <img
                src={detail.photo}
                alt={detail.full_name}
                className="mx-auto max-h-64 object-contain"
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Date of Birth" value={detail.date_of_birth} />
            <DetailItem label="Age" value={detail.age != null ? `${detail.age} years` : '—'} />
            <DetailItem label="Gender" value={detail.gender} />
            <DetailItem label="Guardian Name" value={detail.guardian_name} />
            <DetailItem label="Guardian CNIC" value={detail.guardian_cnic || '—'} />
            <DetailItem label="Address" value={detail.address} />
            <DetailItem
              label="Reported School"
              value={detail.school_name_text || 'Not provided'}
            />
            <DetailItem label="Reported Class" value={detail.student_class || '—'} />
            <DetailItem
              label="Currently Studying"
              value={detail.is_currently_studying ? 'Yes' : 'No'}
            />
            <DetailItem
              label="Assigned School"
              value={detail.assigned_school_name || 'Not assigned yet'}
            />
            <DetailItem
              label="Submitted"
              value={new Date(detail.submitted_at).toLocaleString()}
            />
          </div>

          <div className="rounded-xl border border-nude-100 bg-nude-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-nude-900">
              <FileText size={16} className="text-gold-600" />
              Uploaded Death Certificate (PDF/Image)
            </div>
            {detail.death_certificate ? (
              <a
                href={detail.death_certificate}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-gold-600 hover:underline"
              >
                Open {detail.death_certificate_name || 'document'}
              </a>
            ) : (
              <p className="text-sm text-nude-500">No document uploaded.</p>
            )}
          </div>

          {detail.status === 'Pending' && (
            <div className="grid gap-3 rounded-xl border border-nude-100 p-4 sm:grid-cols-2">
              <Select
                label="Assign School"
                value={assignment?.schoolId || ''}
                onChange={(e) => updateAssignment(detail.id, 'schoolId', e.target.value)}
              >
                <option value="">Select school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Assign Class"
                value={assignment?.studentClass || ''}
                onChange={(e) => updateAssignment(detail.id, 'studentClass', e.target.value)}
              >
                <option value="">Select class</option>
                {CLASS_OPTIONS.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </Select>
              <Input
                label="Monthly Fee (PKR)"
                type="number"
                value={assignment?.monthlyFee || ''}
                onChange={(e) => updateAssignment(detail.id, 'monthlyFee', e.target.value)}
                placeholder="e.g. 1500"
              />
              <div className="flex gap-2 sm:col-span-2">
                <Button variant="primary" onClick={() => onApprove(detail.id)}>
                  Approve
                </Button>
                <Button variant="danger" onClick={() => onReject(detail.id)}>
                  Reject
                </Button>
              </div>
            </div>
          )}

          {detail.status === 'Approved' && (
            <div className="mt-4 grid gap-3 rounded-xl border border-nude-100 bg-nude-50 p-4 sm:grid-cols-2">
              <Input
                label="Update Monthly Fee (PKR)"
                type="number"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                placeholder="e.g. 2000"
              />
              <div className="flex items-end pb-[2px]">
                <Button variant="primary" onClick={() => onUpdateFee(detail.id, newFee)}>
                  Update Fee
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </ModalShell>
  )
}

function ReportDetailModal({ report, onClose }) {
  const isImage =
    report.report_card &&
    /\.(png|jpe?g|gif|webp)$/i.test(report.report_card.split('?')[0])

  return (
    <ModalShell onClose={onClose} title="Student Report Details">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Student" value={report.student_name} />
          <DetailItem label="School" value={report.school_name} />
          <DetailItem label="Class" value={report.student_class} />
          <DetailItem label="Report Month" value={report.report_month} />
          <DetailItem label="Total School Days" value={report.total_school_days} />
          <DetailItem label="Days Present" value={report.days_present} />
          <DetailItem label="Attendance" value={`${report.attendance}%`} />
          <DetailItem label="Average Marks" value={`${report.average_marks}%`} />
          <DetailItem
            label="Submitted"
            value={new Date(report.submitted_at).toLocaleString()}
          />
        </div>
        {report.teacher_comments && (
          <div className="rounded-xl border border-nude-100 bg-nude-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-nude-400">
              Teacher Comments
            </p>
            <p className="mt-2 text-sm text-nude-700">{report.teacher_comments}</p>
          </div>
        )}
        {report.report_card && (
          <div className="rounded-xl border border-nude-100 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-nude-900">
              <ImageIcon size={16} className="text-gold-600" />
              Attached Report Card
            </div>
            {isImage ? (
              <img
                src={report.report_card}
                alt="Report card"
                className="mx-auto max-h-80 rounded-lg object-contain"
              />
            ) : (
              <a
                href={report.report_card}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-gold-600 hover:underline"
              >
                Open attached file
              </a>
            )}
          </div>
        )}
      </div>
    </ModalShell>
  )
}

function DonationDetailModal({ donation, onClose }) {
  return (
    <ModalShell onClose={onClose} title="Donation Details">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailItem label="Donor Name" value={donation.donor_name} />
        <DetailItem label="Donor Email" value={donation.donor_email} />
        <DetailItem label="Sponsored Orphan" value={donation.child_name} />
        <DetailItem label="Amount" value={`PKR ${donation.amount}`} />
        <DetailItem label="Receipt No." value={donation.receipt_number} />
        <DetailItem
          label="Date"
          value={new Date(donation.donated_at).toLocaleString()}
        />
      </div>
    </ModalShell>
  )
}

function FeedbackDetailModal({ feedback, onClose, onAccept, onReject }) {
  return (
    <ModalShell onClose={onClose} title="Feedback Details">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={feedback.status || 'Pending'} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Name" value={feedback.name || 'Anonymous'} />
          <DetailItem label="Email" value={feedback.email || '—'} />
          <DetailItem
            label="Submitted"
            value={new Date(feedback.created_at).toLocaleString()}
          />
        </div>
        <div className="rounded-xl border border-nude-100 bg-nude-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-nude-400">
            Feedback
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-nude-700">
            {feedback.comments}
          </p>
        </div>
        
        {feedback.status !== 'Accepted' && feedback.status !== 'Rejected' && (
          <div className="flex gap-3 pt-2">
            <Button variant="primary" onClick={() => onAccept(feedback.id)}>Accept</Button>
            <Button variant="danger" onClick={() => onReject(feedback.id)}>Reject</Button>
          </div>
        )}
      </div>
    </ModalShell>
  )
}

function ModalShell({ title, children, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-nude-900/55 px-4 py-6 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-nude-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-nude-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-nude-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-nude-500 hover:bg-nude-50 hover:text-nude-900"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-nude-100 bg-white p-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-nude-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-nude-900">{value}</p>
    </div>
  )
}

function SectionCard({ title, children, action }) {
  return (
    <div className="ui-card-elevated overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-nude-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-nude-900">{title}</h2>
        {action}
      </div>
      <div className="p-2 sm:p-0">{children}</div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="ui-card-elevated flex flex-col gap-3 p-5 text-left">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/15 text-gold-600">
        <Icon size={18} />
      </div>
      <p className="text-2xl font-semibold tracking-tight text-nude-900">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-nude-500">{label}</p>
    </div>
  )
}

function PayrollSection() {
  const [month, setMonth] = useState('')
  const [payrollData, setPayrollData] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState(null)

  async function fetchPayroll() {
    if (!month) {
      setError('Please enter a month (e.g. September 2026)')
      return
    }
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const response = await getAdminPayroll(month)
      setPayrollData(response.data)
    } catch (err) {
      setError('Could not fetch payroll data.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePayFee(orphanId) {
    setProcessingId(orphanId)
    setError('')
    setMessage('')
    try {
      const response = await payOrphanFee(orphanId, month)
      setMessage(response.data.message)
      fetchPayroll() // Refresh the data to update status
    } catch (err) {
      setError(err.response?.data?.message || 'Could not pay the fee.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      <SectionCard title="Search Payroll">
        <div className="flex items-end gap-3 p-5">
          <div className="w-64">
            <Input
              label="Billing Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="e.g. September 2026"
            />
          </div>
          <Button variant="primary" onClick={fetchPayroll} loading={loading}>
            Fetch Payroll
          </Button>
        </div>
        {error && <Alert tone="error" className="mx-5 mb-5">{error}</Alert>}
        {message && <Alert tone="success" className="mx-5 mb-5">{message}</Alert>}
      </SectionCard>

      {payrollData.length > 0 && (
        <SectionCard title={`Payroll for ${month}`}>
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>School</th>
                  <th>Class</th>
                  <th>Monthly Fee (PKR)</th>
                  <th>Status</th>
                  <th>Paid By</th>
                  <th>Paid At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((record) => (
                  <tr key={record.orphan_id}>
                    <td className="font-medium text-nude-900">{record.student_name}</td>
                    <td>{record.school_name}</td>
                    <td>{record.student_class}</td>
                    <td>{record.monthly_fee}</td>
                    <td>
                      <StatusBadge status={record.status} />
                    </td>
                    <td>{record.paid_by || '—'}</td>
                    <td>{record.paid_at ? new Date(record.paid_at).toLocaleString() : '—'}</td>
                    <td>
                      {record.status === 'Pending' ? (
                        <Button
                          variant="accent"
                          className="!px-3 !py-1.5 text-xs"
                          loading={processingId === record.orphan_id}
                          onClick={() => handlePayFee(record.orphan_id)}
                        >
                          Mark as Paid
                        </Button>
                      ) : (
                        <span className="text-xs text-nude-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

