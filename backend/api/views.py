from django.shortcuts import render
from users.models import MyUser
from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from users.permissions import IsOwnerOrAdmin
from meals.models import Meal
from rest_auth.views import LoginView


class MealSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Meal
        fields = ('id', 'user', 'when', 'what', 'calorie', 'comment')


class MealViewSet(viewsets.ModelViewSet):
    queryset = Meal.objects.none()
    serializer_class = MealSerializer
    permission_classes = (IsOwnerOrAdmin,)

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.profile.role == 'A':
            return Meal.objects.all()
        return Meal.objects.filter(Q(user=user) | Q(user__profile__manager=user))


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('id', 'email', 'display_name', 'is_admin', 'cal_per_day', 'gender', 'age', 'url')


class UserViewSet(viewsets.ModelViewSet):
    queryset = MyUser.objects.none()
    serializer_class = UserSerializer
    permission_classes = (IsOwnerOrAdmin,)

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return MyUser.objects.all()
        return MyUser.objects.filter(id=user.id)


class MyLoginSerializer(serializers.ModelSerializer):

    class Meta:
        model = get_user_model()
        fields = ('id', 'email', 'displayname', 'is_admin')


class MyLoginView(LoginView):

    def get_response(self):
        data = MyLoginSerializer(self.user).data
        return Response({'data': data}, status=status.HTTP_200_OK)
