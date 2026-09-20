from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings

from .views import (
    HomeView,
    LoginView,
    SignupView,
    AppointmentView,
    AboutView,
    ServicesView,
    DoctorsPageView,
    ReviewsPageView,
    BlogsPageView,
    DynamicPageView,
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
    path('signup/', SignupView.as_view(), name='signup'),

    # Public Frontend Pages (.html & clean URLs)
    path('appointment/', AppointmentView.as_view(), name='appointment'),
    path('about/', AboutView.as_view(), name='about'),
    path('services/', ServicesView.as_view(), name='services'),
    path('doctors-page/', DoctorsPageView.as_view(), name='doctors-page'),
    path('reviews-page/', ReviewsPageView.as_view(), name='reviews-page'),
    path('blogs-page/', BlogsPageView.as_view(), name='blogs-page'),

    path('pages/signup.html', SignupView.as_view(), name='signup-html'),
    path('pages/appointment.html', AppointmentView.as_view(), name='appointment-html'),
    path('pages/about.html', AboutView.as_view(), name='about-html'),
    path('pages/services.html', ServicesView.as_view(), name='services-html'),
    path('pages/doctors.html', DoctorsPageView.as_view(), name='doctors-html'),
    path('pages/reviews.html', ReviewsPageView.as_view(), name='reviews-html'),
    path('pages/blogs.html', BlogsPageView.as_view(), name='blogs-html'),
    path('pages/<str:page_name>.html', DynamicPageView.as_view(), name='dynamic-page-html'),

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
