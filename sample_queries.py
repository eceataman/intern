import os
import pyodbc
from dotenv import load_dotenv
from datetime import datetime

# fetch .env vals
load_dotenv()
driver = os.getenv('DATABASE_DRIVER')
server = os.getenv('DATABASE_SERVER')
database = os.getenv('DATABASE_NAME')
username = os.getenv('DATABASE_USERNAME')
password = os.getenv('DATABASE_PASSWORD')

# db connection
connection_string = f"DRIVER={driver};SERVER={server};PORT=1433;DATABASE={database};UID={username};PWD={password}"
conn = pyodbc.connect(connection_string)
cursor = conn.cursor()

def insert_user(username, password_hash, email, created_at, last_login=None):
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO Users (username, password_hash, email, created_at, last_login)
        VALUES (?, ?, ?, ?, ?)
        """
        cursor.execute(insert_query, (username, password_hash, email, created_at, last_login))
        conn.commit()
        print(f"User {username} artık var.")
    except pyodbc.Error as e:
        print(f"An error occurred: {e}")
    finally:
        cursor.close()
        conn.close()

# see if user exists in db
def login_auth(username):
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        select_query = """
        SELECT * FROM Users
        WHERE username = ?
        """
        cursor.execute(select_query, (username))

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

if __name__ == '__main__':
    # chaos
