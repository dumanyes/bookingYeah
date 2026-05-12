from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer, BookingAvailabilitySerializer


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related('venue')

    def perform_create(self, serializer):
        booking = serializer.save(user=self.request.user)
        user = self.request.user
        user.total_bookings += 1
        user.save(update_fields=['total_bookings'])

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status not in ('pending', 'confirmed'):
            return Response({'detail': 'Нельзя отменить бронь в текущем статусе.'}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data)

    @action(detail=False, methods=['get'], url_path='availability/(?P<venue_pk>[^/.]+)')
    def availability(self, request, venue_pk=None):
        date = request.query_params.get('date')
        if not date:
            return Response({'detail': 'Укажите дату.'}, status=status.HTTP_400_BAD_REQUEST)
        bookings = Booking.objects.filter(
            venue_id=venue_pk,
            date=date,
            status__in=['pending', 'confirmed'],
        ).values('start_time', 'end_time')
        return Response({
            'date': date,
            'booked_slots': list(bookings),
        })
