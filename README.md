# Student Management System - CRUD Web Application

A complete beginner-friendly CRUD mini web application built with Flask, SQLite, HTML, CSS and JavaScript.

## Features
- Create student records
- Read/display records
- Update records
- Delete records
- Search students
- Form validation
- SQLite database
- Responsive UI
- REST API endpoints

## Project Structure
```text
student_management_crud/
├── app.py
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

## Run Locally

### 1. Install Python
Use Python 3.10 or newer.

### 2. Open the project folder
```bash
cd student_management_crud
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the application
```bash
python app.py
```

### 5. Open in browser
```text
http://127.0.0.1:5000
```

The SQLite database `students.db` will be created automatically.

## CRUD API

GET `/api/students` - Read all students

POST `/api/students` - Create a student

PUT `/api/students/<id>` - Update a student

DELETE `/api/students/<id>` - Delete a student

## Render Deployment

Create a new Web Service on Render and connect this project repository.

Build Command:
```text
pip install -r requirements.txt
```

Start Command:
```text
gunicorn app:app
```

Note: Render's filesystem is not intended for permanent SQLite storage on typical deployments. For a persistent production database, use a managed PostgreSQL database.
