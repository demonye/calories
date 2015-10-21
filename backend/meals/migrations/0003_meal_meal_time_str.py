# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meals', '0002_auto_20151019_1558'),
    ]

    operations = [
        migrations.AddField(
            model_name='meal',
            name='meal_time_str',
            field=models.CharField(default=b'00:00', max_length=5),
        ),
    ]
