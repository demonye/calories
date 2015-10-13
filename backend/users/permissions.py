# from django.contrib.auth.models import User
from users.models import MyUser
from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = obj if isinstance(obj, MyUser) else obj.user
        return request.user.is_admin or user == request.user
