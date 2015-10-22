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

    # Validate if user matches parent_lookup_object_id
    """
    def create(self, validate_data):
        ctx = self.context['request'].parser_context
        user_id = int(ctx['kwargs']['parent_lookup_object_id'])
        user = validate_data.['user']
        if user.id != user_id:
            raise serializers.ValidationError("Invalidate user information")

        return Meal.objects.create(**validate_data)
    """


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
        req_user = self.context['request'].user
        if not req_user.is_admin and 'perm_level' in validate_data:
            validate_data.pop('perm_level')
        user = MyUser.objects.create(**validate_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, user, validate_data):
        req_user = self.context['request'].user
        for k, v in validate_data.items():
            if k != 'perm_level' or req_user.is_admin:
                setattr(user, k, v)
        user.save()
        return user



class MyLoginSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyUser
        fields = ('id', 'email', 'displayname', 'is_admin', 'cal_per_day')
