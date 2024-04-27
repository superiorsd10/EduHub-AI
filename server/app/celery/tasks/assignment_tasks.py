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

import base64
from datetime import datetime
import os
import json
from typing import List
from app.celery.celery import celery_instance
from app.models.assignment import Assignment
from app.models.hub import Hub, Assignment as EmbeddedAssignment
from bson import ObjectId
from config.config import Config
from dotenv import load_dotenv
import requests


def generate_response_llama(
    system_prompt: str,
    user_prompt: str,
) -> str:
    """
    Generate a response using the Meta-Llama-3-70B-Instruct model.

    This function sends a request to the Llama API to generate a response based on
    the provided system and user prompts using the Meta-Llama-3-70B-Instruct model.

    Args:
        system_prompt (str): The system prompt to provide context for the response.
        user_prompt (str): The user prompt to generate a response for.

    Returns:
        str: The generated response based on the provided prompts.

    Raises:
        Exception: If an error occurs during the request or response processing.

    Note:
        Ensure that the LLAMA_AUTH_HEADER environment variable is properly configured
        with the authorization header required to access the Llama API.

        The 'model' parameter in llama_data specifies the model to use for generating
        the response. Adjust it accordingly if a different model is desired.

        The 'stream', 'penalty', and 'max_tokens' parameters control various aspects
        of the response generation process. Modify them as needed based on specific
        requirements or performance considerations.
    """
    try:
        load_dotenv()

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
        response_content = response_json["choices"][0]["message"]["content"]
        return response_content

    except Exception as error:
        print(f"error: {error}")
        raise


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
        Questions (mentioning the number of points with each question at the end)

        Questions should follow a numbered ordered list.

        Create a comprehensive and challenging assignment that assesses the student's understanding of the topics. Ensure the questions are clear, concise, and relevant to the topics.
        """

        generated_assignment_string = generate_response_llama(
            system_prompt, user_prompt
        )
        return difficulty, generated_assignment_string

    except Exception as error:
        print(f"error: {error}")
        raise


def modify_assignment_llama(
    changeable_assignment: str,
    changes_prompt: str,
    assignment_difficulty: str,
) -> str:
    """
    Modify an existing assignment based on user-specified changes.

    This function takes an existing assignment, along with the prompt describing the changes
    to be made, and the desired difficulty level for the modified assignment.
    It then utilizes the Meta-Llama language model to generate a revised version of the
    assignment that incorporates the requested changes while maintaining coherence and clarity.

    Args:
        changeable_assignment (str): The existing assignment that needs to be modified.
        changes_prompt (str): A prompt describing the changes to be made to the assignment.
        assignment_difficulty (str): The desired difficulty level of the modified assignment.

    Returns:
        str: The revised version of the assignment incorporating the requested changes.

    Raises:
        Exception: If an error occurs during the modification process.

    """
    try:
        system_prompt = """
        Modify the existing assignment to incorporate the user's requested changes.

        Revise the assignment to reflect the desired modifications while maintaining coherence and clarity.

        Maintain the whole assignment format and difficulty as well as before.
        Just make changes in the questions as per user's instructions.
        """

        user_prompt = f"""
        Revise the following assignment according to my instructions:

        {changeable_assignment}

        I want to make the following changes: {changes_prompt}.

        Please modify the assignment to incorporate these changes and provide the revised version while
        maintaining the overall format and {assignment_difficulty} assignment difficulty level.
        """

        modified_assignment_string = generate_response_llama(system_prompt, user_prompt)
        return modified_assignment_string

    except Exception as error:
        print(f"error: {error}")
        raise


def generate_assignment_answer_llama(assignment: str) -> str:
    """
    Generate answers for assignment questions using the Meta-Llama-3-70B-Instruct model.

    This function generates answers for assignment questions by providing system and user
    prompts to the Meta-Llama-3-70B-Instruct model. The system prompt provides context
    about the task, while the user prompt contains the assignment questions formatted in
    markdown, latex, and mermaid (for diagrams). The generated answers maintain the same
    formatting as the input questions.

    Args:
        assignment (str): The assignment questions formatted in markdown, latex, and mermaid.

    Returns:
        str: The generated answers to the assignment questions, maintaining the same format.

    Raises:
        Exception: If an error occurs during the response generation process.

    Note:
        Ensure that the generate_response_llama function is properly configured to handle
        the system and user prompts and interact with the Meta-Llama-3-70B-Instruct model.
        Adjust the system prompt and user prompt to provide appropriate context and input
        for the response generation.

        The assignment questions should be formatted correctly to ensure accurate responses.
        The generated answers will maintain the same formatting as the input questions,
        including markdown, latex, and mermaid syntax.
    """
    try:
        system_prompt = """
        This system is designed to assist with answering assignment questions.
        The assignment questions are formatted in markdown, latex, and mermaid (for diagrams).
        The system should provide clear and concise answers to each question.

        For single correct choice type questions, provide the correct option with the answer.
        For multiple correct choice type questions, provide all correct options with answers.
        For numerical type questions, provide the correct answer without explanation.
        For descriptive type questions, provide a detailed answer.
        """

        user_prompt = f"""
        Please answer the following assignment questions:

        {assignment}

        Note: The assignment questions will be provided, and the system should respond
        with the answers to each question in the format specified above maintaining
        the markdown, latex and mermaid format.
        """

        assignment_answer = generate_response_llama(system_prompt, user_prompt)
        return assignment_answer

    except Exception as error:
        print(f"error: {error}")
        raise


def decode_base64_to_objectid(base64_encoded: str) -> ObjectId:
    """
    Decodes a base64 encoded string and converts it to an ObjectId.

    Args:
        base64_encoded (str): The base64 encoded string to decode.

    Returns:
        ObjectId: The decoded ObjectId.
    """
    decoded_bytes = base64.b64decode(base64_encoded)
    hex_string = decoded_bytes.decode("utf-8")
    object_id = ObjectId(hex_string)
    return object_id


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


@celery_instance.task(soft_time_limit=120, time_limit=180)
def process_assignment_changes(
    generate_assignment_id: str,
    changes_prompt: str,
    assignment_difficulty: str,
) -> None:
    """
    Process changes to an assignment generated by the Meta-Llama model.

    This Celery task retrieves the assignment data associated with the given generate_assignment_id
    from Redis, modifies the assignment based on the specified changes prompt and
    desired difficulty level, and updates the Redis key with the modified assignment data.

    Args:
        generate_assignment_id (str): The unique identifier of the generated assignment.
        changes_prompt (str): A prompt describing the changes to be made to the assignment.
        assignment_difficulty (str): The desired difficulty level of the modified assignment.

    Raises:
        Exception: If an error occurs during the processing of assignment changes.

    """
    try:
        redis_client = Config.REDIS_CLIENT
        generate_assignment_key = f"generate_assignment_id_{generate_assignment_id}"

        assignments_dict_data = redis_client.get(generate_assignment_key)

        if assignments_dict_data:
            assignments_dict = json.loads(assignments_dict_data)
            changeable_assignment = assignments_dict[assignment_difficulty]
            changed_assignment = modify_assignment_llama(
                changeable_assignment,
                changes_prompt,
                assignment_difficulty,
            )

            assignments_dict[assignment_difficulty] = changed_assignment
            assignments_dict_data = json.dumps(assignments_dict)
            redis_client.set(generate_assignment_key, assignments_dict_data)
            redis_client.publish(generate_assignment_key, assignments_dict_data)
        else:
            print("Assignment data not found!")

    except Exception as error:
        print(f"error: {error}")
        raise


@celery_instance.task(soft_time_limit=120, time_limit=180)
def process_create_assignment_using_ai(
    generate_assignment_id: str,
    hub_id: str,
    title: str,
    instructions: str,
    total_points: int,
    question_points: List,
    due_datetime: datetime,
    topic: str,
    automatic_grading_enabled: bool,
    automatic_feedback_enabled: bool,
    plagiarism_checker_enabled: bool,
) -> None:
    """
    Process to create assignments using an AI model.

    Args:
        generate_assignment_id (str): The ID associated with generating the assignment.
        hub_id (str): The ID of the hub where the assignment will be created.
        title (str): The title of the assignment.
        instructions (str): The instructions for the assignment.
        total_points (int): The total points of the assignment.
        question_points (List): The points associated with each question in the assignment.
        due_datetime (datetime): The due date and time for the assignment.
        topic (str): The topic of the assignment.
        automatic_grading_enabled (bool): Indicates whether automatic grading is enabled.
        automatic_feedback_enabled (bool): Indicates whether automatic feedback is enabled.
        plagiarism_checker_enabled (bool): Indicates whether plagiarism checker is enabled.

    Returns:
        None: This function does not return anything.

    Raises:
        Exception: If any error occurs during the execution of the task.

    """
    try:
        redis_client = Config.REDIS_CLIENT
        generate_assignment_key = f"generate_assignment_id_{generate_assignment_id}"
        assignments_dict_data = redis_client.get(generate_assignment_key)

        if assignments_dict_data:
            assignments_dict = json.loads(assignments_dict_data)
            embedded_assignment_dict = {}
            hub_object_id = decode_base64_to_objectid(base64_encoded=hub_id)

            for difficulty_level, assignment in assignments_dict.items():
                assignment_answer = generate_assignment_answer_llama(assignment)

                new_assignment = Assignment(
                    hub_id=hub_object_id,
                    title=title,
                    difficulty=difficulty_level,
                    instructions=instructions,
                    total_points=total_points,
                    question=assignment,
                    answer=assignment_answer,
                    question_points=question_points,
                    due_datetime=due_datetime,
                    topic=topic,
                    automatic_grading_enabled=automatic_grading_enabled,
                    automatic_feedback_enabled=automatic_feedback_enabled,
                    plagiarism_checker_enabled=plagiarism_checker_enabled,
                )
                new_assignment.save()
                Hub.objects(id=hub_object_id).update_one(push__topics=topic)

                embedded_assignment = EmbeddedAssignment(
                    assignment_id=new_assignment.id,
                    title=title,
                    total_points=total_points,
                    topic=topic,
                    due_datetime=due_datetime,
                )
                embedded_assignment_dict[difficulty_level] = embedded_assignment

            Hub.objects(id=hub_object_id).update_one(
                push__assignments=embedded_assignment_dict
            )

            cache_paginated_key = f"hub_{hub_object_id}_paginated_page_1"
            redis_client.delete(cache_paginated_key)

            # students_assignment_marks = (
            #     Hub.objects(id=hub_object_id).only("students_assignment_marks").first()
            # )

            # integrate ml model
            predicted_difficulty_level = ["easy", "medium", "hard"]

            Hub.objects(id=hub_id).update_one(
                set__assignments_difficulty_level=predicted_difficulty_level
            )

        else:
            print("Assignment data not found!")
    except Exception as error:
        print(f"error: {error}")
        raise
