# Orphan Educational Sponsorship and Tracking System — Frontend

This is the frontend of the FYP project, built with React, Tailwind CSS, and Vite.
It currently works with sample/placeholder data so you can see and test every page
before the Django backend is connected.

## Pages included
- Home page
- Login (role based: admin, donor, school, orphan)
- Register (with strong password validation)
- Admin Dashboard
- Donor Portal (browse orphans, donate, donation history)
- School Portal (submit monthly report)
- Orphan Application Form
- Progress Report view
- Privacy Policy page

## How to run this project (using Git Bash)

1. Install Node.js (version 18 or higher) from https://nodejs.org if you don't have it.
2. Open Git Bash and go to this project folder:
   ```
   cd path/to/orphan-sponsorship-frontend
   ```
3. Install all dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open the link shown in the terminal (usually http://localhost:5173) in your browser.

## Notes
- All API calls are already written in `src/services/api.js` and point to
  `http://127.0.0.1:8000/api`. Once the Django backend is built, login/register
  and all data will connect automatically.
- The color palette is a warm nude/earthy theme, set up in `tailwind.config.js`.
- Icons are from the `lucide-react` package (no emojis are used anywhere).
