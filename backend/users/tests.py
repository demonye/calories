from django.test import TestCase
# from django.test.client import Client
from rest_framework.test import APIClient
from users.models import MyUser
import json


class ApiTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        email = 'hongqiang.ye@gmail.com'
        password = 'admin'
        MyUser.objects.create_superuser(email, password)
        self.client.login(email=email, password=password)


class UserApiTestCase(ApiTestCase):

    def setUp(self):
        self.url = '/api/v1/users'
        self.email = 'ye_hq@hotmail.com'
        self.data = {
            'email': self.email,
            'display_name': 'Eric Ye',
            'password': '123456',
            'gender': 'M',
            'age': 38,
            'cal_per_day': 3000
        }
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

    def _create_user(self):
        r = self.client.post(self.url, data=self.data)
        assert r.status_code == 201
        return MyUser.objects.get(email=self.email)

    def test_create_user(self):
        user = self._create_user()
        for k, v in self.data.items():
            if k == 'password':
                assert user.check_password(v)
            else:
                assert getattr(user, k) == v

    def test_modify_user(self):
        user = self._create_user()
        url = "{}/{}".format(self.url, user.id)

        def assertUpdate(field, value, value2=None):
            r = self.client.patch(url , {field: value}, format='json')
            assert r.status_code == 200
            user = MyUser.objects.get(email=self.email)
            if value2 is None:
                assert getattr(user, field) == value
            else:
                assert getattr(user, field) == value2

        assertUpdate("display_name", "Eric Test")
        assertUpdate("gender", "F")
        assertUpdate("age", 20)
        assertUpdate("cal_per_day", 1234)

        assertUpdate("perm_level", 10)

        # Non super user is not able to update perm
        self.client.logout()
        self.client.login(email=self.email, password=self.data['password'])
        assertUpdate("perm_level", 8, 10)


    def test_delete_user(self):
        user = MyUser.objects.create_user(self.email, '123456')
        r = self.client.delete("{}/{}".format(self.url, user.id))
        assert r.status_code == 204 and self.get_user_by_email() is None
