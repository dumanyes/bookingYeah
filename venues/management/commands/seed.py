import random
from datetime import date, timedelta, time
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from venues.models import Venue, VenueReview
from bookings.models import Booking
from teammates.models import TeammatePost

User = get_user_model()

USERS = [
    {'username': 'amir_kz', 'first_name': 'Амир', 'last_name': 'Сейткали', 'city': 'Алматы', 'favorite_sport': 'football', 'level': 'amateur', 'bio': 'Играю в футбол каждые выходные. Ищу сильных партнёров!', 'is_looking_for_team': True},
    {'username': 'dana_sport', 'first_name': 'Дана', 'last_name': 'Омарова', 'city': 'Алматы', 'favorite_sport': 'volleyball', 'level': 'semi_pro', 'bio': 'Волейболистка, кмс. Тренирую детей.', 'is_looking_for_team': False},
    {'username': 'nurik99', 'first_name': 'Нурлан', 'last_name': 'Ахметов', 'city': 'Астана', 'favorite_sport': 'basketball', 'level': 'amateur', 'bio': 'Баскетбол — моя жизнь. 3x3 и 5x5.', 'is_looking_for_team': True},
    {'username': 'zarina_play', 'first_name': 'Зарина', 'last_name': 'Касымова', 'city': 'Алматы', 'favorite_sport': 'tennis', 'level': 'beginner', 'bio': 'Начинающая теннисистка, ищу тренировочного партнёра.', 'is_looking_for_team': True},
    {'username': 'bekzod_ft', 'first_name': 'Бекзод', 'last_name': 'Юсупов', 'city': 'Алматы', 'favorite_sport': 'football', 'level': 'pro', 'bio': 'Бывший игрок Кайрата. Сейчас играю в любителях.', 'is_looking_for_team': False},
]

VENUES = [
    {
        'name': 'Арена Алматы — Поле №1',
        'sport_type': 'football',
        'description': 'Профессиональное футбольное мини-поле с искусственным покрытием FIFA Quality Pro. Освещение, раздевалки, трибуны.',
        'address': 'ул. Тимирязева, 42',
        'city': 'Алматы',
        'latitude': 43.2380, 'longitude': 76.9150,
        'surface': 'artificial_grass',
        'capacity': 14,
        'price_per_hour': 8000,
        'is_indoor': False,
        'has_changing_room': True,
        'has_parking': True,
        'has_shower': True,
    },
    {
        'name': 'СК Динамо — Баскетбол',
        'sport_type': 'basketball',
        'description': 'Профессиональный баскетбольный зал с паркетным покрытием. 2 полноразмерные площадки.',
        'address': 'пр. Достык, 117',
        'city': 'Алматы',
        'latitude': 43.2250, 'longitude': 76.9480,
        'surface': 'parquet',
        'capacity': 10,
        'price_per_hour': 5000,
        'is_indoor': True,
        'has_changing_room': True,
        'has_parking': True,
        'has_shower': True,
    },
    {
        'name': 'Волейбол Центр',
        'sport_type': 'volleyball',
        'description': 'Современный волейбольный зал. Сетки международного стандарта, деревянный пол.',
        'address': 'ул. Жибек Жолы, 88',
        'city': 'Алматы',
        'latitude': 43.2560, 'longitude': 76.9320,
        'surface': 'parquet',
        'capacity': 12,
        'price_per_hour': 4000,
        'is_indoor': True,
        'has_changing_room': True,
        'has_parking': False,
        'has_shower': True,
    },
    {
        'name': 'Tennis Club Premium',
        'sport_type': 'tennis',
        'description': 'Теннисный клуб с 4 открытыми кортами. Прокат ракеток, тренерские услуги.',
        'address': 'мкр. Горный Гигант, 15',
        'city': 'Алматы',
        'latitude': 43.1980, 'longitude': 76.8970,
        'surface': 'artificial_grass',
        'capacity': 4,
        'price_per_hour': 6000,
        'is_indoor': False,
        'has_changing_room': True,
        'has_parking': True,
        'has_shower': False,
    },
    {
        'name': 'Футбольный дворец Астана',
        'sport_type': 'football',
        'description': 'Крытый футбольный манеж в центре Астаны. Синтетическое поле 40x20м.',
        'address': 'ул. Сейфуллина, 32',
        'city': 'Астана',
        'latitude': 51.1800, 'longitude': 71.4460,
        'surface': 'artificial_grass',
        'capacity': 14,
        'price_per_hour': 9000,
        'is_indoor': True,
        'has_changing_room': True,
        'has_parking': True,
        'has_shower': True,
    },
    {
        'name': 'Бадминтон Холл',
        'sport_type': 'badminton',
        'description': '6 бадминтонных кортов, прокат ракеток и воланов. Работаем с 7 утра до 23 вечера.',
        'address': 'ул. Розыбакиева, 201',
        'city': 'Алматы',
        'latitude': 43.2100, 'longitude': 76.8800,
        'surface': 'parquet',
        'capacity': 4,
        'price_per_hour': 2500,
        'is_indoor': True,
        'has_changing_room': False,
        'has_parking': True,
        'has_shower': False,
    },
    {
        'name': 'Мини-футбол Медеу',
        'sport_type': 'football',
        'description': 'Открытое поле с видом на горы. Натуральный газон, профессиональная разметка.',
        'address': 'ул. Аль-Фараби, 93',
        'city': 'Алматы',
        'latitude': 43.2070, 'longitude': 76.9400,
        'surface': 'grass',
        'capacity': 14,
        'price_per_hour': 7000,
        'is_indoor': False,
        'has_changing_room': True,
        'has_parking': True,
        'has_shower': False,
    },
    {
        'name': 'Спортзал Nomad',
        'sport_type': 'multi',
        'description': 'Многофункциональный спортивный зал. Подходит для футбола, волейбола и баскетбола.',
        'address': 'пр. Республики, 14',
        'city': 'Астана',
        'latitude': 51.1850, 'longitude': 71.4050,
        'surface': 'parquet',
        'capacity': 20,
        'price_per_hour': 6500,
        'is_indoor': True,
        'has_changing_room': True,
        'has_parking': True,
        'has_shower': True,
    },
]

REVIEWS = [
    ('Отличная площадка! Покрытие в идеальном состоянии, раздевалки чистые.', 5),
    ('Хорошее поле, но парковки мало в часы пик.', 4),
    ('Цена справедливая, всё как на фото. Приедем ещё!', 5),
    ('Администратор вежливый, оборудование новое. Рекомендую.', 5),
    ('Немного шумно из-за соседнего зала, но в целом норм.', 3),
    ('Лучшее поле в городе! Всегда бронируем только здесь.', 5),
    ('Освещение можно было бы улучшить для вечерних игр.', 4),
    ('Душевые горячие, раздевалки просторные. Всё отлично.', 4),
]

TEAMMATE_POSTS = [
    {
        'sport': 'football',
        'title': 'Ищем двух игроков на воскресный матч',
        'description': 'Играем каждое воскресенье в 10:00 на Арене Алматы. Нужны 2 защитника уровня любитель и выше. Коллектив дружный, игра честная.',
        'city': 'Алматы',
        'required_level': 'amateur',
        'players_needed': 2,
    },
    {
        'sport': 'basketball',
        'title': '3x3 — ищем 1 игрока',
        'description': 'Регулярно играем 3x3 по субботам. Нужен один игрок с хорошим броском. Уровень — выше среднего.',
        'city': 'Алматы',
        'required_level': 'semi_pro',
        'players_needed': 1,
    },
    {
        'sport': 'volleyball',
        'title': 'Любительская команда ищет связующего',
        'description': 'Смешанная команда ищет связующего игрока. Тренировки по средам и пятницам. Атмосфера дружественная, результат важен.',
        'city': 'Алматы',
        'required_level': 'amateur',
        'players_needed': 1,
    },
    {
        'sport': 'tennis',
        'title': 'Партнёр для парного тенниса',
        'description': 'Ищу партнёра для регулярных игр в парном теннисе. Сам играю 2 года, уровень начинающий+. Гибкий график.',
        'city': 'Алматы',
        'required_level': 'beginner',
        'players_needed': 1,
    },
    {
        'sport': 'football',
        'title': 'Корпоративная команда — нужны игроки',
        'description': 'Корпоративная команда участвует в городском чемпионате. Ищем 3 сильных игрока. Форма и расходы оплачиваются.',
        'city': 'Астана',
        'required_level': 'semi_pro',
        'players_needed': 3,
    },
]


class Command(BaseCommand):
    help = 'Заполнить БД тестовыми данными'

    def handle(self, *args, **options):
        self.stdout.write('Создаю пользователей...')
        users = []
        for u in USERS:
            obj, created = User.objects.get_or_create(username=u['username'], defaults={**u, 'email': f"{u['username']}@test.kz", 'rating': round(random.uniform(3.5, 5.0), 1)})
            if created:
                obj.set_password('test1234')
                obj.save()
            users.append(obj)

        owner = users[0]

        self.stdout.write('Создаю площадки...')
        venues = []
        for i, v in enumerate(VENUES):
            venue_owner = users[i % len(users)]
            obj, created = Venue.objects.get_or_create(name=v['name'], defaults={**v, 'owner': venue_owner})
            venues.append(obj)

        self.stdout.write('Создаю отзывы...')
        for venue in venues:
            used_authors = set()
            for user in random.sample(users, min(3, len(users))):
                if user.pk in used_authors:
                    continue
                used_authors.add(user.pk)
                if not VenueReview.objects.filter(venue=venue, author=user).exists():
                    text, rating = random.choice(REVIEWS)
                    VenueReview.objects.create(venue=venue, author=user, rating=rating, comment=text)

        self.stdout.write('Создаю бронирования...')
        today = date.today()
        for user in users:
            for venue in random.sample(venues, 2):
                for day_offset in random.sample(range(-10, 14), 2):
                    booking_date = today + timedelta(days=day_offset)
                    start_h = random.choice([9, 11, 13, 15, 17, 19])
                    start = time(start_h, 0)
                    end = time(start_h + 1, 0)
                    status = 'completed' if day_offset < 0 else random.choice(['pending', 'confirmed'])
                    overlaps = Booking.objects.filter(
                        venue=venue, date=booking_date, status__in=['pending', 'confirmed'],
                        start_time__lt=end, end_time__gt=start,
                    ).exists()
                    if not overlaps:
                        Booking.objects.create(
                            venue=venue, user=user, date=booking_date,
                            start_time=start, end_time=end,
                            status=status,
                            total_price=venue.price_per_hour,
                            players_count=random.randint(2, 6),
                        )

        self.stdout.write('Создаю посты тиммейтов...')
        for i, post_data in enumerate(TEAMMATE_POSTS):
            author = users[i % len(users)]
            play_date = today + timedelta(days=random.randint(1, 14))
            play_hour = random.choice([10, 12, 14, 16, 18, 20])
            TeammatePost.objects.get_or_create(
                title=post_data['title'],
                defaults={**post_data, 'author': author, 'play_date': play_date, 'play_time': time(play_hour, 0)}
            )

        self.stdout.write(self.style.SUCCESS(
            f'\nГотово! Создано:\n'
            f'  {User.objects.count()} пользователей\n'
            f'  {Venue.objects.count()} площадок\n'
            f'  {VenueReview.objects.count()} отзывов\n'
            f'  {Booking.objects.count()} бронирований\n'
            f'  {TeammatePost.objects.count()} постов тиммейтов\n\n'
            f'Логин любого тестового юзера: amir_kz / test1234\n'
            f'Суперадмин: admin / admin123'
        ))
