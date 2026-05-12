from django.contrib import admin
from .models import TeammatePost, TeammateRequest


@admin.register(TeammatePost)
class TeammatePostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'sport', 'city', 'players_needed', 'is_active', 'created_at')
    list_filter = ('sport', 'city', 'required_level', 'is_active')
    search_fields = ('title', 'author__username', 'city')


@admin.register(TeammateRequest)
class TeammateRequestAdmin(admin.ModelAdmin):
    list_display = ('applicant', 'post', 'status', 'created_at')
    list_filter = ('status',)
