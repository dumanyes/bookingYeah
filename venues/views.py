from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Venue, VenuePhoto, VenueReview
from .serializers import (
    VenueListSerializer, VenueDetailSerializer,
    VenueCreateUpdateSerializer, VenueReviewSerializer, VenuePhotoSerializer,
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.filter(is_active=True).prefetch_related('photos')
    permission_classes = (IsOwnerOrReadOnly,)
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('sport_type', 'city', 'is_indoor', 'has_parking', 'has_changing_room', 'has_shower')
    search_fields = ('name', 'address', 'city')
    ordering_fields = ('price_per_hour', 'rating', 'created_at')

    def get_serializer_class(self):
        if self.action == 'list':
            return VenueListSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return VenueCreateUpdateSerializer
        return VenueDetailSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def get_queryset(self):
        qs = Venue.objects.prefetch_related('photos')
        if self.action in ('update', 'partial_update', 'destroy'):
            return qs
        return qs.filter(is_active=True)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser], permission_classes=[permissions.IsAuthenticated])
    def photos(self, request, pk=None):
        venue = self.get_object()
        if venue.owner != request.user:
            return Response({'detail': 'Нет доступа.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = VenuePhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(venue=venue)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VenueReviewViewSet(viewsets.ModelViewSet):
    serializer_class = VenueReviewSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        return VenueReview.objects.filter(venue_id=self.kwargs['venue_pk']).select_related('author')

    def perform_create(self, serializer):
        venue_id = self.kwargs['venue_pk']
        serializer.save(author=self.request.user, venue_id=venue_id)
