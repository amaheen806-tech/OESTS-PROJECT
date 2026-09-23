import { useState, useEffect } from 'react'
import {
  UploadCloud,
  User,
  Calendar,
  Users,
  CreditCard,
  MapPin,
  School,
  BookOpen,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { submitOrphanApplication, getMyApplication } from '../services/api'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input, { Select } from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import Spinner from '../components/ui/Spinner'
import StatusBadge from '../components/ui/StatusBadge'
import SuccessNotification from '../components/SuccessNotification'
import { digitsOnly, formatCnic, isValidCnic13 } from '../utils/inputMasks'

export default function OrphanApplication() {
  const { user } = useAuth()

  const [existingApplication, setExistingApplication] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianCnic, setGuardianCnic] = useState('')
  const [address, setAddress] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [studentClass, setStudentClass] = useState('')
  const [deathCertificate, setDeathCertificate] = useState(null)
  const [photo, setPhoto] = useState(null)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessNotice, setShowSuccessNotice] = useState(false)

  useEffect(() => {
    checkExistingApplication()
  }, [])

  async function checkExistingApplication() {
    try {
      const response = await getMyApplication()
      setExistingApplication(response.data)
    } catch (err) {
      setExistingApplication(null)
    } finally {
      setCheckingStatus(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!fullName || !dob || !age || !gender || !guardianName || !address) {
      setError('Please fill in all required personal details (including age) before submitting.')
      return
    }

    if (Number(age) <= 0 || Number(age) > 25) {
      setError('Please enter a valid age for the child.')
      return
    }

    if (!guardianCnic.trim()) {
      setError('Please enter the guardian CNIC number.')
      return
    }

    if (!isValidCnic13(guardianCnic)) {
      setError('CNIC number should be 13 digits long. Example: 35202-1234567-1')
      return
    }

    const formData = new FormData()
    formData.append('full_name', fullName)
    formData.append('date_of_birth', dob)
    formData.append('age', age)
    formData.append('gender', gender)
    formData.append('guardian_name', guardianName)
    formData.append('guardian_cnic', guardianCnic)
    formData.append('address', address)
    formData.append('school_name_text', schoolName.trim())
    formData.append('student_class', studentClass.trim())
    if (deathCertificate) formData.append('death_certificate', deathCertificate)
    if (photo) formData.append('photo', photo)

    setSubmitting(true)
    try {
      await submitOrphanApplication(formData)
      setMessage('Your application has been submitted. Please wait for admin approval.')
      setShowSuccessNotice(true)
      checkExistingApplication()
    } catch (err) {
      const responseData = err.response?.data
      let detail = 'Could not submit the application. Please try again.'
      if (typeof responseData === 'string' && responseData.trim()) {
        detail = responseData
      } else if (responseData && typeof responseData === 'object') {
        if (responseData.message) {
          detail = responseData.message
        } else if (responseData.detail) {
          detail = Array.isArray(responseData.detail)
            ? responseData.detail[0]
            : responseData.detail
        } else {
          const [field, messages] = Object.entries(responseData)[0] || []
          if (field && messages) {
            const text = Array.isArray(messages) ? messages[0] : String(messages)
            detail = `${field.replaceAll('_', ' ')}: ${text}`
          }
        }
      } else if (!err.response) {
        detail = 'Cannot reach the server. Make sure the backend is running on port 8000.'
      }
      setError(detail)
    } finally {
      setSubmitting(false)
    }
  }

  if (checkingStatus) {
    return <Spinner label="Checking application status..." />
  }

  if (existingApplication) {
    return <OrphanDashboard application={existingApplication} user={user} />
  }

  return (
    <div className="mx-auto max-w-2xl">
      <SuccessNotification
        open={showSuccessNotice}
        type="success"
        title="Application submitted"
        message="Your application has been submitted. Please wait for admin approval."
        onClose={() => setShowSuccessNotice(false)}
      />

      <PageHeader
        title="Orphan Sponsorship Application"
        subtitle="Please fill in all required fields carefully. The NGO admin will review your application and documents before approval."
      />

      {error && (
        <Alert tone="error" className="mb-4">
          {error}
        </Alert>
      )}
      {message && (
        <Alert tone="success" className="mb-4">
          {message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="ui-card-elevated flex flex-col gap-4 p-6">
        <h2 className="font-semibold text-nude-900">Personal Information</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Child's full name"
          />
          <Input
            label="Date of Birth"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Age (years)"
            type="text"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(digitsOnly(e.target.value, 2))}
            placeholder="e.g. 8"
            hint="Digits only"
          />
          <Select label="Gender" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Guardian Name"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
            placeholder="e.g. Muhammad Irfan (Uncle)"
          />
          <Input
            label="Guardian CNIC"
            type="text"
            inputMode="numeric"
            value={guardianCnic}
            onChange={(e) => setGuardianCnic(formatCnic(e.target.value))}
            placeholder="35202-1234567-1"
            maxLength={15}
            hint="Must be 13 digits. Format: 35202-1234567-1"
          />
        </div>

        <Input
          label="Home Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="House, street, city"
        />

        <h2 className="mt-2 font-semibold text-nude-900">School Information</h2>
        <p className="text-sm text-nude-500">
          Optional. If the child is not currently studying, leave school name and class empty.
          The NGO admin can assign a registered school later.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="School Name (optional)"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Current school (if any)"
          />
          <Input
            label="Current Class (optional)"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            placeholder="e.g. Class 3"
          />
        </div>

        <h2 className="mt-2 font-semibold text-nude-900">Document Upload</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <UploadBox
            label={
              deathCertificate
                ? deathCertificate.name
                : 'Upload death certificate (PDF/JPG, max 5MB)'
            }
            onFileSelected={setDeathCertificate}
          />
          <UploadBox
            label={
              photo ? photo.name : "Upload child's passport photo (JPG/PNG, max 2MB)"
            }
            onFileSelected={setPhoto}
          />
        </div>

        <Button type="submit" variant="primary" loading={submitting} className="mt-2">
          {submitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </form>
    </div>
  )
}

function OrphanDashboard({ application, user }) {
  const genderLabel =
    application.gender === 'male'
      ? 'Male'
      : application.gender === 'female'
        ? 'Female'
        : application.gender || '—'

  const dobFormatted = application.date_of_birth
    ? new Date(application.date_of_birth).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  const submittedFormatted = application.submitted_at
    ? new Date(application.submitted_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Orphan Sponsorship Dashboard"
        subtitle={`Logged in as ${user?.fullName || user?.full_name || 'Guardian'}`}
        action={<StatusBadge status={application.application_status} />}
      />

      {application.application_status === 'Pending' && (
        <Alert tone="info" className="mb-6">
          Your application is being reviewed by the NGO admin. You will see updates here once
          a decision has been made.
        </Alert>
      )}
      {application.application_status === 'Approved' && (
        <Alert tone="success" className="mb-6">
          Congratulations! This application has been approved and is now visible to donors.
        </Alert>
      )}
      {application.application_status === 'Rejected' && (
        <Alert tone="error" className="mb-6">
          This application was not approved. Please contact the NGO admin for more details.
        </Alert>
      )}

      {/* Profile hero card */}
      <div className="ui-card-elevated mb-6 overflow-hidden">
        <div className="bg-nude-800 px-6 py-5 text-nude-50 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
            Application Profile
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {application.full_name}
          </h2>
          <p className="mt-1 text-sm text-nude-300">Submitted on {submittedFormatted}</p>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[200px_1fr]">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-48 w-40 overflow-hidden rounded-xl border border-nude-200 bg-nude-100 shadow-sm">
              {application.photo ? (
                <img
                  src={application.photo}
                  alt={application.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-nude-400">
                  <ImageIcon size={36} />
                  <span className="text-xs">No photo</span>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-nude-500">Uploaded photograph</p>
          </div>

          {/* Personal details */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-nude-500">
              <User size={16} className="text-gold-600" />
              Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField icon={User} label="Full Name" value={application.full_name} />
              <DetailField icon={Calendar} label="Date of Birth" value={dobFormatted} />
              <DetailField
                icon={Users}
                label="Age"
                value={application.age != null ? `${application.age} years` : '—'}
              />
              <DetailField icon={Users} label="Gender" value={genderLabel} />
              <DetailField
                icon={User}
                label="Guardian Name"
                value={application.guardian_name || '—'}
              />
              <DetailField
                icon={CreditCard}
                label="Guardian CNIC"
                value={application.guardian_cnic || '—'}
              />
              <DetailField
                icon={MapPin}
                label="Home Address"
                value={application.address || '—'}
                className="sm:col-span-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* School information */}
      <div className="ui-card-elevated mb-6 p-6 sm:p-8">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-nude-500">
          <School size={16} className="text-gold-600" />
          School Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField
            icon={School}
            label="School Name"
            value={
              application.assigned_school_name ||
              application.school_name_text ||
              (!application.is_currently_studying
                ? 'Not currently studying in any school'
                : '—')
            }
          />
          <DetailField
            icon={BookOpen}
            label="Current Class"
            value={
              application.student_class ||
              (!application.is_currently_studying ? 'Not enrolled yet' : '—')
            }
          />
        </div>
        {!application.is_currently_studying && !application.assigned_school_name && (
          <Alert tone="info" className="mt-4">
            This child is not currently studying. After review, the NGO admin will assign a
            registered school and class.
          </Alert>
        )}
      </div>

      {/* Documents */}
      {(application.photo || application.death_certificate) && (
        <div className="ui-card-elevated p-6 sm:p-8">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-nude-500">
            <FileText size={16} className="text-gold-600" />
            Uploaded Documents
          </h3>
          <div className="flex flex-wrap gap-3">
            {application.photo && (
              <a
                href={application.photo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-nude-200 bg-nude-50 px-4 py-2.5 text-sm font-medium text-nude-800 transition-colors hover:border-gold-500 hover:bg-gold-500/10"
              >
                <ImageIcon size={16} className="text-gold-600" />
                View photograph
              </a>
            )}
            {application.death_certificate && (
              <a
                href={application.death_certificate}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-nude-200 bg-nude-50 px-4 py-2.5 text-sm font-medium text-nude-800 transition-colors hover:border-gold-500 hover:bg-gold-500/10"
              >
                <FileText size={16} className="text-gold-600" />
                View death certificate
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailField({ icon: Icon, label, value, className = '' }) {
  return (
    <div className={`rounded-xl border border-nude-100 bg-nude-50/60 px-4 py-3 ${className}`}>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-nude-500">
        {Icon && <Icon size={13} className="text-gold-600" />}
        {label}
      </div>
      <p className="text-sm font-semibold text-nude-900">{value}</p>
    </div>
  )
}

function UploadBox({ label, onFileSelected }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-nude-300 px-3 py-6 text-center text-sm text-nude-500 hover:border-gold-500 hover:bg-gold-500/5">
      <UploadCloud size={20} className="text-gold-600" />
      {label}
      <input
        type="file"
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files[0] || null)}
      />
    </label>
  )
}
