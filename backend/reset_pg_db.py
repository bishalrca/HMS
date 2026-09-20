import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def reset_db():
    db_name = os.environ.get('DB_NAME', 'hms')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'admin')
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_port = os.environ.get('DB_PORT', '5432')

    print(f"Connecting to PostgreSQL as user '{db_user}' on {db_host}:{db_port}...")
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Terminate active connections to 'hms'
        print(f"Terminating existing connections to '{db_name}'...")
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{db_name}'
              AND pid <> pg_backend_pid();
        """)

        # Drop database
        print(f"Dropping database '{db_name}'...")
        cursor.execute(f'DROP DATABASE IF EXISTS "{db_name}";')

        # Recreate database
        print(f"Recreating database '{db_name}'...")
        cursor.execute(f'CREATE DATABASE "{db_name}";')
        print(f" SUCCESS: PostgreSQL database '{db_name}' reset clean!")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f" ERROR resetting PostgreSQL database: {e}")

if __name__ == '__main__':
    reset_db()
