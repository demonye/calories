from users.models import MyUser
from meals.models import Meal
from django.db.models import Q
from rest_framework import viewsets
from users.permissions import IsOwnerOrAdminOrLowerLevel as IsPermitted
from api.serializers import MealSerializer, UserSerializer



class MealViewSet(viewsets.ModelViewSet):
    queryset = Meal.objects.none()
    serializer_class = MealSerializer
    permission_classes = (IsPermitted,)

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
