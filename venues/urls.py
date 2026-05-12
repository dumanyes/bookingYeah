from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'', views.VenueViewSet, basename='venue')

review_router = DefaultRouter()
review_router.register(r'reviews', views.VenueReviewViewSet, basename='venue-review')

urlpatterns = [
    path('<int:venue_pk>/', include(review_router.urls)),
    path('', include(router.urls)),
]
