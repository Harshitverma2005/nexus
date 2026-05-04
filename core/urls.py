from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginAPIView, RegisterAPIView, MemberViewSet, OpportunityViewSet, CommentViewSet, ChannelViewSet, ChannelMembershipViewSet, OpportunityClaimViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'members', MemberViewSet)
router.register(r'opportunities', OpportunityViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'channels', ChannelViewSet)
router.register(r'channel-memberships', ChannelMembershipViewSet)
router.register(r'claims', OpportunityClaimViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('auth/register/', RegisterAPIView.as_view(), name='auth-register'),
    path('auth/login/', LoginAPIView.as_view(), name='auth-login'),
    path('', include(router.urls)),
]
