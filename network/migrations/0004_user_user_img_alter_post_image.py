# Generated by Django 5.0.2 on 2024-03-13 21:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_remove_post_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='user_img',
            field=models.ImageField(default='network/userImages/default_user.png', upload_to='network/userImages'),
        ),
        migrations.AlterField(
            model_name='post',
            name='image',
            field=models.ImageField(default='network/postImage/default-placeholder.jpg', upload_to='network/postImage'),
        ),
    ]
