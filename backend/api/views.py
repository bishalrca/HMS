from django.contrib.auth import authenticate, login, logout
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Doctor, Appointment, Review, Blog
from .serializers import DoctorSerializer, AppointmentSerializer, ReviewSerializer, BlogSerializer

# Authentication API Views
class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

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

class LogoutAPIView(APIView):
    permission_classes = [permissions.AllowAny]

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

# Doctors Endpoints
class DoctorListCreateAPIView(generics.ListCreateAPIView):
    queryset = Doctor.objects.all().order_by('-id')
    serializer_class = DoctorSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class DoctorDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.AllowAny()]

class ReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# Blogs Endpoints
class BlogListCreateAPIView(generics.ListCreateAPIView):
    queryset = Blog.objects.all().order_by('-id')
    serializer_class = BlogSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class BlogDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

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
