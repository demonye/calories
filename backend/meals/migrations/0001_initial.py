# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Meal',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('meal_date', models.DateField(default=django.utils.timezone.now)),
                ('meal_time', models.TimeField(default=django.utils.timezone.now)),
                ('what', models.CharField(max_length=256)),
                ('calorie', models.IntegerField()),
                ('comment', models.CharField(max_length=1024, null=True, blank=True)),
                ('user', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
