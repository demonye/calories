from django.shortcuts import render
from users.models import MyUser
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.contrib.auth import authenticate, login
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from users.permissions import IsOwnerOrAdminOrLowerLevel as IsPermitted
from meals.models import Meal
from rest_auth.views import LoginView, PasswordChangeView, PasswordResetView
import time
from api.serializers import MealSerializer, UserSerializer, MyLoginSerializer



class MealViewSet(viewsets.ModelViewSet):
    queryset = Meal.objects.none()
    serializer_class = MealSerializer
    permission_classes = (IsPermitted,)

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.profile.role == 'A':
            return Meal.objects.all()
        return Meal.objects.filter(Q(user=user) | Q(user__profile__manager=user))


class UserViewSet(viewsets.ModelViewSet):
    queryset = MyUser.objects.none()
    serializer_class = UserSerializer
    permission_classes = (IsPermitted,)

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return MyUser.objects.filter(is_deleted=False)
        return MyUser.objects.filter(Q(id=user.id) | Q(perm_level__lt=user.perm_level))


def auth_headers(token, email):
    return {
        'access-token': token,
        'uid': email,
        'expiry': time.time() + 1209600,
    }


class MyLoginView(LoginView):

    def get_response(self):
        data = MyLoginSerializer(self.user).data
        return Response(
            {'data': data}, status=status.HTTP_200_OK,
            headers=auth_headers(self.token.key, data['email'])
        )


class MyPasswordChangeView(PasswordChangeView):

    def put(self, request, *args, **kwargs):
        resp = super(MyPasswordChangeView, self).post(request, *args, **kwargs)
        user = request.user
        resp['access-token'] = user.auth_token.key
        resp['uid'] = user.email
        resp['expiry'] = time.time() + 1209600
        import ipdb; ipdb.set_trace()  # XXX BREAKPOINT
        return resp


class ValidateTokenView(APIView):

    def get(self, request):
        email = request.META.get('HTTP_UID')
        token = request.META.get('HTTP_ACCESS_TOKEN')
        expiry = request.META.get('HTTP_EXPIRY')

        try:
            user = MyUser.objects.get(email=email)
            auth_token = Token.objects.get(user_id=user.id)
            if token == auth_token.key:
                data = MyLoginSerializer(user).data
                return Response(
                    {'data': data}, status=status.HTTP_200_OK,
                    headers=auth_headers(token, user.email)
                )
        except:
            pass

        return Response({}, status.HTTP_401_UNAUTHORIZED)
