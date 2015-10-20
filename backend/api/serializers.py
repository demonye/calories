from users.models import MyUser
from meals.models import Meal
from rest_framework import serializers


class MealSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Meal
        fields = (
            'id', 'user', 'meal_date_str', 'meal_time_str',
            'what', 'calorie', 'comment'
        )


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = MyUser
        fields = (
            'id', 'email', 'display_name', 'password', 'is_admin',
            'cal_per_day', 'gender', 'age', 'perm_level', 'url'
        )
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validate_data):
        password = validate_data.pop('password')
        user = MyUser.objects.create(**validate_data)
        user.set_password(password)
        user.save()
        return user


class MyLoginSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyUser
        fields = ('id', 'email', 'displayname', 'is_admin', 'cal_per_day')
