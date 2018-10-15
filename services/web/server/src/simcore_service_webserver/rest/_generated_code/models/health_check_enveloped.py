# coding: utf-8

from __future__ import absolute_import
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from .base_model_ import Model
from .health_check import HealthCheck  # noqa: F401,E501
from .. import util


class HealthCheckEnveloped(Model):
    """NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).

    Do not edit the class manually.
    """

    def __init__(self, data: HealthCheck=None, status: int=None):  # noqa: E501
        """HealthCheckEnveloped - a model defined in OpenAPI

        :param data: The data of this HealthCheckEnveloped.  # noqa: E501
        :type data: HealthCheck
        :param status: The status of this HealthCheckEnveloped.  # noqa: E501
        :type status: int
        """
        self.openapi_types = {
            'data': HealthCheck,
            'status': int
        }

        self.attribute_map = {
            'data': 'data',
            'status': 'status'
        }

        self._data = data
        self._status = status

    @classmethod
    def from_dict(cls, dikt) -> 'HealthCheckEnveloped':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The HealthCheckEnveloped of this HealthCheckEnveloped.  # noqa: E501
        :rtype: HealthCheckEnveloped
        """
        return util.deserialize_model(dikt, cls)

    @property
    def data(self) -> HealthCheck:
        """Gets the data of this HealthCheckEnveloped.


        :return: The data of this HealthCheckEnveloped.
        :rtype: HealthCheck
        """
        return self._data

    @data.setter
    def data(self, data: HealthCheck):
        """Sets the data of this HealthCheckEnveloped.


        :param data: The data of this HealthCheckEnveloped.
        :type data: HealthCheck
        """

        self._data = data

    @property
    def status(self) -> int:
        """Gets the status of this HealthCheckEnveloped.


        :return: The status of this HealthCheckEnveloped.
        :rtype: int
        """
        return self._status

    @status.setter
    def status(self, status: int):
        """Sets the status of this HealthCheckEnveloped.


        :param status: The status of this HealthCheckEnveloped.
        :type status: int
        """

        self._status = status