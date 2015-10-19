# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('meals', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='meal',
            options={'ordering': ['-meal_time']},
        ),
        migrations.RemoveField(
            model_name='meal',
            name='meal_date',
        ),
        migrations.AlterField(
            model_name='meal',
            name='meal_time',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
