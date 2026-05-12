from django.contrib import admin
from .models import Venue, VenuePhoto, VenueReview


class VenuePhotoInline(admin.TabularInline):
    model = VenuePhoto
    extra = 1


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ('name', 'sport_type', 'city', 'price_per_hour', 'rating', 'is_active')
    list_filter = ('sport_type', 'city', 'is_indoor', 'is_active')
    search_fields = ('name', 'address', 'city')
    inlines = (VenuePhotoInline,)


@admin.register(VenueReview)
class VenueReviewAdmin(admin.ModelAdmin):
    list_display = ('venue', 'author', 'rating', 'created_at')
