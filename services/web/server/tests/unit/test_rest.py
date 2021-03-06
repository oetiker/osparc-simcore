# pylint:disable=unused-import
# pylint:disable=unused-argument
# pylint:disable=redefined-outer-name

import logging
import sys
from pathlib import Path

import openapi_core
import pytest
import yaml
from aiohttp import web

import simcore_service_webserver
from servicelib.application_keys import APP_CONFIG_KEY, APP_OPENAPI_SPECS_KEY
from servicelib.rest_responses import unwrap_envelope
from simcore_service_webserver import resources, rest
from simcore_service_webserver.rest import setup_rest
from simcore_service_webserver.security import setup_security

logging.basicConfig(level=logging.INFO)


# TODO: reduce log from openapi_core loggers

@pytest.fixture
def openapi_path(api_specs_dir):
    specs_path = api_specs_dir / 'oas3/v0/openapi.yaml'
    assert specs_path.exits()
    return specs_path

@pytest.fixture
def spec_dict(openapi_path):
    with openapi_path.open() as f:
        spec_dict = yaml.safe_load(f)
    return spec_dict

@pytest.fixture
def client(loop, aiohttp_unused_port, aiohttp_client, api_specs_dir):
    app = web.Application()

    server_kwargs={'port': aiohttp_unused_port(), 'host': 'localhost'}
    # fake config
    app[APP_CONFIG_KEY] = {
        "main": server_kwargs,
        "rest": {
            "version": "v0",
            "location": str(api_specs_dir / "v0" / "openapi.yaml")
        }
    }
    # activates only security+restAPI sub-modules
    setup_security(app)
    setup_rest(app, debug=True)

    cli = loop.run_until_complete( aiohttp_client(app, server_kwargs=server_kwargs) )
    return cli

# ------------------------------------------

async def test_check_health(client):
    resp = await client.get("/v0/")
    payload = await resp.json()

    assert resp.status == 200, str(payload)
    data, error = tuple(payload.get(k) for k in ('data', 'error'))

    assert data
    assert not error

    assert data['name'] == 'simcore_service_webserver'
    assert data['status'] == 'SERVICE_RUNNING'

async def test_check_action(client):
    QUERY = 'value'
    ACTION = 'echo'
    FAKE = {
        'path_value': 'one',
        'query_value': 'two',
        'body_value': {
            'a': 'foo',
            'b': '45'
        }
    }

    resp = await client.post("/v0/check/{}?data={}".format(ACTION, QUERY), json=FAKE)
    payload = await resp.json()
    data, error = tuple(payload.get(k) for k in ('data', 'error'))

    assert resp.status == 200, str(payload)
    assert data
    assert not error

    # TODO: validate response against specs

    assert data['path_value'] == ACTION
    assert data['query_value'] == QUERY
    assert data['body_value'] == FAKE

@pytest.mark.skip(reason="DEV: Dummy login")
async def test_auth_register(client, caplog):
    caplog.set_level(logging.ERROR, logger='openapi_spec_validator')
    caplog.set_level(logging.ERROR, logger='openapi_core')

    response = await client.post('v0/auth/register',
        json = {
            'email': 'bar@mail.com',
            'password': 'my secret',
            'confirm': 'my secret',
            },
    )
    payload = await response.json()

    assert response.status==web.HTTPOk.status_code, str(payload)

    data, error = [payload[k] for k in ('data', 'error')]
    assert not error
    assert data

    assert 'message' in data
    assert data.get('logger') == "user"

    # possible usage
    client_log = logging.getLogger(data.get('logger', __name__))
    level = getattr(logging, data.get('level', "INFO"))
    client_log.log(level, msg=data['message'])

@pytest.mark.skip(reason="DEV: Dummy login")
async def test_auth_login(client, caplog):

    log_filter = logging.Filter(name='simcore_service_webserver')
    logging.getLogger().addFilter(log_filter)

    # valid registration
    response = await client.post('v0/auth/register',
        json = {
            'email': 'foo@mymail.com',
            'password': 'my secret',
            'confirm': 'my secret',
            },
    )
    payload = await response.json()
    assert response.status==200, str(payload)

    data, error = unwrap_envelope(payload)
    assert not error
    assert data

    # FIXME: routing errors are returned as text and not json!!

    # valid login on registered ser
    response = await client.post('v0/auth/login',
        json = {
            'email': 'foo@mymail.com',
            'password': 'my secret',
            },
    )
    payload = await response.json()
    assert response.status==200, str(payload)

    data, error = unwrap_envelope(payload)
    assert not error
    assert data


    # invalid login
    response = await client.post('v0/auth/login',
        json = {
            'email': 'foo@mymail.com',
            'password': 'wrong pass',
            },
    )
    payload = await response.json()
    assert response.status==web.HTTPUnprocessableEntity.status_code, str(payload)

    data, error = unwrap_envelope(payload)
    assert error
    assert not data


  # logout
    response = await client.get('v0/auth/logout')

    payload = await response.json()
    assert response.status==web.HTTPOk.status_code, str(payload)

    data, error = unwrap_envelope(payload)
    assert not error
    assert data # logs
    assert all( k in data for k in ('level', 'logger', 'message') )

@pytest.mark.skip(reason="SAN: this must be added to ensure easier transition")
async def test_start_pipeline(client):

    resp = await client.post("/start_pipeline",
            json={
                "project_id":"asdfsk-sdfsdgsd-sdfsfd-sdfsd",
                "workbench":{
                    "eroiuriet-dsffdgjh-eriter-dfdfg":{

                    }
                }

            })
    assert resp.status == 200

    payload = await resp.json()
    data, error = tuple(payload.get(k) for k in ('data', 'error'))

    assert data
    assert not error

    assert data['name'] == 'simcore_service_webserver'
    assert data['status'] == 'SERVICE_RUNNING'
