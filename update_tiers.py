import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Member

for m in Member.objects.all():
    if m.tier == 'Trusted':
        m.tier = 'Admin'
    elif m.tier == 'Active':
        m.tier = 'Manager'
    elif m.tier == 'Probation':
        m.tier = 'Member'
    m.save()

# Force Jamie to be Admin for testing
try:
    jamie = Member.objects.get(name='Jamie Espinoza')
    jamie.tier = 'Admin'
    jamie.save()
except Member.DoesNotExist:
    pass

print("Updated tiers successfully.")
