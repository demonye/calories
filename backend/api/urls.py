from django.conf.urls import patterns, include, url
from rest_framework_extensions.routers import ExtendedSimpleRouter
from api.views import MealViewSet, UserViewSet

router = ExtendedSimpleRouter(trailing_slash=False)
(
    router.register(r'users', UserViewSet)
          .register(r'meals',
                    MealViewSet,
                    base_name='users-meal',
                    parents_query_lookups=['object_id'])
)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^auth/registration/', include('rest_auth.registration.urls')),
    url(r'^auth/', include('rest_auth.urls')),
)
