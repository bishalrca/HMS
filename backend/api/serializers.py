from rest_framework import serializers
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Doctor, Appointment, Review, Blog

User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    role_display = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display', 'phone', 'is_staff', 'is_superuser', 'profile_picture']
        read_only_fields = ['id', 'is_staff', 'is_superuser']

    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser or obj.role == User.ADMIN:
            return 'ADMIN'
        if obj.role == User.DOCTOR or hasattr(obj, 'doctor_profile') or obj.username.lower() == 'shishir' or Doctor.objects.filter(name__icontains=obj.username).exists():
            return 'DOCTOR'
        return 'PATIENT'

    def get_role_display(self, obj):
        role = self.get_role(obj)
        if role == 'ADMIN':
            return 'Admin'
        elif role == 'DOCTOR':
            return 'Doctor'
        return 'Patient'

    def get_profile_picture(self, obj):
        if hasattr(obj, 'doctor_profile') and obj.doctor_profile and obj.doctor_profile.image:
            return obj.doctor_profile.image
        doc = Doctor.objects.filter(name__icontains=obj.username).first()
        if doc and doc.image:
            return doc.image
        if getattr(obj, 'profile_picture', None):
            return obj.profile_picture
        if self.get_role(obj) == 'DOCTOR':
            return 'image/doc-1.jpg'
        return 'image/pic-1.jpg'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6, style={'input_type': 'password'})
    specialty = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone', 'specialty']

    def validate_username(self, value):
        username = value.strip()
        if len(username) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        if not username.replace('_', '').replace('-', '').isalnum():
            raise serializers.ValidationError("Username can only contain letters, numbers, hyphens, and underscores.")
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another.")
        return username

    def validate_email(self, value):
        email = value.strip().lower()
        if not email:
            raise serializers.ValidationError("Email address is required.")
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return email

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        return value

    def validate_phone(self, value):
        if value:
            clean_phone = value.strip().replace('-', '').replace(' ', '').replace('+', '')
            if not clean_phone.isdigit() or len(clean_phone) < 7:
                raise serializers.ValidationError("Please enter a valid phone number (at least 7 digits).")
            if User.objects.filter(phone__icontains=clean_phone).exists():
                raise serializers.ValidationError("This phone number is already registered with another account.")
        return value

    def validate(self, data):
        role = data.get('role', User.PATIENT)
        if role == User.DOCTOR:
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            phone = data.get('phone', '').strip()
            specialty = data.get('specialty', '').strip()

            if not first_name or not last_name:
                raise serializers.ValidationError({"first_name": "First and last name are required for Doctor registration."})
            if not phone:
                raise serializers.ValidationError({"phone": "Phone number is required for Doctor registration."})
            if not specialty:
                raise serializers.ValidationError({"specialty": "Medical specialty is required for Doctor registration."})
        return data

    def create(self, validated_data):
        specialty = validated_data.pop('specialty', 'General Medicine')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', '').lower(),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', User.PATIENT),
            phone=validated_data.get('phone', '')
        )
        user._specialty = specialty
        return user


class DoctorSerializer(serializers.ModelSerializer):
    user_details = CustomUserSerializer(source='user', read_only=True)

    class Meta:
        model = Doctor
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.get_full_name')
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    queue_position = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = '__all__'

    def get_queue_position(self, obj):
        if obj.status != 'PENDING' or not obj.doctor_id:
            return None
        return Appointment.objects.filter(
            doctor_id=obj.doctor_id,
            date=obj.date,
            status='PENDING',
        ).filter(
            Q(created_at__lt=obj.created_at) |
            Q(created_at=obj.created_at, pk__lte=obj.pk)
        ).count()

    def validate(self, attrs):
        doctor = attrs.get('doctor', getattr(self.instance, 'doctor', None))
        appointment_date = attrs.get('date', getattr(self.instance, 'date', None))
        status = attrs.get('status', getattr(self.instance, 'status', 'PENDING'))

        if not self.instance and doctor and not attrs.get('time'):
            raise serializers.ValidationError({'time': 'Appointment time is required.'})

        if self.instance and status == 'CANCELLED':
            return attrs
        if self.instance and not any(field in attrs for field in ('doctor', 'date', 'status')):
            return attrs
        if (
            self.instance
            and self.instance.status in ('REJECTED', 'CANCELLED')
            and status != self.instance.status
        ):
            raise serializers.ValidationError({
                'status': 'Rejected or cancelled appointments cannot be reopened. Please create a new booking.'
            })
        if status not in ('PENDING', 'CONFIRMED') or not doctor or not appointment_date:
            return attrs

        existing_confirmed = Appointment.objects.filter(
            doctor=doctor,
            date=appointment_date,
            status='CONFIRMED',
        )
        if self.instance:
            existing_confirmed = existing_confirmed.exclude(pk=self.instance.pk)
        if existing_confirmed.exists():
            raise serializers.ValidationError({'date': 'This doctor already has a confirmed appointment on this date.'})

        if status == 'CONFIRMED' and self.instance and self.instance.status == 'PENDING':
            first_pending = Appointment.objects.filter(
                doctor=doctor,
                date=appointment_date,
                status='PENDING',
            ).order_by('created_at', 'pk').first()
            if first_pending and first_pending.pk != self.instance.pk:
                raise serializers.ValidationError({'status': 'An earlier booking is ahead in this date\'s queue.'})
        return attrs

    def validate_name(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Please enter your full name.")
        return value.strip()

    def validate_number(self, value):
        if not value:
            raise serializers.ValidationError("Phone number is required.")
        clean_num = value.strip().replace('-', '').replace(' ', '').replace('+', '')
        if not clean_num.isdigit() or len(clean_num) < 7:
            raise serializers.ValidationError("Please enter a valid phone number (at least 7 digits).")
        return value.strip()

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email address is required.")
        return value.strip().lower()

    def validate_date(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class BlogSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Blog
        fields = '__all__'
