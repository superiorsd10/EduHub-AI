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