from django.shortcuts import render
from users.models import MyUser
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from users.permissions import IsOwnerOrAdminOrLowerLevel as IsPermitted
from meals.models import Meal
from rest_auth.views import LoginView
import time


class MealSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Meal
        fields = ('id', 'user', 'when', 'what', 'calorie', 'comment')


class MealViewSet(viewsets.ModelViewSet):
    queryset = Meal.objects.none()
    serializer_class = MealSerializer
    permission_classes = (IsPermitted,)

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.profile.role == 'A':
            return Meal.objects.all()
        return Meal.objects.filter(Q(user=user) | Q(user__profile__manager=user))


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = get_user_model()
        fields = (
            'id', 'email', 'display_name', 'is_admin', 'cal_per_day', 'gender', 'age',
            'perm_level', 'is_active', 'url'
        )
        extra_kwargs = {
            'is_deleted': {'write_only': True},
            'password': {'write_only': True},
        }

    def create(self, validate_data):
        password = validate_data.pop('password')
        user = MyUser.objects.create(**validate_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, user, validate_data):
        password = validate_data.pop('password')
        user.set_password(password)
        return super(UserSerializer, self).update(user, validate_data)


class UserViewSet(viewsets.ModelViewSet):
    queryset = MyUser.objects.none()
    serializer_class = UserSerializer
    permission_classes = (IsPermitted,)

    def get_queryset(self):
        user = self.request.user
        if self.request.user.is_admin:
            return MyUser.objects.filter(is_deleted=False)
        return MyUser.objects.filter(Q(id=user.id) | Q(perm_level__lt=user.perm_level))


class MyLoginSerializer(serializers.ModelSerializer):

    class Meta:
        model = get_user_model()
        fields = ('id', 'email', 'displayname', 'is_admin')


class MyLoginView(LoginView):

    def get_response(self):
        data = MyLoginSerializer(self.user).data
        headers = {
            'access-token': self.token.key,
            'uid': data['email'],
            'expiry': time.time() + 1209600,
        }
        return Response({'data': data}, status=status.HTTP_200_OK, headers=headers)


class ValidateTokenView(APIView):

    def get(self, request):
        email = request.META.get('HTTP_UID')
        token = request.META.get('HTTP_ACCESS_TOKEN')
        expiry = request.META.get('HTTP_EXPIRY')
        try:
            user = MyUser.objects.get(email=email)
            token = Token.objects.get(user=user)
            headers = {
                'access-token': token.key,
                'uid': email,
                'expiry': time.time() + 1209600,
            }
            data = MyLoginSerializer(user).data
            return Response({'data': data}, status=status.HTTP_200_OK, headers=headers)
        except:
            pass

        return Response({}, status.HTTP_401_UNAUTHORIZED)
