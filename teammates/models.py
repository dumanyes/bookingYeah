from django.db import models
from django.conf import settings


class TeammatePost(models.Model):
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
        ('any', 'Любой'),
        ('beginner', 'Новичок'),
        ('amateur', 'Любитель'),
        ('semi_pro', 'Полупрофессионал'),
        ('pro', 'Профессионал'),
    ]

    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teammate_posts')
    sport = models.CharField(max_length=20, choices=SPORT_CHOICES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    city = models.CharField(max_length=100)
    required_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='any')
    players_needed = models.PositiveSmallIntegerField(default=1)
    play_date = models.DateField(null=True, blank=True)
    play_time = models.TimeField(null=True, blank=True)
    venue = models.ForeignKey('venues.Venue', on_delete=models.SET_NULL, null=True, blank=True, related_name='teammate_posts')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.author.username}: {self.title}'


class TeammateRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидание'),
        ('accepted', 'Принято'),
        ('rejected', 'Отклонено'),
    ]

    post = models.ForeignKey(TeammatePost, on_delete=models.CASCADE, related_name='requests')
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teammate_requests')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'applicant')

    def __str__(self):
        return f'{self.applicant.username} → {self.post.title}'
