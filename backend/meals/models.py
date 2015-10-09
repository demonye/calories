from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from users.models import Profile
from datetime import datetime


class Meal(models.Model):
    user = models.ForeignKey(User)
    meal_date = models.DateField(default=timezone.now)
    meal_time = models.TimeField(default=timezone.now)
    what = models.CharField(max_length=256)
    calorie = models.IntegerField()
    comment = models.CharField(max_length=1024, blank=True, null=True)
