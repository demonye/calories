import django_filters
from users.models import MyUser
from meals.models import Meal
from django.db.models import Q
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination      # , BasePagination
from users.permissions import IsOwnerOrAdminOrLowerLevel as IsPermitted
from api.serializers import MealSerializer, UserSerializer
from collections import OrderedDict


class Utils(object):
    date_format = '%Y-%m-%d'

    @classmethod
    def date_str(cls, dt):
        return timezone.datetime.strftime(dt, cls.date_format)

    @classmethod
    def str_date(cls, s):
        return timezone.datetime.strptime(s, cls.date_format)


class MealDatePagination(PageNumberPagination):
    page_size = 7
    page_query_param = 'to_date'
    page_size_query_param = 'days'

    def paginate_queryset(self, queryset, request, view=None):
        """
        Paginate a queryset if required, either returning a
        page object, or `None` if pagination is not configured for this view.
        """

        days = self.get_page_size(request)
        if not days:
            return None

        to_date = request.query_params.get(self.page_query_param)
        if not to_date:
            to_date = Utils.date_str(timezone.localtime(timezone.now()))
        from_date = Utils.date_str(Utils.str_date(to_date) - timezone.timedelta(days))
        self.prev_date = from_date

        # No need to filter to_date cos it's been done in MealFilter
        return list(queryset.filter(meal_date_str__gt=from_date))

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('prev_date', self.prev_date),
            ('results', data),
        ]))


class MealFilter(django_filters.FilterSet):
    from_date = django_filters.DateFilter(name="meal_date_str", lookup_type="gte")
    to_date = django_filters.DateFilter(name="meal_date_str", lookup_type="lte")
    from_time = django_filters.TimeFilter(name="meal_time_str", lookup_type="gte")
    to_time = django_filters.TimeFilter(name="meal_time_str", lookup_type="lte")

    class Meta:
        model = Meal
        fields = ["from_date", "to_date", "from_time", "to_time"]


class MealViewSet(viewsets.ModelViewSet):
    queryset = Meal.objects.none()
    serializer_class = MealSerializer
    permission_classes = (IsPermitted,)
    pagination_class = MealDatePagination
    filter_class = MealFilter

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Meal.objects.all()
        return Meal.objects.filter(Q(user_id=user.id) | \
            (Q(user__perm_level__gt=0) & Q(user__perm_level__lt=user.perm_level))
        )


class UserViewSet(viewsets.ModelViewSet):
    queryset = MyUser.objects.none()
    serializer_class = UserSerializer
    permission_classes = (IsPermitted,)

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return MyUser.objects.all()
        return MyUser.objects.filter(Q(id=user.id) | \
            (Q(perm_level__gt=0) & Q(perm_level__lt=user.perm_level))
        )
