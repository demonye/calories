from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from rest_framework import serializers, viewsets
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsOwnerOrManagerOrAdmin
from users.models import Profile
from meals.models import Meal


class MealSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Meal
        fields = ('id', 'user', 'when', 'what', 'calorie', 'comment')


class MealViewSet(viewsets.ModelViewSet):
    queryset = Meal.objects.none()
    serializer_class = MealSerializer
    permission_classes = (IsOwnerOrManagerOrAdmin,)

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.profile.role == 'A':
            return Meal.objects.all()
        return Meal.objects.filter(Q(user=user) | Q(user__profile__manager=user))


class ProfileSerializer(serializers.HyperlinkedModelSerializer):
    # manager = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Profile
        fields = ('id', 'manager', 'gender', 'age', 'cal_per_day', 'role')


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.none()
    serializer_class = ProfileSerializer
    permission_classes = (IsOwnerOrManagerOrAdmin,)

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.profile.role == 'A':
            return Profile.objects.all()
        return Profile.objects.filter(Q(user=user) | Q(manager=user))


class UserSerializer(serializers.HyperlinkedModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'username', 'is_superuser', 'email', 'profile', 'url')

    def create(self, validate_data):
        profile = validate_data.pop('profile')
        validate_data['is_staff'] = True
        user = User.objects.create(**validate_data)
        profile['user'] = user
        Profile.objects.create(**profile)
        return user

    def update(self, user, validate_data):
        profile = validate_data.pop('profile')
        try:
            p = Profile.objects.get(user=user)
            for k, v in profile.items():
                setattr(p, k, v)
            p.save()
        except ObjectDoesNotExist:
            if profile.get('manager') is None:
                profile.pop('manager')
                profile['manager_id'] = 1
            profile['user_id'] = user.id
            Profile.objects.create(**profile)

        return super(UserSerializer, self).update(user, validate_data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.none()
    serializer_class = UserSerializer
    permission_classes = (IsOwnerOrManagerOrAdmin,)

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.profile.role == 'A':
            return User.objects.all()
        return User.objects.filter(Q(id=user.id) | Q(manager__id=user.id))
