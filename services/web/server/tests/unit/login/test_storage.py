# pylint:disable=unused-import
# pylint:disable=unused-argument
# pylint:disable=redefined-outer-name

from urllib.parse import quote

import pytest
from aiohttp import web

from servicelib.rest_responses import unwrap_envelope
from servicelib.rest_utils import extract_and_validate
from utils_assert import assert_status
from utils_login import LoggedUser

# from simcore_service_webserver.application_keys import APP_CONFIG_KEY
# from simcore_service_webserver.storage import setup_storage
# from simcore_service_webserver.rest import setup_rest

# TODO: create a fake storage service here
@pytest.fixture()
def storage_server(loop, aiohttp_server, app_cfg):
    cfg = app_cfg["storage"]

    app = web.Application()
    async def _get_locs(request: web.Request):
        assert not request.has_body

        query = request.query
        assert query
        assert "user_id" in query

        assert query["user_id"], "Expected user id"
        return web.json_response({
            'data': [{"user_id": int(query["user_id"])}, ]
        })

    async def _get_filemeta(request: web.Request):
        assert not request.has_body

        query = request.query
        assert query
        assert "user_id" in query

        assert query["user_id"], "Expected user id"

        return web.json_response({
            'data': [{"filemeta": 42}, ]
        })

    async def _get_filtered_list(request: web.Request):
        assert not request.has_body

        query = request.query
        assert query
        assert "user_id" in query

        assert query["user_id"], "Expected user id"
        assert query["uuid_filter"], "expected a filter"

        return web.json_response({
            'data': [{"uuid_filter": query["uuid_filter"]}, ]
        })

    version = cfg['version']

    app.router.add_get("/%s/locations" % version, _get_locs)
    app.router.add_get("/%s/locations/0/files/{file_id}/metadata" % version, _get_filemeta)
    app.router.add_get("/%s/locations/0/files/metadata" % version, _get_filtered_list)

    assert cfg['host']=='localhost'

    server = loop.run_until_complete(aiohttp_server(app, port= cfg['port']))
    return server

async def test_storage_locations(client, storage_server):
    url = "/v0/storage/locations"

    async with LoggedUser(client) as user:
        print("Logged user:", user) # TODO: can use in the test

        resp = await client.get(url)
        payload = await resp.json()
        assert resp.status == 200, str(payload)

        data, error = unwrap_envelope(payload)

        assert len(data) == 1
        assert not error

        assert data[0]['user_id'] == user['id']

async def test_storage_file_meta(client, storage_server):
    # tests redirect of path with quotes in path
    file_id = "a/b/c/d/e/dat"
    url = "/v0/storage/locations/0/files/{}/metadata".format(quote(file_id, safe=''))

    async with LoggedUser(client) as user:
        print("Logged user:", user) # TODO: can use in the test

        resp = await client.get(url)
        payload = await resp.json()
        assert resp.status == 200, str(payload)

        data, error = unwrap_envelope(payload)

        assert len(data) == 1
        assert not error

        assert data[0]['filemeta'] == 42

async def test_storage_list_filter(client, storage_server):
    # tests composition of 2 queries
    file_id = "a/b/c/d/e/dat"
    url = "/v0/storage/locations/0/files/metadata?uuid_filter={}".format(quote(file_id, safe=''))

    async with LoggedUser(client) as user:
        print("Logged user:", user) # TODO: can use in the test

        resp = await client.get(url)
        payload = await resp.json()
        assert resp.status == 200, str(payload)

        data, error = unwrap_envelope(payload)

        assert len(data) == 1
        assert not error
        assert data[0]['uuid_filter'] == file_id
