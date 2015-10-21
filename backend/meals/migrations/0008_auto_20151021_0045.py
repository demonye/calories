# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('meals', '0007_auto_20151021_0026'),
    ]

    operations = [
        migrations.AlterField(
            model_name='meal',
            name='meal_date_str',
            field=models.CharField(default=b'1970-01-01', max_length=10, db_index=True),
        ),
        migrations.AlterField(
            model_name='meal',
            name='meal_time_str',
            field=models.CharField(default=b'00:00', max_length=5, db_index=True),
        ),
    ]
