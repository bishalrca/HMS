import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from api.models import Doctor, Review, Blog

def seed():
    print("🌱 Seeding initial data into PostgreSQL database 'hms'...")

    # Seed Doctors
    doctors_data = [
        { "name": "Dr. Priya Sharma", "specialty": "CARDIOLOGIST", "image": "image/doc-1.jpg", "whatsapp": "+9779841234567", "linkedin": "#" },
        { "name": "Dr. Arvind Kumar", "specialty": "GENERAL SURGEON", "image": "image/doc-2.jpg", "whatsapp": "+9779801234567", "linkedin": "#" },
        { "name": "Dr. Ayesha Khan", "specialty": "PEDIATRICIAN", "image": "image/doc-3.jpg", "whatsapp": "+9779811234567", "linkedin": "#" },
        { "name": "Dr. Anjali Desai", "specialty": "GYNECOLOGIST", "image": "image/doc-4.jpg", "whatsapp": "+9779821234567", "linkedin": "#" },
        { "name": "Dr. Rajesh Patel", "specialty": "NEUROLOGIST", "image": "image/doc-5.jpg", "whatsapp": "+9779831234567", "linkedin": "#" },
        { "name": "Dr. Suresh Menon", "specialty": "DERMATOLOGIST", "image": "image/doc-6.jpg", "whatsapp": "+9779851234567", "linkedin": "#" },
        { "name": "Dr. Meera Reddy", "specialty": "ORTHOPEDIC SURGEON", "image": "image/doc-7.jpg", "whatsapp": "+9779861234567", "linkedin": "#" },
        { "name": "Dr. Vikram Menon", "specialty": "ORTHOPEDIC SURGEON", "image": "image/doc-8.jpg", "whatsapp": "+9779871234567", "linkedin": "#" },
        { "name": "Dr. Ravi Verma", "specialty": "UROLOGIST", "image": "image/doc-9.jpg", "whatsapp": "+9779881234567", "linkedin": "#" }
    ]

    for doc in doctors_data:
        Doctor.objects.get_or_create(name=doc["name"], defaults=doc)

    # Seed Reviews
    reviews_data = [
        {
            "name": "Sanjana R",
            "image": "image/pic-1.jpg",
            "rating": 4.5,
            "text": "I had an amazing experience at the hospital. The staff was incredibly friendly, and the doctors made me feel at ease throughout my treatment."
        },
        {
            "name": "Manish S.",
            "image": "image/pic-2.jpg",
            "rating": 4.5,
            "text": "The hospital management system was seamless and efficient. I was able to book an appointment and get all the necessary treatments without any hassle."
        },
        {
            "name": "Priya T.",
            "image": "image/pic-3.jpg",
            "rating": 4.5,
            "text": "From the moment I arrived, I felt well taken care of. The medical team was exceptional, and my recovery was much faster thanks to their attention to detail."
        }
    ]

    for rev in reviews_data:
        Review.objects.get_or_create(name=rev["name"], defaults=rev)

    # Seed Blogs
    blogs_data = [
        {
            "title": "How to choose the Best Cardiac Hospital...",
            "date": "10 november, 2022",
            "author": "Dr. S. Kumar",
            "image": "image/blog-1.jpg",
            "summary": "How to choose the Best Cardiac Hospital in..."
        },
        {
            "title": "Simple Home Remedies For Loose Motions",
            "date": "22 feburary, 2018",
            "author": "Dr. Manoj Ranka",
            "image": "image/blog-2.png",
            "summary": "Loose motions or diarrhea is one of the most ..."
        },
        {
            "title": "The importance of staying Hydrated: Why Urine...",
            "date": "22 november, 2022",
            "author": "Dr. John Smith",
            "image": "image/blog-3.jpg",
            "summary": "Learn how urine color can reveal..."
        },
        {
            "title": "Exercise: Boost your health",
            "date": "12 april, 2023",
            "author": "Dr. Sarah Lee",
            "image": "image/blog-4.jpg",
            "summary": "Discover the numerous physical and mental..."
        },
        {
            "title": "Avoid junk food: tips for better eating",
            "date": "29 november, 2024",
            "author": "Dr. Emily Brown",
            "image": "image/blog-5.jpg",
            "summary": "Explore simple strategies to cut back on junk..."
        },
        {
            "title": "When to consult doctor: recognizing the signs",
            "date": "21 november, 2024",
            "author": "Dr. Michel Thomson",
            "image": "image/blog-6.jpg",
            "summary": "Learn the key symptoms and situations..."
        }
    ]

    for blog in blogs_data:
        Blog.objects.get_or_create(title=blog["title"], defaults=blog)

    print(" Database seeding complete!")

if __name__ == '__main__':
    seed()
