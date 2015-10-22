from django.test import TestCase
from django.test.client import Client
import mock
from users.models import MyUser


class ApiTestCase(TestCase):

    def setUp(self):
        self.client = Client()
        email = 'hongqiang.ye@gmail.com'
        password = 'admin'
        MyUser.objects.create_superuser(email, password)
        self.client.login(email=email, password=password)


class UserApiTestCase(ApiTestCase):

    def setUp(self):
        self.url = '/api/v1/users'
        self.email = 'ye_hq@hotmail.com'
        super(UserApiTestCase, self).setUp()

    def get_user_by_email(self, email=None):
        if email is None:
            email = self.email
        user = None
        try:
            user = MyUser.objects.get(email=email)
        except MyUser.DoesNotExist:
            pass
        return user

    def test_register_user(self):
        data = {
            'email': self.email,
            'password1': '123456',
            'password2': '123456',
        }
        r = self.client.post('/api/v1/auth/registration/', data=data)
        assert r.status_code == 201 and self.get_user_by_email() is not None

    def test_delete_user(self):
        user = MyUser.objects.create(email=self.email, password='123456')
        r = self.client.delete("{}/{}".format(self.url, user.id))
        assert r.status_code == 204 and self.get_user_by_email() is None
