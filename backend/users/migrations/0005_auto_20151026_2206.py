# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_auto_20151022_2315'),
    ]

    operations = [
        migrations.AlterField(
            model_name='myuser',
            name='display_name',
            field=models.CharField(max_length=64, null=True, blank=True),
        ),
    ]
