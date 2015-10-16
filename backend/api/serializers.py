from users.models import MyUser
from meals.models import Meal
from rest_framework import serializers


class MealSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Meal
        fields = ('id', 'user', 'when', 'what', 'calorie', 'comment')


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MyUser
        fields = (
            'id', 'email', 'display_name', 'password', 'is_admin', 'is_deleted',
            'cal_per_day', 'gender', 'age', 'perm_level', 'url'
        )
        extra_kwargs = {
            'is_deleted': {'write_only': True},
            'password': {'write_only': True},
        }

    def create(self, validate_data):
        password = validate_data.pop('password')
        user = model.objects.create(**validate_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, user, validate_data):
        password = validate_data.pop('password')
        user.set_password(password)
        return super(UserSerializer, self).update(user, validate_data)


class MyLoginSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyUser
        fields = ('id', 'email', 'displayname', 'is_admin')
