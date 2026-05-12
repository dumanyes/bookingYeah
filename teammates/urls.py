from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.TeammatePostViewSet, basename='teammate-post')
router.register(r'requests', views.TeammateRequestViewSet, basename='teammate-request')

urlpatterns = router.urls
