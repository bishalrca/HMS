import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
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
        
        # Check if database 'hms' exists (case-insensitive check)
        cursor.execute("SELECT datname FROM pg_catalog.pg_database WHERE LOWER(datname) = LOWER(%s);", (db_name,))
        result = cursor.fetchone()
        
        if not result:
            print(f"Database '{db_name}' does not exist yet. Creating database '{db_name}'...")
            cursor.execute(f'CREATE DATABASE "{db_name.lower()}";')
            print(f" SUCCESS: Database '{db_name.lower()}' created successfully!")
        else:
            actual_name = result[0]
            print(f" SUCCESS: Database '{actual_name}' already exists on PostgreSQL server!")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f" ERROR connecting to PostgreSQL: {e}")

if __name__ == '__main__':
    create_database()
