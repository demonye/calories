from django.test import TestCase
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from allauth.account.models import EmailAddress
from rest_framework.test import APIClient
from users.models import MyUser
import json
import re


class ApiTestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        email = 'hongqiang.ye@gmail.com'
        password = 'admin'
        MyUser.objects.create_superuser(email, password)
        self.client.login(email=email, password=password)


class UserApiTestCase(ApiTestCase):

    def setUp(self):
        self.user_url = '/api/v1/users'
        self.auth_url = '/api/v1/auth'
        self.email = 'ye_hq@hotmail.com'
        self.data = {
            'email': self.email,
            'display_name': 'Eric Ye',
            'password': '123456',
            'gender': 'M',
            'age': 30,
            'cal_per_day': 3000,
            'perm_level': 1,
        }
        self.manager = {
            'email': 'eric.ye@mailinator.com',
            'display_name': 'Ye HQ',
            'password': '123456',
            'gender': 'M',
            'age': 38,
            'cal_per_day': 2700,
            'perm_level': 10,
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

    def create_user(self, data=None):
        if data is None:
            data = self.data
        r = self.client.post(self.user_url, data=data)
        assert r.status_code == 201
        return self.get_user_by_email(data['email'])

    def assert_update_user(self, user, field, value, value2=None):
        url = "{}/{}".format(self.user_url, user.id)
        r = self.client.patch(url , {field: value}, format='json')
        if value2 is None:
            assert r.status_code == 200
        updated_user = self.get_user_by_email(self.email)
        if value2 is None:
            assert getattr(updated_user, field) == value
        else:
            assert getattr(updated_user, field) == value2

    def create_user_and_return_token(self):
        user = self.create_user()
        data = {
            'email': self.data['email'],
            'password': self.data['password'],
        }
        r = self.client.post(self.auth_url + '/login/', data=data)
        assert r.status_code == 200 and 'key' in r.data
        token = r.data['key']
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token)
        return token

    def register_user_and_return_token(self):
        data = {
            'email': self.email,
            'password1': '123456',
            'password2': '123456',
        }
        r = self.client.post(self.auth_url + '/registration/', data=data)
        assert r.status_code == 201 and 'key' in r.data
        return r.data['key']

    def test_auth_registration(self):
        token = self.register_user_and_return_token()
        assert self.get_user_by_email() is not None
        emails = EmailAddress.objects.filter(email=self.email)
        assert len(emails) == 1 and emails[0].email == self.email

    def test_auth_registration_verify(self):
        token = self.register_user_and_return_token()
        emails = EmailAddress.objects.filter(email=self.email)
        assert len(emails) == 1
        confirmations = emails[0].emailconfirmation_set.all()
        assert len(confirmations) == 1
        data = {'key': confirmations[0].key}
        r = self.client.post(self.auth_url + '/registration/verify-email/',
                             data=data, HTTP_AUTHORIZATION='Token ' + token)
        assert r.status_code == 200

    def test_auth_login(self):
        token = self.create_user_and_return_token()
        assert re.match(r"^[a-z0-9]{40}$", token) is not None

    def test_auth_logout(self):
        token = self.create_user_and_return_token()
        r = self.client.post(self.auth_url + '/logout/')
        assert r.status_code == 200

    def test_auth_password_change(self):
        token = self.create_user_and_return_token()
        data = {
            'old_password': self.data['password'],
            'new_password1': '654321',
            'new_password2': '654321',
        }
        r = self.client.post(self.auth_url + '/password/change/', data)
        assert r.status_code == 200 and 'success' in r.data
        user = self.get_user_by_email()
        assert user.check_password('654321')

    def test_auth_password_reset(self):
        token = self.create_user_and_return_token()
        data = {'email': self.email}
        r = self.client.post(self.auth_url + '/password/reset/', data)
        assert r.status_code == 200 and 'success' in r.data

    def test_auth_password_reset_confirm(self):
        token = self.create_user_and_return_token()
        user = self.get_user_by_email()
        data = {
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': default_token_generator.make_token(user),
            'new_password1': '654321',
            'new_password2': '654321',
        }
        r = self.client.post(self.auth_url + '/password/reset/confirm/', data)
        user = self.get_user_by_email()
        assert r.status_code == 200 and user.check_password('654321')

    def test_auth_get_user(self):
        token = self.create_user_and_return_token()
        r = self.client.get(self.auth_url + '/user/')
        assert r.status_code == 200 and r.data['email'] == self.email

    def test_create_user(self):
        user = self.create_user()
        for k, v in self.data.items():
            if k == 'password':
                assert user.check_password(v)
            else:
                assert getattr(user, k) == v

    def test_modify_user(self):
        user = self.create_user()

        self.assert_update_user(user, "display_name", "Eric Test")
        self.assert_update_user(user, "gender", "F")
        self.assert_update_user(user, "age", 20)
        self.assert_update_user(user, "cal_per_day", 1234)
        self.assert_update_user(user, "perm_level", 10)

    def test_modify_user_perm_non_admin(self):
        user = self.create_user()
        self.assert_update_user(user, "perm_level", 10)

        # Non super user is not able to update perm
        self.client.logout()
        self.client.login(email=self.email, password=self.data['password'])
        self.assert_update_user(user, "perm_level", 8, 10)

    def test_modify_user_with_permission(self):
        manager = self.create_user(self.manager)
        user = self.create_user()

        self.client.logout()
        self.client.login(email=self.manager['email'], password=self.manager['password'])
        self.assert_update_user(user, "gender", "F")
        self.assert_update_user(user, "age", 20)

    def test_modify_user_without_permission(self):
        manager = self.create_user(self.manager)
        user = self.create_user()

        self.client.logout()
        self.client.login(email=self.data['email'], password=self.data['password'])
        self.assert_update_user(manager, "gender", "F", "M")

    def test_delete_user(self):
        user = MyUser.objects.create_user(self.email, '123456')
        r = self.client.delete("{}/{}".format(self.user_url, user.id))
        assert r.status_code == 204 and self.get_user_by_email() is None
