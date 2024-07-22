import os
import pyodbc
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

driver = os.getenv("AZURE_SQL_DRIVER")
server = os.getenv("AZURE_SQL_SERVER")
database = os.getenv("AZURE_SQL_DATABASE")
username = os.getenv("AZURE_SQL_USER")
password = os.getenv("AZURE_SQL_PASSWORD")
encrypt = os.getenv("AZURE_SQL_ENCRYPT")
trust_certificate = os.getenv("AZURE_SQL_TRUST_CERTIFICATE")
connection_timeout = os.getenv("AZURE_SQL_CONNECTION_TIMEOUT")

connection_string = (
    f"Driver={driver};"
    f"Server={server};"
    f"Database={database};"
    f"Uid={username};"
    f"Pwd={password};"
    f"Encrypt={encrypt};"
    f"TrustServerCertificate={trust_certificate};"
    f"Connection Timeout={connection_timeout};"
)


def insert_user(username, password_hash, email, created_at, last_login=None):
    conn = None
    cursor = None

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
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def login_auth(username):
    conn = None
    cursor = None
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
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ex
if __name__ == "__main__":
    created_at = datetime.now()
    insert_user('testuser', 'hashed_password', 'test@example.com', created_at)
    login_auth('testuser')
