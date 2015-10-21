# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.utils import timezone


def update_meal_date_str(apps, schema_editor):
    Meal = apps.get_model('meals', 'Meal')
    for m in Meal.objects.all():
        m.meal_date_str = timezone.datetime.strftime(
            timezone.localtime(m.meal_time), '%Y-%m-%d')
        m.save()


def backwards(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('meals', '0005_auto_20151021_0024'),
    ]

    operations = [
        migrations.RunPython(update_meal_date_str, backwards),
    ]
