# EduHub-AI

EduHub-AI is a platform designed to revolutionize education through the integration of artificial intelligence. It provides innovative features for both teachers and students, creating a seamless learning experience.

![Build Status](https://github.com/superiorsd10/EduHub-AI/actions/workflows/ci.yml/badge.svg)

[![Coverage Status](https://coveralls.io/repos/github/superiorsd10/EduSmart/badge.svg?branch=main)](https://coveralls.io/github/superiorsd10/EduSmart?branch=main)

## Features

- **Automated Assignments:** AI-generated assignments tailored to student performance.
- **Interactive Learning:** Talk to slides, ask questions, and receive real-time feedback.
- **Live Classes:** Conduct live streaming classes with integrated video streaming.
- **AI Quiz Generation:** Create quizzes with AI assistance, adapting difficulty based on performance.
- **Analytics Dashboard:** In-depth performance analytics for students and teachers.
- **Secure and Collaborative:** Join classes through authentication, collaborative group chat, and more.

## How to Set Up

### Client
#### Prerequisites
Make sure you have the following software installed on your machine:
- NodeJS
#### Clone the Repository
```bash
git clone https://github.com/superiorsd10/EduHub-AI.git
cd EduHub-AI
```
#### Install Dependencies
```bash
cd client
npm i
```
#### Set up .env File
1. Create a .env.local file in the root of the client folder.
2. Visit firebase.google.com, create a new project, and copy the credentials.
3. Paste the copied credentials into the .env.local file as follows:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_storage_bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your_measurement_id"

```
#### Firebase Configuration
- Ensure that the SignInWithGoogle and SignInWithEmailAndPassword options are allowed in your Firebase project settings.

#### Run the frontend
```bash
npm run dev
```

### Server

#### Prerequisites

Make sure you have the following software installed on your machine:

- [Python](https://www.python.org/) (3.9 or higher)

#### Clone the Repository

```bash
git clone https://github.com/superiorsd10/EduHub-AI.git
cd EduHub-AI
```

#### Set Up Virtual Environment

Create and activate a virtual environment. Use the following commands based on your operating system:

##### Windows

```bash
cd server
python -m venv venv
.\venv\Scripts\activate
```

##### macOS/Linux

```bash
cd server
python -m venv venv
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Setting Up Environment Variables

```bash
cp .env.example .env
```

#### Run the Server

```bash
python run.py
```

<p align="center">OR</p>

#### Install Docker

Make sure you have Docker installed on your machine. You can download and install Docker from the [official Docker website](https://www.docker.com/).

#### Navigate to Project Directory (Server)

Open your terminal or command prompt and navigate to the server directory of your project.

```bash
cd server
```

#### Setting Up Environment Variables

```bash
cp .env.example .env
```

#### Build Docker Image

Run the following command to build the Docker image for your application:

```bash
docker build -t my-flask-app .
```

Replace `my-flask-app` with the desired name for your Docker image.

#### Run Docker Container

Once the Docker image is built, you can run a Docker container using the following command:

```bash
docker run --env-file .env -p 5000:5000 my-flask-app
```

This command maps port 5000 of the Docker container to port 5000 of your host machine. Replace `my-flask-app` with the name of your Docker image.

#### Access the Server

After running the Docker container, you can access the server by navigating to `http://localhost:5000` in your web browser/Postman/Thunder Client.

---

#### Activating Pre-Commit Hooks

We use [pre-commit](https://pre-commit.com/) to manage and run various hooks to ensure code consistency and quality. Follow these steps to activate the pre-commit hooks in your local environment:

1. **Install pre-commit:**
    Ensure you have pre-commit installed. You can install it using:

    ```bash
    pip install pre-commit
    ```

2. **Set Up Pre-Commit:**
    Run the following command to set up pre-commit:

    ```bash
    pre-commit install
    ```

Now, every time you commit changes (excluding client directory), pre-commit hooks will automatically run. If any issues are found, the hooks will prevent the commit and provide guidance on fixing them.

---

#### Celery Guide

Celery is a distributed task queue framework for Python that allows you to run asynchronous tasks in the background. It's especially useful for executing long-running or resource-intensive tasks outside of the main application flow, improving application responsiveness and scalability.

##### Windows

```bash
pip install celery
```

##### MacOS

```bash
pip install celery
```

Once Celery is installed, you can start the Celery worker process by running the following command from your project directory i.e. `server`:

```bash
celery -A app.celery.celery worker --loglevel=INFO -E
```

---
