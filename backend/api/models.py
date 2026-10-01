from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    PATIENT = 'PATIENT'
    DOCTOR = 'DOCTOR'
    ADMIN = 'ADMIN'
    
    ROLE_CHOICES = [
        (PATIENT, 'Patient'),
        (DOCTOR, 'Doctor'),
        (ADMIN, 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=PATIENT)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.CharField(max_length=255, default='image/pic-1.jpg', blank=True, null=True)

    def is_patient(self):
        return self.role == self.PATIENT

    def is_doctor(self):
        return self.role == self.DOCTOR

    def is_admin(self):
        return self.role == self.ADMIN or self.is_staff or self.is_superuser

    def save(self, *args, **kwargs):
        if self.is_superuser or self.is_staff:
            self.role = self.ADMIN
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Doctor(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, null=True, blank=True, related_name='doctor_profile')
    name = models.CharField(max_length=150)
    specialty = models.CharField(max_length=100)
    image = models.CharField(max_length=255, default='image/doc-1.jpg')
    whatsapp = models.CharField(max_length=50, blank=True, default='#')
    facebook = models.URLField(blank=True, default='#')
    twitter = models.URLField(blank=True, default='#')
    instagram = models.URLField(blank=True, default='#')
    linkedin = models.URLField(blank=True, default='#')

    def __str__(self):
        return f"{self.name} - {self.specialty}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]
    patient = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')
    name = models.CharField(max_length=150)
    number = models.CharField(max_length=20)
    email = models.EmailField()
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment: {self.name} ({self.date})"


class Review(models.Model):
    name = models.CharField(max_length=150)
    image = models.CharField(max_length=255, default='image/pic-1.jpg')
    rating = models.FloatField(default=5.0)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.name}"


class Blog(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Approval'),
        ('PUBLISHED', 'Published'),
        ('REJECTED', 'Rejected'),
    ]

    title = models.CharField(max_length=255)
    date = models.CharField(max_length=100)
    author = models.CharField(max_length=150)
    author_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='blogs')
    image = models.CharField(max_length=255, default='image/blog-1.jpg')
    summary = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PUBLISHED')

    def __str__(self):
        return f"{self.title} ({self.status})"


class SiteBranding(models.Model):
    logo = models.CharField(max_length=500, blank=True, default='')

    def __str__(self):
        return 'Site branding'
