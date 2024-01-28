# EduHub-AI

EduHub-AI is a platform designed to revolutionize education through the integration of artificial intelligence. It provides innovative features for both teachers and students, creating a seamless learning experience.

[![Build Status](https://app.travis-ci.com/superiorsd10/EduHub-AI.svg?token=MYziQR1XZ8drKKC8d3rb&branch=main)](https://app.travis-ci.com/superiorsd10/EduHub-AI)

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

#### Run the Server

```bash
python run.py
```

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
