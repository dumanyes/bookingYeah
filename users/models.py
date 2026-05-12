from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    SPORT_CHOICES = [
        ('football', 'Футбол'),
        ('basketball', 'Баскетбол'),
        ('volleyball', 'Волейбол'),
        ('tennis', 'Теннис'),
        ('badminton', 'Бадминтон'),
        ('hockey', 'Хоккей'),
        ('other', 'Другое'),
    ]

    LEVEL_CHOICES = [
        ('beginner', 'Новичок'),
        ('amateur', 'Любитель'),
        ('semi_pro', 'Полупрофессионал'),
        ('pro', 'Профессионал'),
    ]

    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    city = models.CharField(max_length=100, blank=True)
    favorite_sport = models.CharField(max_length=20, choices=SPORT_CHOICES, blank=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='amateur')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    total_bookings = models.PositiveIntegerField(default=0)
    is_looking_for_team = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
