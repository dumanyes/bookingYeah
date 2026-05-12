from rest_framework import serializers
from .models import Booking
from venues.serializers import VenueListSerializer


class BookingSerializer(serializers.ModelSerializer):
    venue_detail = VenueListSerializer(source='venue', read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'venue', 'venue_detail', 'date', 'start_time', 'end_time',
            'status', 'total_price', 'players_count', 'comment', 'created_at',
        )
        read_only_fields = ('id', 'total_price', 'status', 'created_at')

    def validate(self, attrs):
        from datetime import datetime
        start = datetime.combine(attrs['date'], attrs['start_time'])
        end = datetime.combine(attrs['date'], attrs['end_time'])
        if start >= end:
            raise serializers.ValidationError('Время начала должно быть раньше окончания.')
        overlapping = Booking.objects.filter(
            venue=attrs['venue'],
            date=attrs['date'],
            status__in=['pending', 'confirmed'],
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        for b in overlapping:
            if attrs['start_time'] < b.end_time and attrs['end_time'] > b.start_time:
                raise serializers.ValidationError('Выбранное время уже занято.')
        return attrs


class BookingAvailabilitySerializer(serializers.Serializer):
    date = serializers.DateField()
    booked_slots = serializers.ListField(child=serializers.DictField())
