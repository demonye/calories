from django.contrib.auth.models import User
from rest_framework import permissions


class IsOwnerOrManagerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user = obj if isinstance(obj, User) else obj.user
        profile = user.profile
        return request.user.is_superuser or \
            request.user.profile.role == 'A' or \
            profile.manager == request.user or \
            user == request.user
