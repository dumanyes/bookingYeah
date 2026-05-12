from rest_framework import serializers
from .models import Venue, VenuePhoto, VenueReview
from users.serializers import UserPublicSerializer


class VenuePhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenuePhoto
        fields = ('id', 'image', 'is_main')


class VenueReviewSerializer(serializers.ModelSerializer):
    author = UserPublicSerializer(read_only=True)

    class Meta:
        model = VenueReview
        fields = ('id', 'author', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'author', 'created_at')


class VenueListSerializer(serializers.ModelSerializer):
    main_photo = serializers.SerializerMethodField()
    sport_type_display = serializers.CharField(source='get_sport_type_display', read_only=True)

    class Meta:
        model = Venue
        fields = (
            'id', 'name', 'sport_type', 'sport_type_display', 'city',
            'address', 'price_per_hour', 'rating', 'total_reviews',
            'is_indoor', 'latitude', 'longitude', 'main_photo',
        )

    def get_main_photo(self, obj):
        photo = obj.photos.filter(is_main=True).first() or obj.photos.first()
        if photo:
            request = self.context.get('request')
            return request.build_absolute_uri(photo.image.url) if request else photo.image.url
        return None


class VenueDetailSerializer(serializers.ModelSerializer):
    photos = VenuePhotoSerializer(many=True, read_only=True)
    reviews = VenueReviewSerializer(many=True, read_only=True)
    owner = UserPublicSerializer(read_only=True)
    sport_type_display = serializers.CharField(source='get_sport_type_display', read_only=True)
    surface_display = serializers.CharField(source='get_surface_display', read_only=True)

    class Meta:
        model = Venue
        fields = '__all__'
        read_only_fields = ('owner', 'rating', 'total_reviews', 'created_at')


class VenueCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        exclude = ('owner', 'rating', 'total_reviews', 'created_at')
