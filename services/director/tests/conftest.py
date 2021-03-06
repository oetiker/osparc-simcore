# pylint: disable=unused-argument
# pylint: disable=unused-import
# pylint: disable=bare-except
# pylint: disable=redefined-outer-name

import logging
import os
import sys
from pathlib import Path

import pytest

import simcore_service_director
from simcore_service_director import config, resources

pytest_plugins = ["fixtures.docker_registry", "fixtures.docker_swarm", "fixtures.fake_services"]

_logger = logging.getLogger(__name__)
CURRENT_DIR = Path(sys.argv[0] if __name__ == "__main__" else __file__).parent.absolute()

@pytest.fixture(scope='session')
def here():
    return Path(sys.argv[0] if __name__ == "__main__" else __file__).resolve().parent

@pytest.fixture(scope='session')
def osparc_simcore_root_dir(here):
    root_dir = here.parent.parent.parent.resolve()
    assert root_dir.exists(), "Is this service within osparc-simcore repo?"
    assert any(root_dir.glob("services/web/server")), "%s not look like rootdir" % root_dir
    return root_dir

@pytest.fixture(scope='session')
def docker_compose_file(pytestconfig, here):
    my_path = here / "docker-compose.yml"
    return my_path

@pytest.fixture(scope='session')
def api_specs_dir(osparc_simcore_root_dir):
    specs_dir = osparc_simcore_root_dir/ "api" / "specs" / "director"
    assert specs_dir.exists()
    return specs_dir

@pytest.fixture(scope='session')
def shared_schemas_specs_dir(osparc_simcore_root_dir):
    specs_dir = osparc_simcore_root_dir/ "api" / "specs" / "shared" / "schemas"
    assert specs_dir.exists()
    return specs_dir

@pytest.fixture(scope='session')
def package_dir(here):
    dirpath = Path(simcore_service_director.__file__).resolve().parent
    assert dirpath.exists()
    return dirpath

@pytest.fixture
def configure_schemas_location(package_dir, shared_schemas_specs_dir):
    config.NODE_SCHEMA_LOCATION = str(shared_schemas_specs_dir / "node-meta-v0.0.1.json")
    resources.RESOURCE_NODE_SCHEMA = os.path.relpath(config.NODE_SCHEMA_LOCATION, package_dir)


@pytest.fixture
def configure_registry_access(docker_registry):
    config.REGISTRY_URL = docker_registry
    config.REGISTRY_SSL = False

@pytest.fixture
def user_id():
    yield "some_user_id"

@pytest.fixture
def project_id():
    yield "some_project_id"
