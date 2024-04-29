"""
Module for processing image files and generating recording embeddings.

This module provides functionalities for processing a list of image files to identify
and store different frames as recording embeddings. It includes methods for calculating
frame differences between images, extracting text embeddings from image contexts, and
storing the generated embeddings in a MongoDB database.

The module utilizes external services such as image recognition APIs and pre-trained
embedding models to analyze image contents and generate embeddings. It integrates with
Celery for asynchronous task execution, allowing scalable and efficient processing
of image files in distributed environments.

Functions:
    - calculate_frame_difference: Calculate the frame difference between two images.
    - bytes_to_base64: Convert bytes of an image to a base64 encoded string.
    - get_image_context: Obtain a detailed textual description of an image using an image
                         recognition API.
    - extract_text_embedding: Generate text embeddings for a text chunk using a pre-trained
                              model.
    - process_image_files: Process a list of image files to identify and store different
                           frames as recording embeddings.

Note:
    - The 'calculate_frame_difference' function calculates the frame difference between
      two images based on their pixel values.
    - The 'get_image_context' function sends an image to an image recognition API and
      retrieves a textual description of the image content.
    - The 'extract_text_embedding' function generates text embeddings for a given text
      chunk using a pre-trained model.
    - The 'process_image_files' Celery task analyzes image files to identify frames with
      significant differences and stores their recording embeddings in a MongoDB database.
"""

import os
import base64
from typing import List
import cv2

from flask import current_app
from app.celery.celery import celery_instance
from app.models.recording_embedding import RecordingEmbedding
from config.config import Config
from dotenv import load_dotenv
from mongoengine import connect
import numpy as np
import requests
import google.generativeai as genai
import redis
import smart_open


def calculate_frame_difference(image_bytes1: bytes, image_bytes2: bytes) -> float:
    """
    Calculate the frame difference between two images.

    Args:
        image_bytes1 (bytes): Bytes of the first image.
        image_bytes2 (bytes): Bytes of the second image.

    Returns:
        float: Frame difference between the two images. Value ranges from 0.0
        (same image) to 1.0 (completely different images).
    """
    try:

        image1 = cv2.imdecode(np.frombuffer(image_bytes1, np.uint8), cv2.IMREAD_COLOR)
        image2 = cv2.imdecode(np.frombuffer(image_bytes2, np.uint8), cv2.IMREAD_COLOR)

        gray1 = cv2.cvtColor(image1, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(image2, cv2.COLOR_BGR2GRAY)

        diff = cv2.absdiff(gray1, gray2)

        mean_diff = diff.mean()

        normalized_diff = mean_diff / 255.0

        return normalized_diff

    except Exception as error:
        print("Error:", error)
        raise


def bytes_to_base64(image_bytes: bytes) -> str:
    """
    Convert bytes of an image to a base64 encoded string.

    Args:
        image_bytes (bytes): Bytes of the image.

    Returns:
        str: Base64 encoded string representation of the image.
    """
    try:
        # Encode the image bytes as base64
        base64_string = base64.b64encode(image_bytes).decode("utf-8")
        return base64_string
    except Exception as error:
        print("Error:", error)
        raise


def get_image_context(image_base64: str) -> str:
    """
    Obtain a detailed textual description of an image using an image recognition API.

    This method sends an image encoded as a base64 string to an image recognition API
    and retrieves a textual description of the image content. The image recognition API
    is configured with a pre-trained model that generates detailed descriptions based
    on the visual features of the image.

    Args:
        image_base64 (str): A base64 encoded string representing the image to be analyzed.

    Returns:
        str: A detailed textual description of the image content generated by the
        image recognition API.

    Raises:
        Exception: An error occurred while processing the image or communicating with
        the image recognition API.

    Note:
        - The 'query' parameter in the API request specifies the type of response expected.
        - The 'image' parameter contains the base64 encoded image data.
        - The 'max_tokens' parameter controls the maximum length of the generated description.

    """
    try:
        data = {
            "query": "Provide a detailed description of the image",
            "image": image_base64,
            "stream": False,
            "max_tokens": 512,
        }

        baseten_api_key = os.environ.get("BASETEN_API_KEY")
        baseten_model_id = os.environ.get("BASETEN_MODEL_ID")

        res = requests.post(
            f"https://model-{baseten_model_id}.api.baseten.co/production/predict",
            headers={"Authorization": f"Api-Key {baseten_api_key}"},
            json=data,
        )

        response_data = res.json()

        return response_data["result"]

    except Exception as error:
        print("Error:", error)
        raise


def extract_text_embedding(chunk: str) -> list:
    """
    Generate text embeddings for a text chunk using a pre-trained model.

    Args:
        chunk (str): The text chunk for which embeddings are to be generated.

    Returns:
        list: A list of embedding vectors representing the text chunk.

    Raises:
        Exception: If an error occurs during the embedding generation process.

    """
    try:
        result = genai.embed_content(
            model="models/embedding-001",
            content=chunk,
            task_type="semantic_similarity",
        )
        return result["embedding"]
    except Exception as error:
        print(f"Error: {error}")
        raise


@celery_instance.task()
def process_image_files(image_files: List[bytes], room_id: str) -> None:
    """
    Process a list of image files to identify and store different frames as recording embeddings.

    This Celery task analyzes a list of image files to identify frames with significant differences
    and stores their corresponding recording embeddings in a MongoDB database. Each image frame is
    compared with its adjacent frame, and if the frame difference exceeds a threshold, the frame
    is considered different and its recording embedding is calculated and stored.

    Args:
        image_files (List[bytes]): A list of image files as bytes.
        room_id (str): The unique identifier of the room associated with the image files.
        hub_id (str): The unique identifier of the hub associated with the image files.

    Returns:
        None: This task does not return any value.

    Raises:
        Exception: An error occurred during image processing or database interaction.

    Note:
        - The 'image_files' parameter should contain a list of image files as bytes.
        - The 'room_id' parameter specifies the unique identifier of the room associated
        with the images.
        - The 'hub_id' parameter specifies the unique identifier of the hub associated with
        the images.
        - The 'soft_time_limit' and 'time_limit' parameters specify the soft and hard time
        limits for task execution.

    """
    try:
        load_dotenv()
        connect(
            db=os.getenv("MONGO_DB"),
            host=os.getenv("MONGO_URI"),
            username=os.getenv("MONGO_USERNAME"),
            password=os.getenv("MONGO_PASSWORD"),
            alias="default",
        )

        different_image_files = []
        image_files_length = len(image_files)

        for i in range(image_files_length - 1):
            frame_difference = calculate_frame_difference(
                image_files[i], image_files[i + 1]
            )

            if frame_difference > 0.3:
                different_image_files.append(image_files[i])

        last_image_frame_difference = calculate_frame_difference(
            image_files[image_files_length - 2], image_files[image_files_length - 1]
        )

        if last_image_frame_difference > 0.3:
            different_image_files.append(image_files[image_files_length - 1])

        recording_embedding_docs = []

        for image in different_image_files:
            image_base64_string = bytes_to_base64(image_bytes=image)
            image_context = get_image_context(image_base64=image_base64_string)
            image_context_embedding = extract_text_embedding(chunk=image_context)

            recording_embedding = RecordingEmbedding(
                room_id=room_id,
                text_content=image_context,
                embeddings=image_context_embedding,
            )

            recording_embedding_docs.append(recording_embedding)

        RecordingEmbedding.objects.insert(recording_embedding_docs, load_bulk=False)

        redis_client = Config.REDIS_CLIENT

        recording_number_of_embeddings_key = (
            f"room_id_{room_id}_number_of_recording_embeddings"
        )

        number_of_recording_embeddings = len(different_image_files)

        with redis_client.pipeline() as pipe:
            try:
                existing_value = pipe.get(recording_number_of_embeddings_key)
                if existing_value:
                    pipe.incrby(
                        recording_number_of_embeddings_key,
                        number_of_recording_embeddings,
                    )
                else:
                    pipe.set(
                        recording_number_of_embeddings_key,
                        number_of_recording_embeddings,
                    )

                pipe.execute()
            except redis.exceptions.RedisError as error:
                print(f"Error updating recording embeddings count: {error}")
            else:
                print(f"Recording embeddings count updated for room_id: {room_id}")

    except Exception as error:
        print(f"error: {error}")


@celery_instance.task(soft_time_limit=60, time_limit=120)
def process_recording_webhook(transcript_txt_presigned_url: str, room_id: str) -> None:
    """
    Process transcript text data from a webhook and store embeddings in the database.

    This Celery task retrieves transcript text data from a presigned URL provided by a webhook.
    The transcript text is divided into chunks, and embeddings are generated for each chunk.
    These embeddings are then stored as RecordingEmbedding documents in the database, associated
    with the corresponding room ID. Additionally, the count of recording embeddings for the
    specified room ID is updated in Redis for tracking purposes.

    Args:
        transcript_txt_presigned_url (str): The presigned URL containing the transcript text data.
        room_id (str): The unique identifier of the room associated with the transcript text.

    Returns:
        None: This task does not return any value.

    Raises:
        Exception: An error occurred during the processing or storage of the transcript text data.

    Notes:
        - The transcript text is retrieved from the presigned URL using the smart_open library.
        - The text content is divided into chunks, each containing up to 1000 characters,
        for embedding generation.
        - Embeddings are generated for each chunk using the extract_text_embedding function.
        - The RecordingEmbedding documents, containing text content and corresponding embeddings,
        are inserted
          into the database using a bulk insertion operation.
        - The count of recording embeddings for the specified room ID is updated in Redis for
        monitoring purposes.

    """
    try:
        load_dotenv()
        connect(
            db=os.getenv("MONGO_DB"),
            host=os.getenv("MONGO_URI"),
            username=os.getenv("MONGO_USERNAME"),
            password=os.getenv("MONGO_PASSWORD"),
            alias="default",
        )

        text_content = None

        with smart_open.open(transcript_txt_presigned_url, "rb") as transcript_file:
            text_content = transcript_file.read().decode("utf-8")

        embedding_docs = []

        num_chunks = len(text_content)
        counter = 0

        for i in range(0, num_chunks, 1000):
            chunk = text_content[i : i + 1000]
            embedding = extract_text_embedding(chunk)
            counter += 1
            embedding_doc = RecordingEmbedding(
                room_id=room_id,
                text_content=chunk,
                embeddings=embedding,
            )
            embedding_docs.append(embedding_doc)

        RecordingEmbedding.objects.insert(embedding_docs, load_bulk=False)

        recording_number_of_embeddings_key = (
            f"room_id_{room_id}_number_of_recording_embeddings"
        )

        redis_client = current_app.redis_client

        with redis_client.pipeline() as pipe:
            try:
                existing_value = pipe.get(recording_number_of_embeddings_key)
                if existing_value:
                    pipe.incrby(recording_number_of_embeddings_key, counter)
                else:
                    pipe.set(recording_number_of_embeddings_key, counter)

                pipe.execute()
            except redis.exceptions.RedisError as error:
                print(f"Error updating recording embeddings count: {error}")
            else:
                print(f"Recording embeddings count updated for room_id: {room_id}")

    except Exception as error:
        print(f"error: {error}")
