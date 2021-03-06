# coding: utf-8

"""
    Director API

    This is the oSparc's director API  # noqa: E501

    OpenAPI spec version: 0.1.0
    Contact: support@simcore.com
    Generated by: https://openapi-generator.tech
"""


from __future__ import absolute_import

import unittest

import simcore_director_sdk
from simcore_director_sdk.api.users_api import UsersApi  # noqa: E501
from simcore_director_sdk.rest import ApiException


class TestUsersApi(unittest.TestCase):
    """UsersApi unit test stubs"""

    def setUp(self):
        self.api = simcore_director_sdk.api.users_api.UsersApi()  # noqa: E501

    def tearDown(self):
        pass

    def test_root_get(self):
        """Test case for root_get

        Service health-check endpoint  # noqa: E501
        """
        pass

    def test_running_interactive_services_delete(self):
        """Test case for running_interactive_services_delete

        Stops and removes an interactive service from the oSparc platform  # noqa: E501
        """
        pass

    def test_running_interactive_services_get(self):
        """Test case for running_interactive_services_get

        Succesfully returns if a service with the defined uuid is up and running  # noqa: E501
        """
        pass

    def test_running_interactive_services_post(self):
        """Test case for running_interactive_services_post

        Starts an interactive service in the oSparc platform and returns its entrypoint  # noqa: E501
        """
        pass

    def test_services_by_key_version_get(self):
        """Test case for services_by_key_version_get

        Returns details of the selected service if available in the oSparc platform  # noqa: E501
        """
        pass

    def test_services_get(self):
        """Test case for services_get

        Lists available services in the oSparc platform  # noqa: E501
        """
        pass


if __name__ == '__main__':
    unittest.main()
