from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_sitebranding'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='condition',
            field=models.TextField(blank=True, default=''),
        ),
    ]