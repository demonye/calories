from django.conf.urls import patterns, include, url
from rest_framework import routers
from api.views import MealViewSet, ProfileViewSet, UserViewSet

router = routers.DefaultRouter()
router.register(r'meals', MealViewSet)
router.register(r'users', UserViewSet)
router.register(r'profiles', ProfileViewSet)

urlpatterns = patterns('',
    url(r'', include(router.urls)),
)
