# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meals', '0004_auto_20151021_0018'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='meal',
            options={'ordering': ['-meal_time', 'meal_time_str']},
        ),
        migrations.AddField(
            model_name='meal',
            name='meal_date_str',
            field=models.CharField(default=b'1970-01-01', max_length=10),
        ),
    ]
