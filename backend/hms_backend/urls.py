from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings

from .views import (
    HomeView,
    LoginView,
    DashboardOverviewView,
    DashboardAppointmentsView,
    DashboardAppointmentEditView,
    DashboardDoctorsView,
    DashboardDoctorCreateView,
    DashboardDoctorEditView,
    DashboardBlogsView,
    DashboardBlogCreateView,
    DashboardBlogEditView,
    DashboardReviewsView,
    DashboardReviewEditView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    
    # Frontend Homepage & Auth
    path('', HomeView.as_view(), name='home'),
    path('login/', LoginView.as_view(), name='login'),

    # Admin Dashboard Routes & Dedicated Create/Edit Pages
    path('dashboard/', DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('dashboard/overview/', DashboardOverviewView.as_view(), name='dashboard-overview-alt'),
    
    # Appointments
    path('dashboard/appointments/', DashboardAppointmentsView.as_view(), name='dashboard-appointments'),
    path('dashboard/appointments/edit/<int:id>/', DashboardAppointmentEditView.as_view(), name='dashboard-appointment-edit'),

    # Doctors
    path('dashboard/doctors/', DashboardDoctorsView.as_view(), name='dashboard-doctors'),
    path('dashboard/doctors/create/', DashboardDoctorCreateView.as_view(), name='dashboard-doctor-create'),
    path('dashboard/doctors/edit/<int:id>/', DashboardDoctorEditView.as_view(), name='dashboard-doctor-edit'),

    # Blogs
    path('dashboard/blogs/', DashboardBlogsView.as_view(), name='dashboard-blogs'),
    path('dashboard/blogs/create/', DashboardBlogCreateView.as_view(), name='dashboard-blog-create'),
    path('dashboard/blogs/edit/<int:id>/', DashboardBlogEditView.as_view(), name='dashboard-blog-edit'),

    # Reviews
    path('dashboard/reviews/', DashboardReviewsView.as_view(), name='dashboard-reviews'),
    path('dashboard/reviews/edit/<int:id>/', DashboardReviewEditView.as_view(), name='dashboard-review-edit'),

    # Static Assets, Uploaded Media & Images serving
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^image/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR.parent / 'image'}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR.parent / 'static'}),
]
