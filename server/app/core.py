"""
Module: core

This module initializes the FlaskRedis and Limiter instances used in the application.

Attributes:
    - redis: An instance of FlaskRedis for interacting with Redis.
    - limiter: An instance of Limiter for rate limiting requests.

Usage:
    To use Redis for caching and rate limiting in the application,
    import `redis` and `limiter` from this module.
"""

import os
import redis
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

redis_client = redis.Redis(
    host=os.environ.get("REDIS_HOST"),
    port=os.environ.get("REDIS_PORT"),
    password=os.environ.get("REDIS_PASSWORD"),
)

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per day", "100 per hour"],
    storage_uri=os.environ.get("REDIS_URL"),
)
