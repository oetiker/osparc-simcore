""" Main's application module for simcore_service_storage service

    Functions to create, setup and run an aiohttp application provided a configuration object
"""
import logging

from aiohttp import web

from .db import setup_db
from .rest_routing import create_router
from .rest import setup_rest
from .session import setup_session
from .settings import CONFIG_KEY

log = logging.getLogger(__name__)

def create(config):
    log.debug("Initializing ... ")

    app = web.Application(router=create_router())
    app[CONFIG_KEY] = config

    setup_db(app)
    setup_session(app)
    setup_rest(app)

    return app

def run(config, app=None):
    log.debug("Serving app ... ")
    if not app:
        app = create(config)

    web.run_app(app,
        host=config["main"]["host"],
        port=config["main"]["port"])
