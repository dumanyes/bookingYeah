from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'venue', 'date', 'start_time', 'end_time', 'status', 'total_price')
    list_filter = ('status', 'date')
    search_fields = ('user__username', 'venue__name')
    date_hierarchy = 'date'
