from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)
DB = "students.db"

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            department TEXT NOT NULL,
            year INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()

@app.route("/")
def home():
    return render_template("index.html")

@app.get("/api/students")
def get_students():
    conn = get_db()
    rows = conn.execute("SELECT * FROM students ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.post("/api/students")
def add_student():
    data = request.get_json()
    required = ["name", "email", "department", "year"]
    if not data or any(not str(data.get(k, "")).strip() for k in required):
        return jsonify({"error": "All fields are required"}), 400

    try:
        year = int(data["year"])
        if year < 1 or year > 4:
            return jsonify({"error": "Year must be between 1 and 4"}), 400
        conn = get_db()
        cur = conn.execute(
            "INSERT INTO students (name,email,department,year) VALUES (?,?,?,?)",
            (data["name"].strip(), data["email"].strip(), data["department"].strip(), year)
        )
        conn.commit()
        student = conn.execute("SELECT * FROM students WHERE id=?", (cur.lastrowid,)).fetchone()
        conn.close()
        return jsonify(dict(student)), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409
    except ValueError:
        return jsonify({"error": "Year must be a number"}), 400

@app.put("/api/students/<int:student_id>")
def update_student(student_id):
    data = request.get_json()
    required = ["name", "email", "department", "year"]
    if not data or any(not str(data.get(k, "")).strip() for k in required):
        return jsonify({"error": "All fields are required"}), 400

    try:
        year = int(data["year"])
        if year < 1 or year > 4:
            return jsonify({"error": "Year must be between 1 and 4"}), 400
        conn = get_db()
        cur = conn.execute(
            "UPDATE students SET name=?, email=?, department=?, year=? WHERE id=?",
            (data["name"].strip(), data["email"].strip(), data["department"].strip(), year, student_id)
        )
        if cur.rowcount == 0:
            conn.close()
            return jsonify({"error": "Student not found"}), 404
        conn.commit()
        student = conn.execute("SELECT * FROM students WHERE id=?", (student_id,)).fetchone()
        conn.close()
        return jsonify(dict(student))
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 409
    except ValueError:
        return jsonify({"error": "Year must be a number"}), 400

@app.delete("/api/students/<int:student_id>")
def delete_student(student_id):
    conn = get_db()
    cur = conn.execute("DELETE FROM students WHERE id=?", (student_id,))
    conn.commit()
    conn.close()
    if cur.rowcount == 0:
        return jsonify({"error": "Student not found"}), 404
    return jsonify({"message": "Student deleted successfully"})

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
