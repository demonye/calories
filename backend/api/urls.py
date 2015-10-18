from django.conf.urls import patterns, include, url
from rest_framework import routers
from api.views import MealViewSet, UserViewSet

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'meals', MealViewSet)
router.register(r'users', UserViewSet)

urlpatterns = patterns('',
    url(r'', include(router.urls)),
    url(r'^auth/registration/', include('rest_auth.registration.urls')),
    url(r'^auth/', include('rest_auth.urls')),
)
