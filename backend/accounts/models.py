from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.conf import settings

BASE_URL = getattr(settings, 'BASE_URL', None)

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None):

        user = self.model(
            email=self.normalize_email(email),
            name=name,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password):
        user = self.create_user(
            email,
            name=name,
            password=password,
        )

        user.is_active = True
        user.is_admin = True
        user.save(using=self._db)
        return user
    
    def create_social_user(self, userinfo):
        user = self.model(
            email=self.normalize_email(userinfo['email']),
            name=userinfo['name'],
        )
        user.profile_img_url = userinfo['picture']
        user.is_active = True
        user.is_google = True
        user.save()

        return user


class User(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='email',
        max_length=100,
        unique=True,
    )
    name = models.CharField(max_length=30)
    profile_img = models.ImageField(null=True, blank=True) # 장고 내부에 저장된 이미지 파일용
    profile_img_url = models.CharField(max_length=100, default=f"{BASE_URL}media/default_profile.jpg") # 장고 외부 url 프로필 이미지용
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_google = models.BooleanField(default=False)
    is_backtest = models.BooleanField(default=False)
    token = models.CharField(max_length=300, null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin
    
    class Meta:
        db_table = 'user'
