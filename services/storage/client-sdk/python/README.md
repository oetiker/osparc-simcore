# simcore-service-storage-sdk
API definition for simcore-service-storage service

This Python package is automatically generated by the [OpenAPI Generator](https://openapi-generator.tech) project:

- API version: 0.1.0
- Package version: 0.1.0
- Build package: org.openapitools.codegen.languages.PythonClientCodegen

## Requirements.

Python 2.7 and 3.4+

## Installation & Usage
### pip install

If the python package is hosted on Github, you can install directly from Github

```sh
pip install git+https://github.com/GIT_USER_ID/GIT_REPO_ID.git
```
(you may need to run `pip` with root permission: `sudo pip install git+https://github.com/GIT_USER_ID/GIT_REPO_ID.git`)

Then import the package:
```python
import simcore_service_storage_sdk 
```

### Setuptools

Install via [Setuptools](http://pypi.python.org/pypi/setuptools).

```sh
python setup.py install --user
```
(or `sudo python setup.py install` to install the package for all users)

Then import the package:
```python
import simcore_service_storage_sdk
```

## Getting Started

Please follow the [installation procedure](#installation--usage) and then run the following:

```python
from __future__ import print_function
import time
import simcore_service_storage_sdk
from simcore_service_storage_sdk.rest import ApiException
from pprint import pprint

# create an instance of the API class
api_instance = simcore_service_storage_sdk.UsersApi(simcore_service_storage_sdk.ApiClient(configuration))
action = 'echo' # str |  (default to 'echo')
data = 'data_example' # str |  (optional)
fake_type = simcore_service_storage_sdk.FakeType() # FakeType |  (optional)

try:
    # Test checkpoint to ask server to fail or echo back the transmitted data
    api_response = api_instance.check_action_post(action, data=data, fake_type=fake_type)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UsersApi->check_action_post: %s\n" % e)

```

## Documentation for API Endpoints

All URIs are relative to *http://localhost:11111/v0*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*UsersApi* | [**check_action_post**](docs/UsersApi.md#check_action_post) | **POST** /check/{action} | Test checkpoint to ask server to fail or echo back the transmitted data
*UsersApi* | [**delete_file**](docs/UsersApi.md#delete_file) | **DELETE** /locations/{location_id}/files/{fileId} | Deletes File
*UsersApi* | [**download_file**](docs/UsersApi.md#download_file) | **GET** /locations/{location_id}/files/{fileId} | Returns download link for requested file
*UsersApi* | [**get_file_metadata**](docs/UsersApi.md#get_file_metadata) | **GET** /locations/{location_id}/files/{fileId}/metadata | Get File Metadata
*UsersApi* | [**get_files_metadata**](docs/UsersApi.md#get_files_metadata) | **GET** /locations/{location_id}/files/metadata | Get Files Metadata
*UsersApi* | [**get_storage_locations**](docs/UsersApi.md#get_storage_locations) | **GET** /locations | Get available storage locations
*UsersApi* | [**health_check**](docs/UsersApi.md#health_check) | **GET** / | Service health-check endpoint
*UsersApi* | [**update_file_meta_data**](docs/UsersApi.md#update_file_meta_data) | **PATCH** /locations/{location_id}/files/{fileId}/metadata | Update File Metadata
*UsersApi* | [**upload_file**](docs/UsersApi.md#upload_file) | **PUT** /locations/{location_id}/files/{fileId} | Returns upload link or performs copy operation to datcore


## Documentation For Models

 - [ErrorEnveloped](docs/ErrorEnveloped.md)
 - [ErrorItemType](docs/ErrorItemType.md)
 - [ErrorType](docs/ErrorType.md)
 - [FakeEnveloped](docs/FakeEnveloped.md)
 - [FakeType](docs/FakeType.md)
 - [FileLocation](docs/FileLocation.md)
 - [FileLocationArray](docs/FileLocationArray.md)
 - [FileLocationArrayEnveloped](docs/FileLocationArrayEnveloped.md)
 - [FileMetaDataArrayEnveloped](docs/FileMetaDataArrayEnveloped.md)
 - [FileMetaDataArrayType](docs/FileMetaDataArrayType.md)
 - [FileMetaDataEnveloped](docs/FileMetaDataEnveloped.md)
 - [FileMetaDataType](docs/FileMetaDataType.md)
 - [HealthCheckEnveloped](docs/HealthCheckEnveloped.md)
 - [HealthCheckType](docs/HealthCheckType.md)
 - [LogMessageType](docs/LogMessageType.md)
 - [PresignedLinkEnveloped](docs/PresignedLinkEnveloped.md)
 - [PresignedLinkType](docs/PresignedLinkType.md)


## Documentation For Authorization

 All endpoints do not require authorization.


## Author

support@simcore.io


