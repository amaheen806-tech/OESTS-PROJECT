# Orphan Educational Sponsorship and Tracking System — Backend

This is the backend of the OESTS project, built with Django and Django REST Framework. It provides the API for user authentication, orphan management, school reports, donations, and admin operations.

## Tech Stack

- Django 4.2
- Django REST Framework
- PostgreSQL
- SimpleJWT (token-based authentication)
- Cloudinary (media file storage)
- Gunicorn (production server)
- WhiteNoise (static file serving)

## API Modules

- **Authentication:** Registration with OTP verification, login, forgot/reset password
- **Orphans:** Application submission, approval workflow, fee management
- **Schools:** Partner school profiles, monthly progress reports
- **Donors:** Sponsorship, donation history, PDF receipt generation
- **Admin:** Dashboard stats, orphan/school approval, payroll, contact messages, feedback, newsletter

## How to Run Locally

1. Make sure Python 3.10+ and PostgreSQL are installed.
2. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your database credentials.
5. Run migrations:
   ```
   python manage.py migrate
   ```
6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```
7. Start the development server:
   ```
   python manage.py runserver
   ```

## Live Deployment

- **Backend API:** https://oests-project.onrender.com/api
- **Admin Panel:** https://oests-project.onrender.com/admin/
- **Frontend:** https://oests.vercel.app
