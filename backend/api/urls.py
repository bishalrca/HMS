from django.urls import path
from .views import (
    RegisterAPIView,
    LoginAPIView,
    LogoutAPIView,
    CurrentUserAPIView,
    UserProfileUpdateAPIView,
    DoctorListCreateAPIView,
    DoctorDetailAPIView,
    AppointmentListCreateAPIView,
    AppointmentDetailAPIView,
    ReviewListCreateAPIView,
    ReviewDetailAPIView,
    BlogListCreateAPIView,
    BlogDetailAPIView,
    DashboardStatsAPIView,
    SiteBrandingAPIView
)

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterAPIView.as_view(), name='api-register'),
    path('auth/login/', LoginAPIView.as_view(), name='api-login'),
    path('auth/logout/', LogoutAPIView.as_view(), name='api-logout'),
    path('auth/user/', CurrentUserAPIView.as_view(), name='api-user'),
    path('auth/profile/', UserProfileUpdateAPIView.as_view(), name='api-profile'),

    # Stats
    path('stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('branding/', SiteBrandingAPIView.as_view(), name='site-branding'),

    # Doctors CRUD
    path('doctors/', DoctorListCreateAPIView.as_view(), name='doctor-list-create'),
    path('doctors/<int:pk>/', DoctorDetailAPIView.as_view(), name='doctor-detail'),

    # Appointments CRUD
    path('appointments/', AppointmentListCreateAPIView.as_view(), name='appointment-list-create'),
    path('appointments/<int:pk>/', AppointmentDetailAPIView.as_view(), name='appointment-detail'),

    # Reviews CRUD
    path('reviews/', ReviewListCreateAPIView.as_view(), name='review-list-create'),
    path('reviews/<int:pk>/', ReviewDetailAPIView.as_view(), name='review-detail'),

    # Blogs CRUD
    path('blogs/', BlogListCreateAPIView.as_view(), name='blog-list-create'),
    path('blogs/<int:pk>/', BlogDetailAPIView.as_view(), name='blog-detail'),
]
