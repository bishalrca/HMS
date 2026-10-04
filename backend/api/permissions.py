from rest_framework import permissions

class IsPatient(permissions.BasePermission):
    """
    Allows access only to authenticated Patient users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (getattr(request.user, 'role', '') == 'PATIENT' or request.user.is_staff or request.user.is_superuser)
        )


class IsDoctor(permissions.BasePermission):
    """
    Allows access only to authenticated Doctor users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (getattr(request.user, 'role', '') == 'DOCTOR' or request.user.is_staff or request.user.is_superuser)
        )


class IsAdmin(permissions.BasePermission):
    """
    Allows access only to Admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (getattr(request.user, 'role', '') == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )


class AppointmentPermission(permissions.BasePermission):
    """
    Role-based permissions for Appointments:
    - Patients: Can create appointments (POST) and view their own appointments.
    - Doctors: Can view appointments assigned to them / doctor schedule and update appointment status.
    - Admins: Full CRUD access.
    - Unauthenticated: Can submit appointment booking (POST) or must login depending on strictness.
    """
    def has_permission(self, request, view):
        # Anyone or Patients can create an appointment
        if request.method == 'POST':
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin full access
        if request.user.is_staff or request.user.is_superuser or getattr(request.user, 'role', '') == 'ADMIN':
            return True

        # Patient access to their own appointment
        if getattr(request.user, 'role', '') == 'PATIENT':
            if request.method in ('PUT', 'PATCH') and request.data.get('status') in ('CONFIRMED', 'REJECTED'):
                return False
            return obj.patient == request.user or obj.email == request.user.email

        # Doctor access to their schedule / assigned appointments
        if getattr(request.user, 'role', '') == 'DOCTOR':
            if hasattr(request.user, 'doctor_profile'):
                return obj.doctor == request.user.doctor_profile
            return False

        return False
