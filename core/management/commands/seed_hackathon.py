from django.core.management.base import BaseCommand
from core.models import Member, Channel, ChannelMembership, Opportunity
from django.utils import timezone
from django.contrib.auth.hashers import make_password
import random

class Command(BaseCommand):
    help = 'Seeds the database with specific users and channels for the hackathon scenario.'

    def handle(self, *args, **options):
        # Clear existing data
        self.stdout.write('Clearing existing data...')
        ChannelMembership.objects.all().delete()
        Opportunity.objects.all().delete()
        Channel.objects.all().delete()
        Member.objects.all().delete()

        # 1. Create 5 Users
        self.stdout.write('Creating users...')
        users = [
            {'name': 'Jamie Espinoza', 'handle': 'jamie_admin', 'avatar': 'JE', 'company': 'Nexus HQ', 'role': 'Admin'},
            {'name': 'Tammy Smith', 'handle': 'tammy_pro', 'avatar': 'TS', 'company': 'Tech Solutions', 'role': 'Member'},
            {'name': 'Stephanie Simon', 'handle': 'steph_simon', 'avatar': 'SS', 'company': 'Simon Consulting', 'role': 'Member'},
            {'name': 'Nicole Green', 'handle': 'nicole_g', 'avatar': 'NG', 'company': 'Green Energy', 'role': 'Member'},
            {'name': 'Ivan Lee', 'handle': 'ivan_lee', 'avatar': 'IL', 'company': 'Lee Dynamics', 'role': 'Fresh'},
        ]

        created_users = []
        for u in users:
            member = Member.objects.create(
                name=u['name'],
                handle=u['handle'],
                avatar=u['avatar'],
                company=u['company'],
                email=f"{u['handle']}@example.com",
                password_hash=make_password('password'),
                score=random.randint(5000, 10000),
                deals_closed=random.randint(5, 35),
                tier='Active' if u['role'] != 'Fresh' else 'Probation'
            )
            created_users.append(member)

        admin = created_users[0]
        members = created_users[1:4]
        fresh_user = created_users[4]

        # 2. Create "CTO Elite" Channel
        self.stdout.write('Creating CTO Elite channel...')
        cto_channel = Channel.objects.create(
            title='CTO Elite',
            description='Exclusive network for Chief Technology Officers and high-level architects.',
            entry_fee=499.00,
            admin=admin
        )

        # 3. Add 3 users to the channel
        for user in members:
            ChannelMembership.objects.create(
                channel=cto_channel,
                member=user,
                has_paid=True
            )

        # 4. Add Ivan as a Fresh Join (not yet in channel)
        # We'll leave Ivan without membership

        # 5. Create Opportunities
        self.stdout.write('Creating opportunities...')
        
        # Public Opportunities
        for i in range(3):
            Opportunity.objects.create(
                title=f'Public Deal #{i+1}: Web App Development',
                description='Looking for a team to build a scalable React/Django application.',
                category='IT',
                value=random.randint(5000, 20000),
                type='Execution Ready',
                confidence='High',
                status='validated',
                submitter=admin,
                tags=['React', 'Django', 'Public']
            )

        # Channel Specific Opportunities
        for i in range(5):
            Opportunity.objects.create(
                title=f'Premium Deal #{i+1}: Cloud Infrastructure Audit',
                description='Exclusive audit required for a Series B fintech startup.',
                category='IT',
                value=random.randint(30000, 100000),
                type='Referral',
                confidence='High',
                status='validated',
                submitter=random.choice(members),
                channel=cto_channel,
                tags=['AWS', 'Fintech', 'Exclusive']
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded hackathon data!'))
