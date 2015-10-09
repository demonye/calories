from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    )

    ROLE_CHOICES = (
        ('U', 'User'),
        ('M', 'Manager'),
        ('A', 'Administrator'),
    )

    user = models.OneToOneField(User)
    manager = models.ForeignKey(User, related_name='manager', default=1)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    age = models.SmallIntegerField(null=True, blank=True)
    cal_per_day = models.IntegerField()
    role = models.CharField(max_length=1, choices=ROLE_CHOICES)
