from django.views.generic import TemplateView
from django.shortcuts import redirect

class HomeView(TemplateView):
    template_name = 'index.html'

class LoginView(TemplateView):
    template_name = 'login.html'

class DashboardBaseView(TemplateView):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('/login/')
        return super().dispatch(request, *args, **kwargs)

class DashboardOverviewView(DashboardBaseView):
    template_name = 'dashboard/overview.html'

class DashboardAppointmentsView(DashboardBaseView):
    template_name = 'dashboard/appointments.html'

class DashboardAppointmentEditView(DashboardBaseView):
    template_name = 'dashboard/appointments_edit.html'

class DashboardDoctorsView(DashboardBaseView):
    template_name = 'dashboard/doctors.html'

class DashboardDoctorCreateView(DashboardBaseView):
    template_name = 'dashboard/doctors_create.html'

class DashboardDoctorEditView(DashboardBaseView):
    template_name = 'dashboard/doctors_edit.html'

class DashboardBlogsView(DashboardBaseView):
    template_name = 'dashboard/blogs.html'

class DashboardBlogCreateView(DashboardBaseView):
    template_name = 'dashboard/blogs_create.html'

class DashboardBlogEditView(DashboardBaseView):
    template_name = 'dashboard/blogs_edit.html'

class DashboardReviewsView(DashboardBaseView):
    template_name = 'dashboard/reviews.html'

class DashboardReviewEditView(DashboardBaseView):
    template_name = 'dashboard/reviews_edit.html'
