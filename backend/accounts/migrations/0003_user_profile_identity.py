from django.db import migrations, models
from django.utils.text import slugify


def populate_usernames(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    used_usernames = set()
    for user in User.objects.order_by("pk").iterator():
        base = slugify(user.email.partition("@")[0])[:30] or "musico"
        username = base
        suffix = 2
        while username in used_usernames:
            suffix_text = str(suffix)
            username = f"{base[:30 - len(suffix_text)]}{suffix_text}"
            suffix += 1
        user.username = username
        user.save(update_fields=["username"])
        used_usernames.add(username)


def clear_usernames(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    User.objects.update(username=None)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_main_instrument_user_photo"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="username",
            field=models.CharField(blank=True, max_length=30, null=True, unique=True),
        ),
        migrations.RunPython(populate_usernames, clear_usernames),
        migrations.AlterField(
            model_name="user",
            name="username",
            field=models.CharField(max_length=30, unique=True),
        ),
        migrations.AddField(
            model_name="user",
            name="description",
            field=models.CharField(blank=True, max_length=500),
        ),
    ]
