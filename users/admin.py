from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'city', 'favorite_sport', 'level', 'rating', 'is_looking_for_team')
    list_filter = ('favorite_sport', 'level', 'is_looking_for_team', 'city')
    fieldsets = UserAdmin.fieldsets + (
        ('Профиль', {'fields': ('phone', 'avatar', 'bio', 'city', 'favorite_sport', 'level', 'rating', 'total_bookings', 'is_looking_for_team')}),
    )
