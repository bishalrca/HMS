from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings

def serve_page(request, page_name):
    template = page_name if page_name.endswith('.html') else f"{page_name}.html"
    return TemplateView.as_view(template_name=template)(request)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    
    # Frontend Homepage
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    
    # Admin Login Route
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),
    path('login', TemplateView.as_view(template_name='login.html'), name='login-direct'),

    # Admin Dashboard Route
    path('dashboard/', TemplateView.as_view(template_name='dashboard.html'), name='dashboard'),
    path('dashboard', TemplateView.as_view(template_name='dashboard.html'), name='dashboard-direct'),

    # Sub-pages inside pages/ directory
    path('pages/<str:page_name>', serve_page, name='pages'),

    # Static Assets & Images serving for development server
    re_path(r'^image/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR.parent / 'image'}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR.parent / 'static'}),
]
