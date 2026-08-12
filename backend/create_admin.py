import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hms_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_super_admin():
    username = os.environ.get('ADMIN_USER', 'admin')
    email = os.environ.get('ADMIN_EMAIL', 'admin@hms.com')
    password = os.environ.get('ADMIN_PASS', 'admin123')

    if not User.objects.filter(username=username).exists():
        print(f"Creating superuser '{username}'...")
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f" SUCCESS: Superuser '{username}' created with password '{password}'!")
    else:
        # Reset password to admin123
        u = User.objects.get(username=username)
        u.set_password(password)
        u.is_staff = True
        u.is_superuser = True
        u.save()
        print(f" SUCCESS: Updated credentials for superuser '{username}' (password: '{password}')")

if __name__ == '__main__':
    create_super_admin()
