from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TeammatePost, TeammateRequest
from .serializers import TeammatePostSerializer, TeammatePostCreateSerializer, TeammateRequestSerializer


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class TeammatePostViewSet(viewsets.ModelViewSet):
    queryset = TeammatePost.objects.filter(is_active=True).select_related('author', 'venue')
    permission_classes = (IsAuthorOrReadOnly,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('sport', 'city', 'required_level')
    search_fields = ('title', 'description', 'city')
    ordering_fields = ('created_at', 'play_date')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return TeammatePostCreateSerializer
        return TeammatePostSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def apply(self, request, pk=None):
        post = self.get_object()
        if post.author == request.user:
            return Response({'detail': 'Нельзя откликнуться на собственный пост.'}, status=status.HTTP_400_BAD_REQUEST)
        if TeammateRequest.objects.filter(post=post, applicant=request.user).exists():
            return Response({'detail': 'Вы уже откликнулись.'}, status=status.HTTP_400_BAD_REQUEST)
        req = TeammateRequest.objects.create(
            post=post,
            applicant=request.user,
            message=request.data.get('message', ''),
        )
        return Response(TeammateRequestSerializer(req).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def requests(self, request, pk=None):
        post = self.get_object()
        if post.author != request.user:
            return Response({'detail': 'Нет доступа.'}, status=status.HTTP_403_FORBIDDEN)
        reqs = post.requests.select_related('applicant').all()
        return Response(TeammateRequestSerializer(reqs, many=True).data)


class TeammateRequestViewSet(viewsets.GenericViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = TeammateRequestSerializer

    def get_queryset(self):
        return TeammateRequest.objects.filter(post__author=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        req = self.get_object()
        req.status = 'accepted'
        req.save(update_fields=['status'])
        return Response(TeammateRequestSerializer(req).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        req = self.get_object()
        req.status = 'rejected'
        req.save(update_fields=['status'])
        return Response(TeammateRequestSerializer(req).data)
