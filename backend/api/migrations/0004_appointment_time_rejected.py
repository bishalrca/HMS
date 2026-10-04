from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_appointment_condition'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='time',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='appointment',
            name='status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending'),
                    ('CONFIRMED', 'Confirmed'),
                    ('REJECTED', 'Rejected'),
                    ('CANCELLED', 'Cancelled'),
                ],
                default='PENDING',
                max_length=20,
            ),
        ),
    ]