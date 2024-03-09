"""
Module for processing uploaded files asynchronously and extracting text embeddings.

This module defines a Celery task `process_uploaded_file` that
asynchronously processes uploaded files, extracts text content,
and generates text embeddings. It also provides utility functions
for decoding base64 encoded strings to ObjectId and extracting text
from PDF files.

Tasks:
    process_uploaded_file: Asynchronously processes an uploaded file,
    extracts text content, and generates text embeddings.

Utilities:
    extract_text_from_pdf: Extracts text content from a PDF file.
    extract_text_embedding: Generates text embeddings from text content.

"""

import mimetypes
import io
import os
import math
from uuid import UUID
import fitz
from app.celery.celery import celery_instance
import google.generativeai as genai
from app.models.embedding import Embedding
from mongoengine import connect
from dotenv import load_dotenv
from config.config import Config


def extract_text_from_pdf(file_data: bytes) -> str:
    """
    Extract text content from a PDF file.

    Args:
        file_data (bytes): The binary data of the PDF file.

    Returns:
        str: The extracted text content from the PDF.

    Raises:
        Exception: If an error occurs during PDF processing.

    """
    text = ""
    try:
        # Open the PDF file
        pdf_document = fitz.open(stream=io.BytesIO(file_data), filetype="pdf")

        # Iterate through each page in the PDF
        for page_number in range(len(pdf_document)):
            page = pdf_document.load_page(page_number)

            # Extract text from the page
            text += page.get_text()

        return text

    except Exception as error:
        print(f"Error: {error}")
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


@celery_instance.task
def process_uploaded_file(
    file_data: bytes,
    filename: str,
    hub_id: str,
    post_id: UUID,
    attachment_id: str,
) -> None:
    """
    Asynchronously process an uploaded file, extract text content,
    generate text embeddings, and save them to MongoDB.

    Args:
        file_data (bytes): The binary data of the uploaded file.
        filename (str): The name of the uploaded file.
        hub_id (str): The ID of the hub to which the file belongs.
        post_id (UUID): The UUID of the post to which the file belongs.

    Returns:
        None

    Raises:
        Exception: If an error occurs during file processing or embedding generation.

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
        print("Connected to MongoDB successfully!")

        file_type = mimetypes.guess_type(filename)[0]

        if file_type == "application/pdf":
            extracted_text = extract_text_from_pdf(file_data)

            embedding_docs = []

            num_chunks = len(extracted_text)
            counter = 0

            for i in range(0, num_chunks, 1000):
                chunk = extracted_text[i : i + 1000]
                embedding = extract_text_embedding(chunk)
                counter += 1
                embedding_doc = Embedding(
                    hub_id=hub_id,
                    post_id=post_id,
                    attachment_id=attachment_id,
                    batch_no=counter,
                    text_content=chunk,
                    embeddings=embedding,
                )
                embedding_docs.append(embedding_doc)

            Embedding.objects.insert(embedding_docs, load_bulk=False)
            redis_client = Config.redis_client
            attachment_number_of_embeddings_key = (
                f"attachment_id_{attachment_id}_number_of_embeddings"
            )

            redis_client.set(
                attachment_number_of_embeddings_key, math.ceil(num_chunks / 1000)
            )
        else:
            print("Unsupported File Type")

    except Exception as error:
        print(f"error: {error}")
