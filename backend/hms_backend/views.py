from django.views.generic import TemplateView
from django.shortcuts import redirect

class HomeView(TemplateView):
    template_name = 'index.html'

class LoginView(TemplateView):
    template_name = 'login.html'

class SignupView(TemplateView):
    template_name = 'pages/signup.html'

class DashboardBaseView(TemplateView):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('/login/')
        return super().dispatch(request, *args, **kwargs)

class AdminDashboardBaseView(DashboardBaseView):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('/login/')
        role = getattr(request.user, 'role', '')
        if not (request.user.is_staff or request.user.is_superuser or role == 'ADMIN'):
            return redirect('/dashboard/overview/')
        return super().dispatch(request, *args, **kwargs)

class DoctorAdminDashboardBaseView(DashboardBaseView):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('/login/')
        role = getattr(request.user, 'role', '')
        if role == 'PATIENT' and not (request.user.is_staff or request.user.is_superuser):
            return redirect('/dashboard/overview/')
        return super().dispatch(request, *args, **kwargs)

class DashboardOverviewView(DashboardBaseView):
    template_name = 'dashboard/overview.html'

class DashboardAppointmentsView(DashboardBaseView):
    template_name = 'dashboard/appointments.html'

class DashboardAppointmentEditView(AdminDashboardBaseView):
    template_name = 'dashboard/appointments_edit.html'

class DashboardDoctorsView(AdminDashboardBaseView):
    template_name = 'dashboard/doctors.html'

class DashboardDoctorCreateView(AdminDashboardBaseView):
    template_name = 'dashboard/doctors_create.html'

class DashboardDoctorEditView(AdminDashboardBaseView):
    template_name = 'dashboard/doctors_edit.html'

class DashboardBlogsView(DoctorAdminDashboardBaseView):
    template_name = 'dashboard/blogs.html'

class DashboardBlogCreateView(DoctorAdminDashboardBaseView):
    template_name = 'dashboard/blogs_create.html'

class DashboardBlogEditView(DoctorAdminDashboardBaseView):
    template_name = 'dashboard/blogs_edit.html'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('/login/')
        role = getattr(request.user, 'role', '')
        if not (request.user.is_staff or request.user.is_superuser or role == 'ADMIN'):
            blog_id = self.kwargs.get('id')
            if blog_id:
                try:
                    from api.models import Blog
                    blog = Blog.objects.get(id=blog_id)
                    is_owner = (
                        blog.author_user == request.user or
                        (request.user.username and blog.author and request.user.username.lower() in blog.author.lower()) or
                        (request.user.first_name and blog.author and request.user.first_name.lower() in blog.author.lower())
                    )
                    if not is_owner:
                        return redirect('/dashboard/blogs/')
                except Exception:
                    return redirect('/dashboard/blogs/')
        return super().dispatch(request, *args, **kwargs)

class DashboardReviewsView(AdminDashboardBaseView):
    template_name = 'dashboard/reviews.html'

class DashboardReviewEditView(AdminDashboardBaseView):
    template_name = 'dashboard/reviews_edit.html'

# Public Frontend Page Views
class AdminOnlyPageView(TemplateView):
    """Restricts access so Blogs and Reviews pages are accessible ONLY to Admin when logged in."""
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            role = getattr(request.user, 'role', '')
            if not (request.user.is_staff or request.user.is_superuser or role == 'ADMIN'):
                return redirect('/dashboard/overview/')
        return super().dispatch(request, *args, **kwargs)

class AppointmentView(TemplateView):
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('/dashboard/appointments/')
        return redirect('/login/')

class AboutView(TemplateView):
    template_name = 'pages/about.html'

class ServicesView(TemplateView):
    template_name = 'pages/services.html'

class DoctorsPageView(TemplateView):
    template_name = 'pages/doctors.html'

class ReviewsPageView(AdminOnlyPageView):
    template_name = 'pages/reviews.html'

class BlogsPageView(AdminOnlyPageView):
    template_name = 'pages/blogs.html'

class DynamicPageView(TemplateView):
    def dispatch(self, request, *args, **kwargs):
        page_name = self.kwargs.get('page_name', '').lower()
        if 'appointment' in page_name:
            if request.user.is_authenticated:
                return redirect('/dashboard/appointments/')
            return redirect('/login/')
        if ('blog' in page_name or 'review' in page_name) and request.user.is_authenticated:
            role = getattr(request.user, 'role', '')
            if not (request.user.is_staff or request.user.is_superuser or role == 'ADMIN'):
                return redirect('/dashboard/overview/')
        return super().dispatch(request, *args, **kwargs)

    def get_template_names(self):
        page_name = self.kwargs.get('page_name', '')
        return [f'pages/{page_name}.html', f'{page_name}.html']

