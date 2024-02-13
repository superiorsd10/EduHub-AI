"""
Module containing error codes Enum.
"""

from enum import IntEnum


class ErrorCode(IntEnum):
    """
    Enumeration of error codes.
    """

    SUCCESS = 200
    CREATED = 201
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    NOT_FOUND = 404
    CONFLICT = 409
    TOO_MANY_REQUESTS = 429
    INTERNAL_SERVER_ERROR = 500
    SERVER_UNAVAILABLE = 509
