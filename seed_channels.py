import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append('/app')
django.setup()

from core.models import Channel, Member

admins = [68, 69, 67]
channels_data = [
    {"title": "SaaS Founders", "description": "Exclusive network for SaaS founders and executives.", "entry_fee": 1500.00, "admin_id": 68},
    {"title": "Fintech Innovators", "description": "Connecting leaders in the financial technology sector.", "entry_fee": 2500.00, "admin_id": 69},
    {"title": "Enterprise Deals", "description": "High-ticket enterprise software deals.", "entry_fee": 5000.00, "admin_id": 67},
]

for cd in channels_data:
    admin = Member.objects.get(id=cd['admin_id'])
    ch, created = Channel.objects.get_or_create(
        title=cd['title'],
        defaults={
            'description': cd['description'],
            'entry_fee': cd['entry_fee'],
            'admin': admin
        }
    )
    if created:
        print(f"Created channel: {ch.title}")

print("Done")
