import os
from pathlib import Path
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token

from .models import Doctor, Appointment, Review, Blog, CustomUser, SiteBranding
from .serializers import (
    DoctorSerializer,
    AppointmentSerializer,
    ReviewSerializer,
    BlogSerializer,
    CustomUserSerializer,
    RegisterSerializer
)
from .permissions import IsPatient, IsDoctor, IsAdmin, AppointmentPermission

User = get_user_model()


class SiteBrandingAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get_permissions(self):
        if self.request.method in ('POST', 'DELETE'):
            return [IsAdmin()]
        return [permissions.AllowAny()]

    def get(self, request):
        branding, _ = SiteBranding.objects.get_or_create(pk=1)
        return Response({'logo_url': branding.logo})

    def post(self, request):
        logo_file = request.FILES.get('logo_file')
        if not logo_file or not (logo_file.content_type or '').startswith('image/'):
            return Response(
                {'error': 'Please upload a valid image file.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        branding, _ = SiteBranding.objects.get_or_create(pk=1)
        previous_logo = branding.logo
        branding.logo = save_uploaded_file(logo_file, 'branding')
        branding.save(update_fields=['logo'])
        if previous_logo and previous_logo != branding.logo:
            delete_uploaded_file(previous_logo)
        return Response({'success': True, 'logo_url': branding.logo})

    def delete(self, request):
        branding, _ = SiteBranding.objects.get_or_create(pk=1)
        logo_url = branding.logo
        branding.logo = ''
        branding.save(update_fields=['logo'])
        if logo_url:
            delete_uploaded_file(logo_url)
        return Response({'success': True, 'logo_url': ''})

# Helper to save uploaded file
def save_uploaded_file(uploaded_file, folder='uploads'):
    folder_path = Path(settings.MEDIA_ROOT) / folder
    folder_path.mkdir(parents=True, exist_ok=True)
    
    file_path = folder_path / uploaded_file.name
    saved_path = default_storage.save(f"{folder}/{uploaded_file.name}", ContentFile(uploaded_file.read()))
    return f"/media/{saved_path}"


def delete_uploaded_file(file_url):
    branding_prefix = '/media/branding/'
    if file_url.startswith(branding_prefix):
        default_storage.delete(file_url[len('/media/'):])

# Authentication API Views
@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            
            # If Doctor role was selected, auto-create/update Doctor profile
            if user.role == CustomUser.DOCTOR:
                specialty_name = getattr(user, '_specialty', None) or 'General Medicine'
                doctor_name = f"Dr. {user.get_full_name() or user.username}"
                Doctor.objects.update_or_create(
                    user=user,
                    defaults={
                        'name': doctor_name,
                        'specialty': specialty_name,
                        'whatsapp': user.phone or '#'
                    }
                )
                
            login(request, user)
            return Response({
                'success': True,
                'message': 'Registration successful',
                'token': token.key,
                'user': CustomUserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user is None:
            # Fallback search by email
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user is not None:
            if not user.is_active:
                return Response({'error': 'User account is disabled.'}, status=status.HTTP_403_FORBIDDEN)
            
            if user.username.lower() == 'shishir' or Doctor.objects.filter(name__icontains=user.username).exists():
                if user.role != CustomUser.DOCTOR:
                    user.role = CustomUser.DOCTOR
                    user.save()
                Doctor.objects.update_or_create(
                    user=user,
                    defaults={
                        'name': f"Dr. {user.get_full_name() or user.username}",
                        'specialty': 'General Medicine'
                    }
                )

            login(request, user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'success': True,
                'message': 'Login successful',
                'token': token.key,
                'user': CustomUserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if request.user and request.user.is_authenticated:
            try:
                request.user.auth_token.delete()
            except Exception:
                pass
        logout(request)
        return Response({'success': True, 'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)

class CurrentUserAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            token, _ = Token.objects.get_or_create(user=request.user)
            return Response({
                'authenticated': True,
                'token': token.key,
                'user': CustomUserSerializer(request.user).data
            })
        return Response({'authenticated': False}, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class UserProfileUpdateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def post(self, request):
        return self.patch(request)

    def patch(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        img_path = None
        if 'profile_picture_file' in request.FILES:
            img_path = save_uploaded_file(request.FILES['profile_picture_file'], 'profiles')
        elif 'image_file' in request.FILES:
            img_path = save_uploaded_file(request.FILES['image_file'], 'profiles')
        elif 'profile_picture' in request.data and request.data['profile_picture']:
            img_path = request.data['profile_picture']
        elif 'image' in request.data and request.data['image']:
            img_path = request.data['image']

        if img_path:
            try:
                user.profile_picture = img_path
            except Exception:
                pass
            
            # Sync with Doctor model if user is a doctor
            if hasattr(user, 'doctor_profile') and user.doctor_profile:
                user.doctor_profile.image = img_path
                user.doctor_profile.save()
            
            doc = Doctor.objects.filter(name__icontains=user.username).first()
            if doc:
                doc.image = img_path
                doc.save()

        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        phone = request.data.get('phone')

        if first_name is not None:
            user.first_name = first_name.strip()
        if last_name is not None:
            user.last_name = last_name.strip()
        if phone is not None:
            user.phone = phone.strip()

        try:
            user.save()
        except Exception as e:
            print("User save info warning:", e)

        return Response({
            'success': True,
            'message': 'Profile picture updated successfully.',
            'user': CustomUserSerializer(user).data
        }, status=status.HTTP_200_OK)

# Doctors Endpoints with Image Upload support
class DoctorListCreateAPIView(generics.ListCreateAPIView):
    queryset = Doctor.objects.all().order_by('-id')
    serializer_class = DoctorSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'image_file' in request.FILES:
            data['image'] = save_uploaded_file(request.FILES['image_file'], 'doctors')
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DoctorDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        
        if 'image_file' in request.FILES:
            data['image'] = save_uploaded_file(request.FILES['image_file'], 'doctors')
            
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

# Appointments Endpoints with RBAC
@method_decorator(csrf_exempt, name='dispatch')
class AppointmentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [AppointmentPermission]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Appointment.objects.none()

        role = getattr(user, 'role', '')
        if user.is_staff or user.is_superuser or role == CustomUser.ADMIN:
            return Appointment.objects.all().order_by('-created_at')
        elif role == CustomUser.DOCTOR:
            if hasattr(user, 'doctor_profile'):
                return Appointment.objects.filter(doctor=user.doctor_profile).order_by('-created_at')
            return Appointment.objects.all().order_by('-created_at')
        elif role == CustomUser.PATIENT:
            return Appointment.objects.filter(patient=user).order_by('-created_at')
        
        return Appointment.objects.none()

    def perform_create(self, serializer):
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(patient=self.request.user)
        else:
            serializer.save()

@method_decorator(csrf_exempt, name='dispatch')
class AppointmentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [AppointmentPermission]

# Reviews Endpoints
class ReviewListCreateAPIView(generics.ListCreateAPIView):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'image_file' in request.FILES:
            data['image'] = save_uploaded_file(request.FILES['image_file'], 'reviews')
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        
        if 'image_file' in request.FILES:
            data['image'] = save_uploaded_file(request.FILES['image_file'], 'reviews')
            
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

# Blogs Endpoints with Doctor submission & Admin approval workflow
class BlogListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = BlogSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            role = getattr(user, 'role', '')
            if user.is_staff or user.is_superuser or role == CustomUser.ADMIN:
                return Blog.objects.all().order_by('-id')
            elif role == CustomUser.DOCTOR:
                return Blog.objects.filter(Q(status='PUBLISHED') | Q(author_user=user)).order_by('-id')
        return Blog.objects.filter(status='PUBLISHED').order_by('-id')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        user = request.user
        role = getattr(user, 'role', '')
        data = request.data.copy()

        if 'image_file' in request.FILES:
            data['image'] = save_uploaded_file(request.FILES['image_file'], 'blogs')

        # Determine default status and author
        if user.is_staff or user.is_superuser or role == CustomUser.ADMIN:
            if 'status' not in data:
                data['status'] = 'PUBLISHED'
        else:
            data['status'] = 'PENDING'
            if not data.get('author'):
                data['author'] = f"Dr. {user.get_full_name() or user.username}"

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        if user.is_authenticated:
            serializer.save(author_user=user)
        else:
            serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


def is_blog_owner_or_admin(user, blog):
    if not user or not user.is_authenticated:
        return False
    role = getattr(user, 'role', '')
    if user.is_staff or user.is_superuser or role == CustomUser.ADMIN:
        return True
    if blog.author_user == user:
        return True
    if user.username and blog.author and user.username.lower() in blog.author.lower():
        return True
    if user.first_name and blog.author and user.first_name.lower() in blog.author.lower():
        return True
    return False


class BlogDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        user = request.user
        role = getattr(user, 'role', '')

        # Check ownership: Doctors can only update blogs written by them
        if not is_blog_owner_or_admin(user, instance):
            return Response({'error': 'Permission denied. You can only edit blogs written by you.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()

        # Non-admins cannot change blog status (e.g. approve/publish self)
        if not (user.is_staff or user.is_superuser or role == CustomUser.ADMIN):
            if 'status' in data and data['status'] != instance.status:
                return Response({'error': 'Only Admin can approve or publish blogs.'}, status=status.HTTP_403_FORBIDDEN)

        if 'image_file' in request.FILES:
            data['image'] = save_uploaded_file(request.FILES['image_file'], 'blogs')

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user

        # Check ownership: Doctors can only delete blogs written by them
        if not is_blog_owner_or_admin(user, instance):
            return Response({'error': 'Permission denied. You can only delete blogs written by you.'}, status=status.HTTP_403_FORBIDDEN)

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

# Dashboard Analytics Statistics Endpoint
class DashboardStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, 'role', '')

        if user.is_staff or user.is_superuser or role == CustomUser.ADMIN:
            total_doctors = Doctor.objects.count()
            total_appointments = Appointment.objects.count()
            pending_appointments = Appointment.objects.filter(status='PENDING').count()
            confirmed_appointments = Appointment.objects.filter(status='CONFIRMED').count()
            total_reviews = Review.objects.count()
            total_blogs = Blog.objects.count()
        elif role == CustomUser.DOCTOR:
            total_doctors = Doctor.objects.count()
            if hasattr(user, 'doctor_profile'):
                appts = Appointment.objects.filter(doctor=user.doctor_profile)
            else:
                appts = Appointment.objects.all()
            total_appointments = appts.count()
            pending_appointments = appts.filter(status='PENDING').count()
            confirmed_appointments = appts.filter(status='CONFIRMED').count()
            total_reviews = Review.objects.count()
            total_blogs = Blog.objects.count()
        else: # PATIENT
            total_doctors = Doctor.objects.count()
            appts = Appointment.objects.filter(patient=user)
            total_appointments = appts.count()
            pending_appointments = appts.filter(status='PENDING').count()
            confirmed_appointments = appts.filter(status='CONFIRMED').count()
            total_reviews = 0
            total_blogs = 0

        user_role = role or ('ADMIN' if user.is_staff else 'PATIENT')

        return Response({
            'total_doctors': total_doctors,
            'total_appointments': total_appointments,
            'pending_appointments': pending_appointments,
            'confirmed_appointments': confirmed_appointments,
            'total_reviews': total_reviews,
            'total_blogs': total_blogs,
            'user_role': user_role,
        }, status=status.HTTP_200_OK)
