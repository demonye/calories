# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_auto_20151014_1000'),
    ]

    operations = [
        migrations.AddField(
            model_name='myuser',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
