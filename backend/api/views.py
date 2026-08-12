import os
from pathlib import Path
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Doctor, Appointment, Review, Blog
from .serializers import DoctorSerializer, AppointmentSerializer, ReviewSerializer, BlogSerializer

# Helper to save uploaded file
def save_uploaded_file(uploaded_file, folder='uploads'):
    folder_path = Path(settings.MEDIA_ROOT) / folder
    folder_path.mkdir(parents=True, exist_ok=True)
    
    file_path = folder_path / uploaded_file.name
    saved_path = default_storage.save(f"{folder}/{uploaded_file.name}", ContentFile(uploaded_file.read()))
    return f"/media/{saved_path}"

# Authentication API Views
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

        if user is not None:
            if not user.is_active:
                return Response({'error': 'User account is disabled.'}, status=status.HTTP_403_FORBIDDEN)
            
            login(request, user)
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        logout(request)
        return Response({'success': True, 'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)

class CurrentUserAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'authenticated': True,
                'user': {
                    'username': request.user.username,
                    'email': request.user.email,
                    'is_staff': request.user.is_staff
                }
            })
        return Response({'authenticated': False}, status=status.HTTP_200_OK)

# Doctors Endpoints with Image Upload support
class DoctorListCreateAPIView(generics.ListCreateAPIView):
    queryset = Doctor.objects.all().order_by('-id')
    serializer_class = DoctorSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

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

# Appointments Endpoints
class AppointmentListCreateAPIView(generics.ListCreateAPIView):
    queryset = Appointment.objects.all().order_by('-created_at')
    serializer_class = AppointmentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class AppointmentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

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

# Blogs Endpoints with Image Upload support
class BlogListCreateAPIView(generics.ListCreateAPIView):
    queryset = Blog.objects.all().order_by('-id')
    serializer_class = BlogSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'image_file' in request.FILES:
            data['image'] = save_uploaded_file(request.FILES['image_file'], 'blogs')
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class BlogDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        
        if 'image_file' in request.FILES:
            data['image'] = save_uploaded_file(request.FILES['image_file'], 'blogs')
            
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

# Dashboard Analytics Statistics Endpoint
class DashboardStatsAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        total_doctors = Doctor.objects.count()
        total_appointments = Appointment.objects.count()
        pending_appointments = Appointment.objects.filter(status='PENDING').count()
        confirmed_appointments = Appointment.objects.filter(status='CONFIRMED').count()
        total_reviews = Review.objects.count()
        total_blogs = Blog.objects.count()

        return Response({
            'total_doctors': total_doctors,
            'total_appointments': total_appointments,
            'pending_appointments': pending_appointments,
            'confirmed_appointments': confirmed_appointments,
            'total_reviews': total_reviews,
            'total_blogs': total_blogs,
        }, status=status.HTTP_200_OK)
