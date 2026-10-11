from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone


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
        user = self.model(
            email=self.normalize_address(email),
            name=name.strip(),
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

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
    name = models.CharField(max_length=150)
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
