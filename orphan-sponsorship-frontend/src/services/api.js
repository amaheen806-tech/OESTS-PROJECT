import axios from 'axios'

// Use VITE_API_URL if defined, otherwise fallback to the production Render URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://oests-project.onrender.com/api'

const api = axios.create({
  baseURL: BASE_URL,
})

// Automatically attach the JWT token to every request if the user is logged in
api.interceptors.request.use((config) => {
  // Don't attach the token to login/register requests — they must work
  // even if an old or invalid token is still saved in the browser.
  const isAuthRequest = config.url.includes('/auth/')
  const token = localStorage.getItem('oests_token')
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---------- Auth ----------
export function sendOTP(data) {
  return api.post('/auth/send-otp/', data)
}

export function verifyOTP(data) {
  return api.post('/auth/verify-otp/', data)
}

export function loginUser(data) {
  return api.post('/auth/login/', data)
}

export function forgotPassword(email) {
  return api.post('/auth/forgot-password/', { email })
}

export function resetPassword(uid, token, password) {
  return api.post('/auth/reset-password/', { uid, token, password })
}

// ---------- Orphans ----------
export function getOrphans() {
  return api.get('/orphans/')
}

export function getAdminApplications() {
  return api.get('/admin/applications/')
}

export function getMyApplication() {
  return api.get('/orphans/my-application/')
}

export function getMyStudents() {
  return api.get('/orphans/my-students/')
}

export function submitOrphanApplication(formData) {
  // Do not set Content-Type manually — axios must add the multipart boundary.
  return api.post('/orphans/apply/', formData)
}

// ---------- Donations ----------
export function makeDonation(data) {
  return api.post('/donations/', data)
}

export function getDonationHistory() {
  return api.get('/donations/history/')
}

export function downloadReceipt(donationId) {
  return api.get(`/donations/${donationId}/receipt/`, { responseType: 'blob' })
}

export function getAllDonations() {
  return api.get('/admin/donations/')
}



// ---------- Public / marketing ----------
export function getPublicStats() {
  return api.get('/public/stats/')
}

export function getFeaturedOrphans() {
  return api.get('/public/featured-orphans/')
}

export function submitContactMessage(data) {
  return api.post('/contact/', data)
}

export function submitFeedback(data) {
  return api.post('/feedback/', data)
}

export function subscribeNewsletter(email) {
  return api.post('/newsletter/subscribe/', { email })
}

// ---------- School Reports ----------
export function submitSchoolReport(formData) {
  // Do not set Content-Type manually — axios must add the multipart boundary.
  return api.post('/reports/submit/', formData)
}

export function getStudentReports(orphanId) {
  return api.get(`/reports/${orphanId}/`)
}

export function getMySubmittedReports() {
  return api.get('/reports/my-submissions/')
}

// ---------- Admin ----------
export function getDashboardStats() {
  return api.get('/admin/dashboard/')
}

export function getPartnerSchools() {
  return api.get('/admin/schools/')
}

export function getAdminOrphanDetail(orphanId) {
  return api.get(`/admin/orphans/${orphanId}/`)
}

export function getAdminReports() {
  return api.get('/admin/reports/')
}

export function getPublicFeedback() {
  return api.get('/public/feedback/')
}

export function acceptFeedback(id) {
  return api.post(`/admin/feedback/${id}/accept/`)
}

export function rejectFeedback(id) {
  return api.post(`/admin/feedback/${id}/reject/`)
}

export function getAdminContactMessages() {
  return api.get('/admin/contact-messages/')
}

export function getAdminDonors() {
  return api.get('/admin/donors/')
}

export function getAdminFeedback() {
  return api.get('/admin/feedback/')
}

export function getAdminNewsletter() {
  return api.get('/admin/newsletter/')
}

export function approveOrphan(orphanId, data = {}) {
  return api.post(`/admin/orphans/${orphanId}/approve/`, data)
}

export function rejectOrphan(orphanId) {
  return api.post(`/admin/orphans/${orphanId}/reject/`)
}

export function updateOrphanFee(orphanId, monthly_fee) {
  return api.post(`/admin/orphans/${orphanId}/fee/`, { monthly_fee })
}

export function approveSchool(schoolId) {
  return api.post(`/admin/schools/${schoolId}/approve/`)
}

export function rejectSchool(schoolId) {
  return api.post(`/admin/schools/${schoolId}/reject/`)
}

// ---------- Payroll ----------
export function getSchoolPayroll(month) {
  return api.get(`/payroll/?month=${month}`)
}

export function getAdminPayroll(month) {
  return api.get(`/admin/payroll/?month=${month}`)
}

export function payOrphanFee(orphanId, month) {
  return api.post(`/admin/payroll/pay/`, { orphan_id: orphanId, month })
}

export default api
