# from django.contrib.auth.models import User
from users.models import MyUser
from rest_framework import permissions


class IsOwnerOrAdminOrLowerLevel(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = obj if isinstance(obj, MyUser) else obj.user
        return request.user.id is not None and \
               request.user.is_active and \
               user.is_active and ( \
                 request.user.is_admin or \
                 user == request.user or \
                 0 < user.perm_level < request.user.perm_level
               )
