from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class UserManager(BaseUserManager):
    use_in_migrations = True

    @staticmethod
    def normalize_address(email: str) -> str:
        return email.strip().casefold()

    def create_user(self, email: str, name: str, password: str | None = None, **extra_fields):
        if not email:
            raise ValueError("An email address is required.")
        if not name or not name.strip():
            raise ValueError("A name is required.")
        username = extra_fields.pop("username", None) or self.make_unique_username(email)
        user = self.model(
            email=self.normalize_address(email),
            name=name.strip(),
            username=username,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def make_unique_username(self, email: str, exclude_pk: int | None = None) -> str:
        base = slugify(email.partition("@")[0])[:30] or "musico"
        candidate = base
        suffix = 2
        while self.filter(username=candidate).exclude(pk=exclude_pk).exists():
            suffix_text = str(suffix)
            candidate = f"{base[:30 - len(suffix_text)]}{suffix_text}"
            suffix += 1
        return candidate

    def create_superuser(self, email: str, name: str, password: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        if not extra_fields["is_staff"] or not extra_fields["is_superuser"]:
            raise ValueError("A superuser must have staff and superuser permissions.")
        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    # Keep this MVP account model small; extend fields through reviewed migrations.
    email = models.EmailField(max_length=254, unique=True)
    username = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=500, blank=True)
    main_instrument = models.CharField(max_length=100, blank=True)
    photo = models.ImageField(upload_to="profile_photos/%Y/%m/", blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self) -> str:
        return self.email
