import os
import pyodbc
from dotenv import load_dotenv
from datetime import datetime

# environment variables from .env file
load_dotenv()

# db connection
connection_string = os.getenv("AZURE_SQL_CONNECTION_STRING")

def insert_user(username, password_hash, email, created_at, last_login=None):
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO Users (username, pwd_hash, email, created_at, last_login)
        VALUES (?, ?, ?, ?, ?)
        """
        cursor.execute(insert_query, (username, password_hash, email, created_at, last_login))
        conn.commit()
        print(f"User {username} artık var.")
    except pyodbc.Error as e:
        print(f"Exception: {e}")
    finally:
        cursor.close()
        conn.close()

def login_auth(username):
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        select_query = """
        SELECT * FROM Users
        WHERE username = ?
        """
        cursor.execute(select_query, (username,))

        user = cursor.fetchone()

        if user:
            print("user var")
            return True
        else:
            print("user yoh")
            return False

    except pyodbc.Error as e:
        print(f"Exception: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

# ex
if __name__ == "__main__":
    created_at = datetime.now()
    insert_user('testuser', 'hashed_password', 'test@example.com', created_at)
    login_auth('testuser')
