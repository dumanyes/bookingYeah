from django.db import models
from django.conf import settings


class Venue(models.Model):
    SPORT_CHOICES = [
        ('football', 'Футбол'),
        ('basketball', 'Баскетбол'),
        ('volleyball', 'Волейбол'),
        ('tennis', 'Теннис'),
        ('badminton', 'Бадминтон'),
        ('hockey', 'Хоккей'),
        ('multi', 'Мультиспорт'),
    ]

    SURFACE_CHOICES = [
        ('grass', 'Трава'),
        ('artificial_grass', 'Искусственная трава'),
        ('parquet', 'Паркет'),
        ('concrete', 'Бетон'),
        ('sand', 'Песок'),
        ('ice', 'Лёд'),
    ]

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='venues')
    name = models.CharField(max_length=200)
    sport_type = models.CharField(max_length=20, choices=SPORT_CHOICES)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=300)
    city = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    surface = models.CharField(max_length=20, choices=SURFACE_CHOICES, blank=True)
    capacity = models.PositiveIntegerField(default=2)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)
    is_indoor = models.BooleanField(default=False)
    has_changing_room = models.BooleanField(default=False)
    has_parking = models.BooleanField(default=False)
    has_shower = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    total_reviews = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.get_sport_type_display()})'


class VenuePhoto(models.Model):
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='venues/')
    is_main = models.BooleanField(default=False)

    def __str__(self):
        return f'Фото {self.venue.name}'


class VenueReview(models.Model):
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='reviews')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('venue', 'author')

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        reviews = VenueReview.objects.filter(venue=self.venue)
        avg = reviews.aggregate(models.Avg('rating'))['rating__avg'] or 0
        self.venue.rating = round(avg, 1)
        self.venue.total_reviews = reviews.count()
        self.venue.save(update_fields=['rating', 'total_reviews'])

    def __str__(self):
        return f'{self.author.username} → {self.venue.name}: {self.rating}★'
