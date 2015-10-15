# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_auto_20151013_1147'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='myuser',
            name='is_admin',
        ),
        migrations.AddField(
            model_name='myuser',
            name='perm_level',
            field=models.SmallIntegerField(default=1),
        ),
    ]
