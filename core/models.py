from django.db import models

class Member(models.Model):
    TIER_CHOICES = [
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
        ('Member', 'Member'),
    ]
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    company = models.CharField(max_length=255, blank=True, default='')
    profile_link = models.URLField(max_length=2048, blank=True, default='')
    password_hash = models.CharField(max_length=512, blank=True, default='')
    handle = models.CharField(max_length=255, unique=True)
    avatar = models.CharField(max_length=10)
    expertise = models.JSONField(default=list)
    score = models.IntegerField(default=0)
    deals_closed = models.IntegerField(default=0)
    success_rate = models.FloatField(default=0.0)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='Member')
    joined = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

class Opportunity(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Validation'),
        ('validated', 'Validated'),
        ('in_progress', 'In Progress'),
        ('closed', 'Deal Closed'),
        ('archived', 'Archived'),
        ('rejected', 'Rejected'),
        ('dropped', 'Dropped'),
    ]
    CATEGORY_CHOICES = [
        ('SaaS', 'SaaS'),
        ('Fintech', 'Fintech'),
        ('D2C', 'D2C'),
        ('Enterprise', 'Enterprise'),
        ('Marketing', 'Marketing'),
        ('Consulting', 'Consulting'),
        ('IT', 'IT'),
        ('Manufacturing', 'Manufacturing'),
    ]
    TYPE_CHOICES = [
        ('Referral', 'Referral'),
        ('Introduction', 'Introduction'),
        ('Execution Ready', 'Execution Ready'),
    ]
    CONFIDENCE_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField()
    value = models.IntegerField()
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    confidence = models.CharField(max_length=20, choices=CONFIDENCE_CHOICES)
    timeline = models.CharField(max_length=100, choices=[('Yes', 'Yes'), ('No', 'No')], default='No')
    decision_access = models.CharField(max_length=100, choices=[('Yes', 'Yes'), ('No', 'No')], default='No')
    budget_clarity = models.CharField(max_length=100, choices=[('Yes', 'Yes'), ('No', 'No')], default='No')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    channel = models.ForeignKey('Channel', on_delete=models.SET_NULL, null=True, blank=True, related_name='opportunities')
    submitter = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='submitted_opportunities')
    executor = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, related_name='executed_opportunities')
    claims = models.JSONField(default=list, null=True, blank=True)
    tags = models.JSONField(default=list, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(Member, on_delete=models.CASCADE)
    text = models.TextField()
    source_url = models.URLField(max_length=2048, blank=True, null=True)
    at = models.DateTimeField(auto_now_add=True)

class Channel(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    entry_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    admin = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='managed_channels')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ChannelMembership(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='members')
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='channel_memberships')
    has_paid = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('channel', 'member')

    def __str__(self):
        return f"{self.member.name} in {self.channel.title}"

class OpportunityClaim(models.Model):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='opportunity_claims')
    claimant = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='opportunity_claims')
    pitch = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')],
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('opportunity', 'claimant')

class Notification(models.Model):
    TYPES = [
        ('claim_received', 'Claim Received'),
        ('claim_accepted', 'Claim Accepted'),
        ('deal_closed', 'Deal Closed'),
        ('comment_received', 'Comment Received'),
    ]
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=50, choices=TYPES)
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.member.name}: {self.title}"
