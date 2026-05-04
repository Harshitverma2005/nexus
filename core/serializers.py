import re

from django.contrib.auth.hashers import make_password
from rest_framework import serializers

from .models import Member, Opportunity, Comment, Channel, ChannelMembership, OpportunityClaim, Notification


class MemberPublicSerializer(serializers.ModelSerializer):
    """Safe member representation (no password hash)."""

    class Meta:
        model = Member
        fields = [
            'id',
            'name',
            'email',
            'company',
            'profile_link',
            'handle',
            'avatar',
            'expertise',
            'score',
            'deals_closed',
            'success_rate',
            'tier',
            'joined',
        ]


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = [
            'id',
            'name',
            'email',
            'company',
            'profile_link',
            'handle',
            'avatar',
            'expertise',
            'score',
            'deals_closed',
            'success_rate',
            'tier',
            'joined',
        ]


class MemberRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = Member
        fields = [
            'name',
            'email',
            'company',
            'profile_link',
            'expertise',
            'password',
            'password_confirm',
        ]

    def validate_email(self, value):
        if Member.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value.lower()

    def validate_profile_link(self, value):
        if value in (None, ''):
            return ''
        return str(value).strip()

    def validate_expertise(self, value):
        if not value or not isinstance(value, list):
            raise serializers.ValidationError('Select at least one expertise tag.')
        cleaned = [str(x).strip() for x in value if str(x).strip()]
        if len(cleaned) < 1:
            raise serializers.ValidationError('Select at least one expertise tag.')
        return cleaned

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def _unique_handle(self, base: str) -> str:
        handle = base[:240]
        if not handle.startswith('@'):
            handle = f'@{handle}'
        candidate = handle
        n = 1
        while Member.objects.filter(handle=candidate).exists():
            suffix = f'_{n}'
            candidate = f'{handle[: 240 - len(suffix)]}{suffix}'
            n += 1
        return candidate

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        name = validated_data['name'].strip()
        email = validated_data['email']

        local = email.split('@')[0]
        slug = re.sub(r'[^a-zA-Z0-9_]', '', local) or 'member'
        handle = self._unique_handle(slug)

        initials = ''.join(part[0] for part in name.split() if part)[:2].upper() or 'NX'

        profile_link = (validated_data.get('profile_link') or '').strip()
        if profile_link == '':
            validated_data['profile_link'] = ''

        member = Member.objects.create(
            name=name,
            email=email,
            company=validated_data.get('company', '').strip(),
            profile_link=validated_data.get('profile_link', ''),
            password_hash=make_password(password),
            handle=handle,
            avatar=initials,
            expertise=validated_data['expertise'],
            score=0,
            deals_closed=0,
            success_rate=0.0,
            tier='Member',
        )
        return member


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})


class CommentSerializer(serializers.ModelSerializer):
    opportunity = serializers.PrimaryKeyRelatedField(queryset=Opportunity.objects.all())
    author = serializers.PrimaryKeyRelatedField(queryset=Member.objects.all())
    author_name = serializers.ReadOnlyField(source='author.name')
    created_at = serializers.DateTimeField(source='at', read_only=True)
    author_details = serializers.SerializerMethodField()

    def get_author_details(self, obj):
        return {'name': obj.author.name, 'avatar': obj.author.avatar, 'tier': obj.author.tier}

    class Meta:
        model = Comment
        fields = ['id', 'opportunity', 'author', 'author_name', 'author_details', 'text', 'source_url', 'at', 'created_at']


class ChannelSerializer(serializers.ModelSerializer):
    admin_details = MemberPublicSerializer(source='admin', read_only=True)

    class Meta:
        model = Channel
        fields = '__all__'


class ChannelMembershipSerializer(serializers.ModelSerializer):
    member_details = MemberPublicSerializer(source='member', read_only=True)

    class Meta:
        model = ChannelMembership
        fields = '__all__'


class OpportunityClaimSerializer(serializers.ModelSerializer):
    claimant_details = MemberPublicSerializer(source='claimant', read_only=True)

    class Meta:
        model = OpportunityClaim
        fields = '__all__'


class OpportunitySerializer(serializers.ModelSerializer):
    submitter_details = MemberPublicSerializer(source='submitter', read_only=True)
    executor_details = MemberPublicSerializer(source='executor', read_only=True)
    channel_details = ChannelSerializer(source='channel', read_only=True)
    comments_details = CommentSerializer(many=True, read_only=True, source='comments')
    opportunity_claims = OpportunityClaimSerializer(many=True, read_only=True)

    class Meta:
        model = Opportunity
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    opportunity_details = OpportunitySerializer(source='opportunity', read_only=True)

    class Meta:
        model = Notification
        fields = '__all__'

