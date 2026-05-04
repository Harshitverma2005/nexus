from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_member_registration_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='member',
            name='password_hash',
            field=models.CharField(blank=True, default='', max_length=512),
        ),
        migrations.AlterField(
            model_name='member',
            name='profile_link',
            field=models.URLField(blank=True, default='', max_length=2048),
        ),
    ]
