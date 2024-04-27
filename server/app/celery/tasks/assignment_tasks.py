"""
Assignment Generation Module

This module defines functions for generating assignments using the Llama AI model
and processing them within a Celery task. It includes functions for generating
assignments based on specified parameters, decoding base64 encoded strings to
MongoDB ObjectId, and processing assignment generation tasks asynchronously
using Celery.

Functions:
    - generate_assignment_llama: Generates an assignment using the Llama AI model.
    - process_assignment_generation: Processes assignment generation tasks asynchronously.
"""

import os
import json
from typing import List
from app.celery.celery import celery_instance
from config.config import Config
from dotenv import load_dotenv
import requests


def generate_assignment_llama(
    title: str,
    topics_string: str,
    specific_topics: str,
    instructions_for_ai: str,
    types_of_questions_string: str,
    difficulty: str,
    system_prompt: str,
) -> tuple:
    """
    Generate an assignment using the Llama AI model.

    This function generates a comprehensive assignment using the
    Llama AI model based on the provided parameters.
    It constructs a user prompt with the specified title, topics, instructions,
    question types, and difficulty level,
    then sends the prompt to the Llama AI model for completion.
    The generated assignment string is returned along with
    the specified difficulty level as a tuple.

    Args:
        title (str): The title of the assignment.
        topics_string (str): A string containing the topics covered by the assignment.
        specific_topics (str): Specific topics to give special attention to.
        instructions_for_ai (str): Special instructions provided by the teacher.
        types_of_questions_string (str): A string containing the types of questions
        included in the assignment.
        difficulty (str): The difficulty level of the assignment.
        system_prompt (str): System prompt to be included in the AI model input.

    Returns:
        tuple: A tuple containing the difficulty level and the generated assignment string.

    Raises:
        Exception: If an error occurs during assignment generation.

    """
    try:
        load_dotenv()

        user_prompt = f"""
        Generate a comprehensive assignment in Markdown format with the title '{title}'. The assignment should cover the following topics: {topics_string} and give special attention to the specific topics: {"give equal attention to the previously mentioned topics" if specific_topics is None else specific_topics}.

        Follow the special instructions provided by the teacher: {"no special instruction is given by teacher" if instructions_for_ai is None else instructions_for_ai}.

        The assignment should include a mix of question types, specifically:
        {types_of_questions_string}

        Ensure the assignment is at {difficulty} difficulty level.

        When generating the assignment, please format it in Markdown and use LaTeX equations for any mathematical equations.

        If any question includes a diagram, write mermaid code for it inside markdown
        code blocks specifying the mermaid language.

        The assigment format is going to be:
        Topics (h1 heading)
        Question Type (h3 heading)
        Questions

        Questions should follow a numbered ordered list.

        Create a comprehensive and challenging assignment that assesses the student's understanding of the topics. Ensure the questions are clear, concise, and relevant to the topics.
        """

        llama_data = {
            "temperature": 0.8,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "model": "rohan/Meta-Llama-3-70B-Instruct",
            "stream": False,
            "penalty": 0,
            "max_tokens": 900,
        }

        llama_auth_header = os.environ.get("LLAMA_AUTH_HEADER")
        llama_url = "https://proxy.tune.app/chat/completions"
        llama_headers = {
            "Authorization": llama_auth_header,
            "Content-Type": "application/json",
        }

        response = requests.post(
            llama_url,
            headers=llama_headers,
            json=llama_data,
        )

        response_json = response.json()
        generated_assignment_string = response_json["choices"][0]["message"]["content"]

        return difficulty, generated_assignment_string

    except Exception as error:
        print(f"error: {error}")
        raise


@celery_instance.task(soft_time_limit=120, time_limit=180)
def process_assignment_generation(
    title: str,
    topics: List[str],
    specific_topics: str,
    instructions_for_ai: str,
    types_of_questions: dict,
    generate_assignment_id: str,
    assignments_count: int,
) -> None:
    """
    Process assignment generation task asynchronously.

    This function processes assignment generation tasks asynchronously using Celery.
    It generates assignments based on the provided parameters and stores the generated
    assignments in a Redis database identified by the specified hub ID.

    Args:
        title (str): The title of the assignment.
        topics (List[str]): A list of topics covered by the assignment.
        specific_topics (str): Specific topics to give special attention to.
        instructions_for_ai (str): Special instructions provided by the teacher.
        types_of_questions (dict): A dictionary mapping question types to a tuple of
            the number of questions and their point values.
        hub_id (str): The ID of the hub where the assignments will be stored.
        assignments_count (int): The number of assignments to generate.

    Raises:
        Exception: If an error occurs during assignment generation or Redis operations.

    """
    try:
        assignments_dict = {}

        system_prompt = """
        Generate a Markdown-formatted assignment based on the provided variables.
        The assignment should have a clear title, cover the specified topics,
        and include a mix of question types with varying point values.

        Follow the teacher's instructions and give special attention
        to the specific topics.

        Ensure the assignment is at the specified difficulty level
        and format any mathematical equations using LaTeX in Markdown.

        Create a comprehensive and challenging assignment that
        assesses the student's understanding of the topics.
        """

        topics_string = ", ".join(topics)
        types_of_questions_string = ", ".join(
            [
                f"{key}: {value[0]} questions each worth {value[1]} points"
                for key, value in types_of_questions.items()
            ]
        )

        if assignments_count == 1:
            generated_assignment = generate_assignment_llama(
                title=title,
                topics_string=topics_string,
                specific_topics=specific_topics,
                instructions_for_ai=instructions_for_ai,
                types_of_questions_string=types_of_questions_string,
                difficulty="medium",
                system_prompt=system_prompt,
            )
            assignments_dict[generated_assignment[0]] = generated_assignment[1]

        else:
            difficulty_levels = ["easy", "medium", "hard"]
            for difficulty_level in difficulty_levels:
                generated_assignment = generate_assignment_llama(
                    title=title,
                    topics_string=topics_string,
                    specific_topics=specific_topics,
                    instructions_for_ai=instructions_for_ai,
                    types_of_questions_string=types_of_questions_string,
                    difficulty=difficulty_level,
                    system_prompt=system_prompt,
                )
                assignments_dict[generated_assignment[0]] = generated_assignment[1]

        if assignments_dict:
            redis_client = Config.REDIS_CLIENT
            generate_assignment_key = f"generate_assignment_id_{generate_assignment_id}"
            assignments_dict_data = json.dumps(assignments_dict)
            redis_client.set(generate_assignment_key, assignments_dict_data)
            redis_client.publish(generate_assignment_key, assignments_dict_data)
        else:
            print("assignments_dict is None or empty, skipping Redis operations.")

    except Exception as error:
        print(f"error: {error}")
        raise
