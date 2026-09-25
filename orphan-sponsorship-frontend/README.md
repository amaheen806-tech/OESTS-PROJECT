# Orphan Educational Sponsorship and Tracking System — Frontend

This is the frontend of the OESTS project, built with React, Tailwind CSS, and Vite. It connects to a Django REST Framework backend deployed on Render.

## Pages Included

- Home page
- Login (role-based: admin, donor, school, orphan)
- Register (with strong password validation)
- Admin Dashboard
- Donor Portal (browse orphans, donate, donation history)
- School Portal (submit monthly reports)
- Orphan Application Form
- Progress Report view
- Privacy Policy page

## How to Run Locally

1. Install Node.js (version 18 or higher) from https://nodejs.org if you don't have it.
2. Open a terminal and navigate to this project folder:
   ```
   cd path/to/orphan-sponsorship-frontend
   ```
3. Install all dependencies:
   ```
   npm install
   ```
4. To connect to your local backend, create a `.env` file with:
   ```
   VITE_API_URL=http://127.0.0.1:8000/api
   ```
   Without this file, it will default to the live Render backend.
5. Start the development server:
   ```
   npm run dev
   ```
6. Open the link shown in the terminal (usually http://localhost:5173) in your browser.

## Live Deployment

- **Frontend:** https://oests.vercel.app
- **Backend API:** https://oests-project.onrender.com/api
- **Admin Panel:** https://oests-project.onrender.com/admin/

## Notes

- All API calls are in `src/services/api.js`.
- The color palette uses a warm nude/earthy theme, configured in `tailwind.config.js`.
- Icons are from the `lucide-react` package.
