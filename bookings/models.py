from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидание'),
        ('confirmed', 'Подтверждено'),
        ('cancelled', 'Отменено'),
        ('completed', 'Завершено'),
    ]

    venue = models.ForeignKey('venues.Venue', on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    players_count = models.PositiveSmallIntegerField(default=1)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-start_time']

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError('Время начала должно быть раньше времени окончания.')
        overlapping = Booking.objects.filter(
            venue=self.venue,
            date=self.date,
            status__in=['pending', 'confirmed'],
        ).exclude(pk=self.pk)
        for b in overlapping:
            if self.start_time < b.end_time and self.end_time > b.start_time:
                raise ValidationError('Это время уже занято.')

    def save(self, *args, **kwargs):
        from datetime import datetime
        start = datetime.combine(self.date, self.start_time)
        end = datetime.combine(self.date, self.end_time)
        hours = (end - start).seconds / 3600
        self.total_price = self.venue.price_per_hour * hours
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.user.username} → {self.venue.name} {self.date} {self.start_time}-{self.end_time}'
