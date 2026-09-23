from datetime import date
from decimal import Decimal
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from users.models import CustomUser
from orphans.models import Orphan
from schools.models import School, AcademicRecord
from donors.models import Donation
from sitecontent.models import ContactMessage, FeedbackEntry, NewsletterSubscriber


class Command(BaseCommand):
    help = (
        "Create demo users, orphans, donations, school reports, and site messages "
        "for local/demo setup. Safe to re-run (upserts by email)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush-demo",
            action="store_true",
            help="Delete previously seeded demo records before creating them again.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["flush_demo"]:
            self.stdout.write("Flushing previous demo data...")
            self._flush_demo()

        self.stdout.write("Seeding users...")
        admin = self._user(
            email="admin@gmail.com",
            full_name="NGO Admin",
            role="admin",
            password="admin@123",
            phone="+92 300 1110001",
            is_staff=True,
            is_superuser=True,
        )

        donors = [
            self._user("donor1@gmail.com", "Ayesha Khan", "donor", "Donor@123", "+92 300 2000001"),
            self._user("donor2@gmail.com", "Bilal Ahmed", "donor", "Donor@123", "+92 300 2000002"),
            self._user("donor3@gmail.com", "Sara Malik", "donor", "Donor@123", "+92 300 2000003"),
            self._user("donor4@gmail.com", "Omar Farooq", "donor", "Donor@123", "+92 300 2000004"),
            self._user("donor5@gmail.com", "Hina Raza", "donor", "Donor@123", "+92 300 2000005"),
        ]

        schools = [
            self._user("school1@gmail.com", "Dream School", "school", "School@123", "+92 42 1111001"),
            self._user("school2@gmail.com", "Central Model School", "school", "School@123", "+92 42 1111002"),
            self._user("school3@gmail.com", "Pak Model School", "school", "School@123", "+92 42 1111003"),
        ]

        for school_user in schools:
            profile = School.objects.filter(user=school_user).first()
            if profile:
                profile.location = "Lahore, Pakistan"
                profile.is_approved = True
                profile.contact_email = school_user.email
                profile.save()

        guardians = [
            self._user("guardian1@gmail.com", "Fatima Bibi", "orphan", "Guardian@123", "+92 300 3000001"),
            self._user("guardian2@gmail.com", "Ali Hussain", "orphan", "Guardian@123", "+92 300 3000002"),
            self._user("guardian3@gmail.com", "Nida Iqbal", "orphan", "Guardian@123", "+92 300 3000003"),
            self._user("guardian4@gmail.com", "Imran Shah", "orphan", "Guardian@123", "+92 300 3000004"),
            self._user("guardian5@gmail.com", "Zainab Noor", "orphan", "Guardian@123", "+92 300 3000005"),
            self._user("guardian6@gmail.com", "Kashif Mehmood", "orphan", "Guardian@123", "+92 300 3000006"),
            self._user("guardian7@gmail.com", "Saba Javed", "orphan", "Guardian@123", "+92 300 3000007"),
            self._user("guardian8@gmail.com", "Rashid Ali", "orphan", "Guardian@123", "+92 300 3000008"),
        ]

        self.stdout.write("Seeding orphan applications...")
        orphan_specs = [
            ("Eman Fatima", date(2018, 3, 12), "female", "Dream School", "1", guardians[0], "Approved", "Lahore"),
            ("Muhammad Ali", date(2016, 7, 4), "male", "Central Model School", "3", guardians[1], "Approved", "Karachi"),
            ("Hamza Ahmed", date(2013, 11, 21), "male", "Pak Model School", "6", guardians[2], "Approved", "Islamabad"),
            ("Amina Noor", date(2017, 1, 9), "female", "Dream School", "2", guardians[3], "Approved", "Lahore"),
            ("Yusuf Khan", date(2015, 5, 18), "male", "Central Model School", "4", guardians[4], "Approved", "Karachi"),
            ("Hira Sheikh", date(2014, 9, 2), "female", "Pak Model School", "5", guardians[5], "Approved", "Islamabad"),
            ("Hassan Raza", date(2019, 2, 28), "male", "Dream School", "1", guardians[6], "Pending", "Lahore"),
            ("Maryam Bibi", date(2012, 12, 15), "female", "Central Model School", "7", guardians[7], "Pending", "Multan"),
        ]

        orphans = []
        photo_dir = Path(__file__).resolve().parents[3] / "seed_assets" / "photos"
        for full_name, dob, gender, school_name, student_class, guardian, status, city in orphan_specs:
            orphan, _ = Orphan.objects.update_or_create(
                guardian=guardian,
                defaults={
                    "full_name": full_name,
                    "date_of_birth": dob,
                    "age": max(1, date.today().year - dob.year),
                    "gender": gender,
                    "guardian_name": guardian.full_name,
                    "guardian_cnic": "35202-1234567-1",
                    "address": f"{city}, Pakistan",
                    "school_name_text": school_name,
                    "student_class": student_class,
                    "is_currently_studying": True,
                    "application_status": status,
                    "reviewed_by": admin if status == "Approved" else None,
                },
            )
            self._assign_orphan_photo(orphan, photo_dir)
            if status == "Approved":
                school_profile = School.objects.filter(school_name__iexact=school_name).first()
                if school_profile:
                    orphan.school = school_profile
                    orphan.is_currently_studying = True
                    orphan.save(update_fields=["school", "is_currently_studying"])
            orphans.append(orphan)

        self.stdout.write("Seeding donations...")
        approved = [o for o in orphans if o.application_status == "Approved"]
        donation_pairs = [
            (donors[0], approved[0], Decimal("5000.00")),
            (donors[0], approved[1], Decimal("3500.00")),
            (donors[1], approved[2], Decimal("8000.00")),
            (donors[2], approved[3], Decimal("4500.00")),
            (donors[3], approved[4], Decimal("6000.00")),
            (donors[4], approved[5], Decimal("2500.00")),
            (donors[1], approved[0], Decimal("2000.00")),
            (donors[2], approved[5], Decimal("7000.00")),
        ]
        for donor, orphan, amount in donation_pairs:
            exists = Donation.objects.filter(donor=donor, orphan=orphan, amount=amount).exists()
            if not exists:
                Donation.objects.create(
                    donor=donor,
                    orphan=orphan,
                    amount=amount,
                    payment_status="paid",
                )

        self.stdout.write("Seeding school reports...")
        school_by_name = {u.full_name: u for u in schools}
        report_specs = [
            (approved[0], "January 2026", 22, 20, Decimal("78.50"), school_by_name["Dream School"]),
            (approved[0], "February 2026", 20, 19, Decimal("81.00"), school_by_name["Dream School"]),
            (approved[1], "January 2026", 22, 21, Decimal("74.00"), school_by_name["Central Model School"]),
            (approved[2], "January 2026", 22, 18, Decimal("69.50"), school_by_name["Pak Model School"]),
            (approved[3], "February 2026", 20, 20, Decimal("88.00"), school_by_name["Dream School"]),
            (approved[4], "February 2026", 20, 17, Decimal("72.25"), school_by_name["Central Model School"]),
            (approved[5], "February 2026", 20, 19, Decimal("85.75"), school_by_name["Pak Model School"]),
            (approved[1], "February 2026", 20, 18, Decimal("76.00"), school_by_name["Central Model School"]),
        ]
        for orphan, month, total_days, present, marks, school_user in report_specs:
            AcademicRecord.objects.update_or_create(
                orphan=orphan,
                report_month=month,
                defaults={
                    "submitted_by": school_user,
                    "total_school_days": total_days,
                    "days_present": present,
                    "average_marks": marks,
                    "teacher_comments": f"{orphan.full_name} is making steady progress this month.",
                },
            )

        self.stdout.write("Seeding contact / feedback / newsletter...")
        if ContactMessage.objects.count() < 5:
            ContactMessage.objects.bulk_create(
                [
                    ContactMessage(
                        name="Visitor One",
                        email="visitor1@example.com",
                        subject="Sponsorship question",
                        message="How do I start sponsoring a child?",
                    ),
                    ContactMessage(
                        name="Visitor Two",
                        email="visitor2@example.com",
                        subject="School registration",
                        message="We want to register our school on the platform.",
                    ),
                    ContactMessage(
                        name="Visitor Three",
                        email="visitor3@example.com",
                        subject="Donation receipt",
                        message="Where can I download my donation receipt?",
                    ),
                    ContactMessage(
                        name="Visitor Four",
                        email="visitor4@example.com",
                        subject="Progress reports",
                        message="How often are progress reports updated?",
                    ),
                    ContactMessage(
                        name="Visitor Five",
                        email="visitor5@example.com",
                        subject="General inquiry",
                        message="Is the platform available nationwide?",
                    ),
                ]
            )

        if FeedbackEntry.objects.count() < 5:
            FeedbackEntry.objects.bulk_create(
                [
                    FeedbackEntry(
                        name="Ayesha",
                        email="ayesha@example.com",
                        comments="Very clear donor experience.",
                    ),
                    FeedbackEntry(
                        name="Bilal",
                        email="bilal@example.com",
                        comments="School report upload is easy.",
                    ),
                    FeedbackEntry(
                        name="Sara",
                        email="sara@example.com",
                        comments="Love the progress tracking.",
                    ),
                    FeedbackEntry(
                        name="Omar",
                        email="omar@example.com",
                        comments="Please add more payment methods.",
                    ),
                    FeedbackEntry(
                        name="Hina",
                        email="hina@example.com",
                        comments="Admin dashboard is helpful.",
                    ),
                    FeedbackEntry(
                        name="Guest",
                        email="guest@example.com",
                        comments="Homepage looks professional.",
                    ),
                ]
            )

        for email in [
            "news1@example.com",
            "news2@example.com",
            "news3@example.com",
            "news4@example.com",
            "news5@example.com",
            "news6@example.com",
        ]:
            NewsletterSubscriber.objects.get_or_create(email=email)

        self.stdout.write(self.style.SUCCESS("Demo data seeding complete."))
        self.stdout.write("")
        self.stdout.write("Login accounts:")
        self.stdout.write("  Admin:    admin@gmail.com / admin@123")
        self.stdout.write("  Donor:    donor1@gmail.com / Donor@123")
        self.stdout.write("  School:   school1@gmail.com / School@123  (full name: Dream School)")
        self.stdout.write("  Guardian: guardian1@gmail.com / Guardian@123")

    def _assign_orphan_photo(self, orphan, photo_dir: Path):
        """Attach a local demo portrait if the orphan has no photo yet."""
        if orphan.photo:
            return

        slug = orphan.full_name.strip().lower().replace(" ", "-")
        candidates = [
            photo_dir / f"{slug}.jpg",
            photo_dir / f"{slug}.png",
            photo_dir / "default-orphan.jpg",
        ]
        for path in candidates:
            if path.exists():
                with path.open("rb") as fh:
                    orphan.photo.save(path.name, File(fh), save=True)
                return

    def _user(self, email, full_name, role, password, phone="", is_staff=False, is_superuser=False):
        user, created = CustomUser.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "full_name": full_name,
                "role": role,
                "phone": phone,
                "is_staff": is_staff,
                "is_superuser": is_superuser,
            },
        )
        user.full_name = full_name
        user.role = role
        user.phone = phone
        user.username = email
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.set_password(password)
        user.save()
        return user

    def _flush_demo(self):
        demo_emails = [
            "admin@gmail.com",
            *[f"donor{i}@gmail.com" for i in range(1, 6)],
            *[f"school{i}@gmail.com" for i in range(1, 4)],
            *[f"guardian{i}@gmail.com" for i in range(1, 9)],
        ]
        users = CustomUser.objects.filter(email__in=demo_emails)
        orphan_ids = list(Orphan.objects.filter(guardian__in=users).values_list("id", flat=True))
        Donation.objects.filter(orphan_id__in=orphan_ids).delete()
        Donation.objects.filter(donor__in=users).delete()
        AcademicRecord.objects.filter(orphan_id__in=orphan_ids).delete()
        Orphan.objects.filter(id__in=orphan_ids).delete()
        School.objects.filter(user__in=users).delete()
        users.delete()
