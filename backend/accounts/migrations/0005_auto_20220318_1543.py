# Generated by Django 3.0.1 on 2022-03-18 15:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_auto_20220307_1614'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='profile_img_url',
            field=models.CharField(default='http://j6s001.p.ssafy.io/media/default_profile.jpg', max_length=100),
        ),
    ]