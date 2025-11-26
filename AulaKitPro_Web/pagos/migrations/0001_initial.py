# Generated manually for pagos app
from django.db import migrations, models
from django.conf import settings

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Suscripcion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stripe_customer_id', models.CharField(blank=True, max_length=50, null=True)),
                ('stripe_subscription_id', models.CharField(blank=True, max_length=50, null=True)),
                ('status', models.CharField(default='free', max_length=20)),
                ('is_pro', models.BooleanField(default=False)),
                ('end_date', models.DateTimeField(blank=True, null=True)),
                ('usuario', models.OneToOneField(on_delete=models.CASCADE, related_name='suscripcion', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
