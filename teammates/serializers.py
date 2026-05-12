from rest_framework import serializers
from .models import TeammatePost, TeammateRequest
from users.serializers import UserPublicSerializer
from venues.serializers import VenueListSerializer


class TeammateRequestSerializer(serializers.ModelSerializer):
    applicant = UserPublicSerializer(read_only=True)

    class Meta:
        model = TeammateRequest
        fields = ('id', 'applicant', 'message', 'status', 'created_at')
        read_only_fields = ('id', 'applicant', 'status', 'created_at')


class TeammatePostSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)
    venue_detail = VenueListSerializer(source='venue', read_only=True)
    requests_count = serializers.SerializerMethodField()
    sport_display = serializers.CharField(source='get_sport_display', read_only=True)
    level_display = serializers.CharField(source='get_required_level_display', read_only=True)

    class Meta:
        model = TeammatePost
        fields = (
            'id', 'author', 'sport', 'sport_display', 'title', 'description',
            'city', 'required_level', 'level_display', 'players_needed',
            'play_date', 'play_time', 'venue', 'venue_detail',
            'is_active', 'requests_count', 'created_at',
        )
        read_only_fields = ('id', 'author', 'created_at')

    def get_requests_count(self, obj):
        return obj.requests.filter(status='pending').count()


class TeammatePostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeammatePost
        exclude = ('author', 'created_at')
