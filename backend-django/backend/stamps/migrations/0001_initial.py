# Generated by Django 5.1.2 on 2025-01-26 19:21

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Stamp',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('shape', models.CharField(max_length=50)),
                ('color', models.CharField(max_length=20)),
                ('preview', models.ImageField(upload_to='stamps/previews/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
