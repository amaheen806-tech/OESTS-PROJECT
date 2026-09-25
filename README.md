# Orphan Educational Sponsorship and Tracking System (OESTS)

A web-based platform that connects verified orphans, partner schools, and donors for transparent education sponsorship. Schools submit monthly progress reports, donors can sponsor specific children, and administrators manage the entire workflow from a central dashboard.

## Live Deployment

- **Website:** https://oests.vercel.app
- **Backend API:** https://oests-project.onrender.com/api
- **Admin Panel:** https://oests-project.onrender.com/admin/

## Project Structure

```
OESTS-PROJECT/
  orphan-sponsorship-frontend/   React + Vite frontend
  orphan-sponsorship-backend/    Django REST Framework backend
```

## Frontend

Built with React, Vite, and Tailwind CSS. Deployed on Vercel.

**Pages:**
- Home, Login, Register (role-based: admin, donor, school, orphan)
- Admin Dashboard (stats, orphan/school approvals, payroll, donations)
- Donor Portal (browse orphans, donate, donation history, PDF receipts)
- School Portal (submit monthly progress reports)
- Orphan Application Form
- Privacy Policy

**Run locally:**
```
cd orphan-sponsorship-frontend
npm install
npm run dev
```

## Backend

Built with Django 4.2 and Django REST Framework. Deployed on Render with PostgreSQL.

**API Modules:**
- Authentication (OTP verification, JWT tokens, password reset)
- Orphan management (applications, approvals, fee tracking)
- School management (profiles, monthly reports)
- Donor management (sponsorships, donations, PDF receipts)
- Admin operations (dashboard, payroll, feedback, newsletter)

**Key integrations:** Cloudinary (media storage), Stripe (payments), Gmail SMTP (email notifications)

**Run locally:**
```
cd orphan-sponsorship-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Technologies

| Layer | Stack |
|-------|-------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL |
| Auth | SimpleJWT (token-based) |
| Media | Cloudinary |
| Payments | Stripe |
| Deployment | Vercel (frontend), Render (backend) |
