"""
Module for asynchronous tasks related to processing uploaded files.

This module provides functionality to asynchronously process uploaded files,
such as extracting text from PDF files and performing text embedding.
It imports the `process_uploaded_file` task from the `post_tasks` submodule.


Tasks:
    process_uploaded_file: Asynchronously processes an uploaded file.
"""

from .post_tasks import process_uploaded_file
from .recording_tasks import process_image_files, process_recording_webhook
from .assignment_tasks import (
    process_assignment_generation,
    process_assignment_changes,
    process_create_assignment_using_ai,
    process_create_assignment_manually,
)
