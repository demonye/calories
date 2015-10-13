from django.conf.urls import patterns, include, url
from rest_framework import routers
from api.views import MealViewSet, UserViewSet, MyLoginView

router = routers.DefaultRouter()
router.register(r'meals', MealViewSet)
router.register(r'users', UserViewSet)
# router.register(r'profiles', ProfileViewSet)

urlpatterns = patterns('',
    url(r'', include(router.urls)),
    url(r'^auth/login/$', MyLoginView.as_view(), name='rest_login'),
    url(r'^auth/registration/', include('rest_auth.registration.urls')),
    url(r'^auth/', include('rest_auth.urls')),
)
