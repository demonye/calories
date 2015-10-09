# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('gender', models.CharField(blank=True, max_length=1, null=True, choices=[(b'M', b'Male'), (b'F', b'Female'), (b'O', b'Other')])),
                ('age', models.SmallIntegerField(null=True, blank=True)),
                ('cal_per_day', models.IntegerField()),
                ('role', models.CharField(max_length=1, choices=[(b'U', b'User'), (b'M', b'Manager'), (b'A', b'Administrator')])),
                ('manager', models.ForeignKey(related_name='manager', default=1, to=settings.AUTH_USER_MODEL)),
                ('user', models.OneToOneField(to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
