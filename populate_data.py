import os
import django
import random
from faker import Faker

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Member, Opportunity, Comment

fake = Faker()

def populate(n=1000):
    # Create some members first
    members = []
    print("Creating members...")
    for _ in range(50):
        name = fake.name()
        m = Member.objects.create(
            name=name,
            handle=f"@{fake.user_name()}_{random.randint(1, 1000)}",
            avatar="".join([n[0] for n in name.split() if n])[:2],
            expertise=[fake.job() for _ in range(random.randint(1, 3))],
            score=random.randint(100, 10000),
            deals_closed=random.randint(0, 50),
            success_rate=random.uniform(30, 95),
            tier=random.choice(['Probation', 'Active', 'Trusted'])
        )
        members.append(m)

    # Create opportunities
    print(f"Creating {n} opportunities...")
    categories = ['SaaS', 'Fintech', 'D2C', 'Enterprise', 'Marketing', 'Consulting']
    types = ['Lead', 'Partnership', 'Hiring', 'Investment']
    confidences = ['Low', 'Medium', 'High']
    statuses = ['pending', 'validated', 'in_progress', 'closed', 'archived', 'rejected', 'dropped']
    
    for i in range(n):
        submitter = random.choice(members)
        executor = random.choice(members) if random.random() > 0.5 else None
        
        opp = Opportunity.objects.create(
            title=fake.sentence(nb_words=6),
            category=random.choice(categories),
            description=fake.paragraph(nb_sentences=3),
            value=random.randint(1000, 500000),
            type=random.choice(types),
            confidence=random.choice(confidences),
            timeline=f"{random.randint(7, 90)} days",
            decision_access=random.choice(['Direct', 'Indirect', 'Cold']),
            budget_clarity=random.choice(['Clear', 'Approximate', 'Unclear']),
            status=random.choice(statuses),
            submitter=submitter,
            executor=executor,
            claims=[random.choice(members).id for _ in range(random.randint(0, 5))],
            tags=[fake.word() for _ in range(random.randint(2, 5))]
        )
        
        # Add some comments
        for _ in range(random.randint(0, 3)):
            Comment.objects.create(
                opportunity=opp,
                author=random.choice(members),
                text=fake.sentence(),
            )
        
        if (i + 1) % 100 == 0:
            print(f"Created {i + 1} opportunities...")

    print("Populating complete!")

if __name__ == '__main__':
    populate(1000)
