import logging

from django.contrib.auth.hashers import check_password
from django.db import DatabaseError, IntegrityError
from rest_framework import filters, status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

from .models import Comment, Member, Opportunity, Channel, ChannelMembership, OpportunityClaim, Notification
from .serializers import (
    CommentSerializer,
    LoginSerializer,
    MemberPublicSerializer,
    MemberRegisterSerializer,
    MemberSerializer,
    OpportunitySerializer,
    ChannelSerializer,
    ChannelMembershipSerializer,
    OpportunityClaimSerializer,
    NotificationSerializer,
)

logger = logging.getLogger(__name__)


class RegisterAPIView(APIView):
    """Public registration — creates Member with tier Probation."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MemberRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            member = serializer.save()
        except IntegrityError:
            return Response(
                {
                    'email': [
                        'An account with this email or handle already exists. Try another email or sign in.',
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        except DatabaseError as exc:
            logger.exception('Registration failed at database layer')
            return Response(
                {
                    'detail': (
                        f'{exc} '
                        '— usually missing migrations or wrong DB. '
                        'Run: python manage.py migrate '
                        '(Docker: docker compose exec backend python manage.py migrate).'
                    ),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as exc:
            logger.exception('Registration failed unexpectedly')
            return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            payload = MemberPublicSerializer(member).data
        except Exception as exc:
            logger.exception('Registration response serialization failed')
            return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(payload, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    """Login with email + password (members who registered with a password)."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']

        member = Member.objects.filter(email__iexact=email).first()
        if member is None or not member.password_hash:
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not check_password(password, member.password_hash):
            return Response(
                {'detail': 'Invalid email or password.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(MemberPublicSerializer(member).data, status=status.HTTP_200_OK)


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'handle', 'email']
    ordering_fields = ['score', 'deals_closed', 'joined']
    http_method_names = ['get', 'patch', 'head', 'options']  # No POST/DELETE on members


class memberPagination(PageNumberPagination):
    page_size = 100

class OpportunityPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 50

class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all().order_by('-created_at')
    serializer_class = OpportunitySerializer
    pagination_class = OpportunityPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    filterset_fields = ['category', 'status', 'type', 'confidence', 'channel']
    ordering_fields = ['value', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        # Status filter
        status = params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        # Category filter
        category = params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Type filter
        type_ = params.get('type')
        if type_:
            queryset = queryset.filter(type=type_)

        # Confidence filter
        confidence = params.get('confidence')
        if confidence:
            queryset = queryset.filter(confidence=confidence)

        # Channel filter (strict)
        channel_id = params.get('channel')
        if channel_id:
            queryset = queryset.filter(channel_id=channel_id)

        # Public-only filter
        public_only = params.get('public_only')
        if public_only == 'true':
            queryset = queryset.filter(channel__isnull=True)

        # Submitter filter
        submitter_id = params.get('submitter')
        if submitter_id:
            queryset = queryset.filter(submitter_id=submitter_id)

        # Claimant filter (Relational)
        claimant_id = params.get('claimant')
        if claimant_id:
            queryset = queryset.filter(opportunity_claims__claimant_id=claimant_id).distinct()

        return queryset

    def create(self, request, *args, **kwargs):
        # Enforce Role-Based Submission Gate
        submitter_id = request.data.get('submitter')
        if not submitter_id:
            return Response({'detail': 'Submitter ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            member = Member.objects.get(id=submitter_id)
        except Member.DoesNotExist:
            return Response({'detail': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        if member.tier == 'Member':
            return Response(
                {'detail': 'Your account is currently a Member. Only Managers and Admins earn submission privileges.'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        channel = serializer.validated_data.get('channel')
        if not channel:
            serializer.save(status='validated')
        else:
            serializer.save()

    @action(detail=True, methods=['post'], url_path='close')
    def close_opportunity(self, request, pk=None):
        opp = self.get_object()
        
        if opp.status != 'in_progress':
            return Response({'error': 'Only in-progress opportunities can be closed.'}, status=status.HTTP_400_BAD_REQUEST)
        
        submitter = opp.submitter
        executor = opp.executor
        
        if submitter:
            submitter.score += 50
            submitter.save()
            Notification.objects.create(
                member=submitter,
                title="Deal Closed!",
                message=f"Opportunity '{opp.title}' has been successfully closed. You earned 50 points!",
                type='deal_closed',
                opportunity=opp
            )
        if executor:
            executor.score += 50
            executor.deals_closed += 1
            executor.save()
            Notification.objects.create(
                member=executor,
                title="Deal Closed!",
                message=f"Opportunity '{opp.title}' has been successfully closed. You earned 50 points!",
                type='deal_closed',
                opportunity=opp
            )
            
        opp.status = 'closed'
        opp.save()
        
        return Response({'status': 'closed', 'message': 'Points distributed and notifications sent.'})


    @action(detail=True, methods=['post'], url_path='validate')
    def admin_validate(self, request, pk=None):
        opportunity = self.get_object()
        action_type = request.data.get('action') # 'approve' or 'reject'
        feedback = request.data.get('feedback', '')
        
        if action_type == 'approve':
            opportunity.status = 'validated'
            # Optional: handle fee/points logic
        elif action_type == 'reject':
            opportunity.status = 'rejected'
            
        opportunity.save()
        
        # In a real app we would log 'feedback' or send a notification to opportunity.submitter
        return Response({'status': opportunity.status, 'feedback': feedback})

class ChannelViewSet(viewsets.ModelViewSet):
    queryset = Channel.objects.all().order_by('-created_at')
    serializer_class = ChannelSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

class ChannelMembershipViewSet(viewsets.ModelViewSet):
    queryset = ChannelMembership.objects.all().order_by('-joined_at')
    serializer_class = ChannelMembershipSerializer
    filterset_fields = ['channel', 'member']

    def get_queryset(self):
        queryset = super().get_queryset()
        channel_id = self.request.query_params.get('channel')
        if channel_id:
            queryset = queryset.filter(channel_id=channel_id)
        member_id = self.request.query_params.get('member')
        if member_id:
            queryset = queryset.filter(member_id=member_id)
        return queryset

class OpportunityClaimViewSet(viewsets.ModelViewSet):
    queryset = OpportunityClaim.objects.all().order_by('-created_at')
    serializer_class = OpportunityClaimSerializer
    filterset_fields = ['opportunity', 'claimant', 'status']

    def perform_create(self, serializer):
        claim = serializer.save()
        # Notify submitter
        Notification.objects.create(
            member=claim.opportunity.submitter,
            title="New Claim Received",
            message=f"{claim.claimant.name} has pitched to claim your opportunity: {claim.opportunity.title}",
            type='claim_received',
            opportunity=claim.opportunity
        )

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_claim(self, request, pk=None):
        claim = self.get_object()
        opportunity = claim.opportunity
        
        claim.status = 'accepted'
        claim.save()
        
        OpportunityClaim.objects.filter(opportunity=opportunity).exclude(id=claim.id).update(status='rejected')
        
        opportunity.executor = claim.claimant
        opportunity.status = 'in_progress'
        opportunity.save()

        # Notify claimer
        Notification.objects.create(
            member=claim.claimant,
            title="Claim Accepted!",
            message=f"Your claim for '{opportunity.title}' has been accepted. You are now the executor.",
            type='claim_accepted',
            opportunity=opportunity
        )
        
        return Response({'status': 'accepted', 'executor': claim.claimant.id})

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def perform_create(self, serializer):
        print(f"Creating comment with data: {serializer.validated_data}")
        comment = serializer.save()
        # Notify submitter if someone else comments
        if comment.author != comment.opportunity.submitter:
            Notification.objects.create(
                member=comment.opportunity.submitter,
                title="New Comment",
                message=f"{comment.author.name} commented on your opportunity: {comment.opportunity.title}",
                type='comment_received',
                opportunity=comment.opportunity
            )

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    filterset_fields = ['member', 'is_read']

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        member_id = request.data.get('member_id')
        if not member_id:
            return Response({'detail': 'member_id required'}, status=status.HTTP_400_BAD_REQUEST)
        Notification.objects.filter(member_id=member_id, is_read=False).update(is_read=True)
        return Response({'status': 'ok'})
