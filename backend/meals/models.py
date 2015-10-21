from django.db import models
from django.utils import timezone
# from django.contrib.auth.models import User
from users.models import MyUser
from datetime import date, datetime


class Meal(models.Model):
    user = models.ForeignKey(MyUser)
    meal_time = models.DateTimeField(default=timezone.now)
    what = models.CharField(max_length=256)
    calorie = models.IntegerField()
    comment = models.CharField(max_length=1024, blank=True, null=True)
    meal_time_str = models.CharField(max_length=5,
                                     default='00:00', db_index=True)
    meal_date_str = models.CharField(max_length=10,
                                     default='1970-01-01', db_index=True)

    class Meta:
        ordering = ['-meal_date_str', 'meal_time_str']

    def format_time(self, fmt):
        timezone.datetime.strftime(timezone.localtime(self.meal_time), fmt)

    def save(self, *args, **kwargs):
        self.meal_time = datetime.strptime(
            ' '.join([self.meal_date_str, self.meal_time_str]), '%Y-%m-%d %H:%M')
        super(Meal, self).save()
