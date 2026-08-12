from django.db import models

class Doctor(models.Model):
    name = models.CharField(max_length=150)
    specialty = models.CharField(max_length=100)
    image = models.CharField(max_length=255, default='image/doc-1.jpg')
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
    title = models.CharField(max_length=255)
    date = models.CharField(max_length=100)
    author = models.CharField(max_length=150)
    image = models.CharField(max_length=255, default='image/blog-1.jpg')
    summary = models.TextField()

    def __str__(self):
        return self.title
