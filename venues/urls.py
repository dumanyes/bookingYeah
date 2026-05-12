from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views

router = DefaultRouter()
router.register(r'', views.VenueViewSet, basename='venue')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:venue_pk>/reviews/', include([
        path('', views.VenueReviewViewSet.as_view({'get': 'list', 'post': 'create'}), name='venue-reviews'),
        path('<int:pk>/', views.VenueReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='venue-review-detail'),
    ])),
]
