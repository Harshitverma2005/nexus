import os
import django
import random
from django.utils import timezone
from datetime import timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Member, Opportunity, Channel, ChannelMembership, Comment, OpportunityClaim, Notification
from django.contrib.auth.hashers import make_password

def clear_data():
    print("Clearing existing data...")
    Notification.objects.all().delete()
    Comment.objects.all().delete()
    OpportunityClaim.objects.all().delete()
    Opportunity.objects.all().delete()
    ChannelMembership.objects.all().delete()
    Channel.objects.all().delete()
    Member.objects.all().delete()

def seed_data():
    clear_data()
    print("Seeding new data...")

    # 1. Create Members (Indian Names)
    indian_names = [
        ("Arjun Sharma", "@arjun"), ("Priya Patel", "@priya"), ("Vikram Singh", "@vikram"),
        ("Anjali Rao", "@anjali"), ("Siddharth Gupta", "@sid"), ("Neha Verma", "@neha"),
        ("Rohan Mehta", "@rohan"), ("Ishita Das", "@ishita"), ("Rajesh Kumar", "@rajesh"),
        ("Kavita Reddy", "@kavita"), ("Aditya Malhotra", "@aditya"), ("Sanya Iyer", "@sanya"),
        ("Manish Pandey", "@manish"), ("Deepika Joshi", "@deepika"), ("Amit Trivedi", "@amit"),
        ("Sunita Bose", "@sunita"), ("Sanjay Mishra", "@sanjay"), ("Pooja Kapur", "@pooja"),
        ("Vivek Oberoi", "@vivek"), ("Ritu Phogat", "@ritu")
    ]

    expertise_list = ["SaaS", "Fintech", "D2C", "Enterprise", "Marketing", "Consulting", "IT", "Manufacturing"]
    companies = ["Nexus Tech", "Bharat Ventures", "Indus Valley Partners", "Deccan Sol", "Ganga Corp", "Himalaya Advisors"]

    members = []
    for i, (name, handle) in enumerate(indian_names):
        tier = "Admin" if i < 2 else ("Manager" if i < 7 else "Member")
        email = f"{handle[1:]}@nexus.hub"
        initials = "".join([n[0] for n in name.split()])
        
        m = Member.objects.create(
            name=name,
            handle=handle,
            email=email,
            password_hash=make_password("password123"), # Default password
            avatar=initials,
            expertise=random.sample(expertise_list, random.randint(1, 3)),
            score=random.randint(100, 5000),
            deals_closed=random.randint(0, 20),
            success_rate=random.randint(40, 95),
            tier=tier,
            company=random.choice(companies),
            profile_link=f"https://linkedin.com/in/{handle[1:]}",
            joined=(timezone.now() - timedelta(days=random.randint(10, 300))).date()
        )
        members.append(m)
    
    print(f"Created {len(members)} members.")

    # 2. Create Channels
    channel_data = [
        "Bangalore Tech Hub", "Mumbai SaaS Syndicate", "Delhi Angel Circle", "Hyderabad IT Connect", "Pune Startup Network"
    ]

    channels = []
    for title in channel_data:
        admin = random.choice([m for m in members if m.tier in ["Admin", "Manager"]])
        c = Channel.objects.create(
            title=title,
            description=f"Elite networking for {title} based professionals and founders.",
            admin=admin
        )
        channels.append(c)
        # Add admin as member
        ChannelMembership.objects.create(channel=c, member=admin, has_paid=True)
        
        # Add 5-10 random members to each channel
        num_members = random.randint(5, 12)
        random_members = random.sample(members, num_members)
        for m in random_members:
            if m != admin:
                ChannelMembership.objects.create(channel=c, member=m, has_paid=random.choice([True, False]))

    print(f"Created {len(channels)} channels.")

    # 3. Create Opportunities
    opp_titles = [
        "Cloud Migration for Retailer", "Payment Gateway Integration", "B2B Sales CRM Implementation",
        "Series A Fundraise Help", "Senior DevOps Hiring", "ERP Customization for Logistics",
        "Social Media Campaign for D2C", "Security Audit for Fintech", "HRMS for Growing Startup",
        "Mobile App Development Lead", "AI Chatbot for Customer Support", "Legal Tech Partnership",
        "Warehouse Management System", "Influencer Marketing Strategy", "Content Strategy for Tech Blog",
        "Data Engineering Pipeline", "Blockchain Smart Contract Audit", "SEO Audit for E-comm",
        "Corporate Training for AI", "Digital Transformation Consulting"
    ]

    # Public Opportunities
    for i in range(18):
        submitter = random.choice([m for m in members if m.tier in ["Admin", "Manager"]])
        status = random.choice(["pending", "validated", "in_progress", "closed"])
        
        o = Opportunity.objects.create(
            title=f"{random.choice(opp_titles)} #{random.randint(100, 999)}",
            description=f"Strategic project focused on {random.choice(expertise_list)}. Budget approved for Q{random.randint(1,4)} 2026. High impact potential.",
            category=random.choice(expertise_list),
            value=random.randint(5000, 200000),
            type=random.choice(["Referral", "Introduction", "Execution Ready"]),
            confidence=random.choice(["Low", "Medium", "High"]),
            timeline="30-90 days",
            decision_access=random.choice(["Direct", "Indirect", "Cold"]),
            budget_clarity=random.choice(["Clear", "Approximate", "Unclear"]),
            status=status,
            submitter=submitter,
            tags=random.sample(expertise_list, 2)
        )
        # Create some claims for non-pending opportunities
        if status != "pending":
            num_claims = random.randint(1, 4)
            claimants = random.sample([m for m in members if m != submitter], num_claims)
            for m in claimants:
                c_status = "accepted" if status in ["in_progress", "closed"] and m == claimants[0] else random.choice(["pending", "rejected"])
                claim = OpportunityClaim.objects.create(
                    opportunity=o,
                    claimant=m,
                    pitch=f"I have deep expertise in {o.category} and can deliver this within {o.timeline}.",
                    status=c_status
                )
                if c_status == "accepted":
                    o.executor = m
                    o.save()
                
                # Add a comment
                Comment.objects.create(
                    opportunity=o,
                    author=m,
                    text=f"Looking forward to discussing the {o.type} details.",
                )

    # Channel Opportunities
    for c in channels:
        channel_members = [cm.member for cm in ChannelMembership.objects.filter(channel=c)]
        for i in range(12):
            submitter = random.choice([m for m in channel_members if m.tier in ["Admin", "Manager"]] or [c.admin])
            status = random.choice(["pending", "validated", "in_progress", "closed"])
            
            o = Opportunity.objects.create(
                title=f"[{c.title[:3].upper()}] {random.choice(opp_titles)}",
                description=f"Internal channel lead for {c.title}. Requires expertise in {random.choice(expertise_list)}.",
                category=random.choice(expertise_list),
                value=random.randint(10000, 500000),
                type=random.choice(["Referral", "Introduction", "Execution Ready"]),
                confidence=random.choice(["Medium", "High"]),
                timeline="15-45 days",
                decision_access="Direct",
                budget_clarity="Clear",
                status=status,
                submitter=submitter,
                channel=c,
                tags=[random.choice(expertise_list)]
            )

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
