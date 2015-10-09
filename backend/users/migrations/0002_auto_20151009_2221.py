# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.contrib.auth.models import User


def insert_admin_profile(apps, schema_editor):
    Profile = apps.get_model("users", "Profile")
    Profile.objects.create(user_id=1, cal_per_day=2500, role='A')



class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(insert_admin_profile),
    ]
