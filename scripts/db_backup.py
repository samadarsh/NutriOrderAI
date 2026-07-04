import os
import shutil
import time
import sys
from datetime import datetime, timedelta

def backup_database():
    # Attempt to load database URL from settings or env var
    # Fallback to local default if settings import fails
    database_url = os.environ.get("DATABASE_URL", "sqlite:///./nutriorder.db")
    try:
        from config.settings import get_settings
        database_url = get_settings().database_url
    except Exception:
        pass

    print("Database backup utility running...")
    print(f"Detected Database URL: {database_url}")

    if not database_url.startswith("sqlite"):
        print("\n[INFO] Postgres/non-SQLite database detected.")
        print("This backup utility only supports local SQLite databases.")
        print("For PostgreSQL or external databases, please:")
        print("  1. Configure automated daily backups on your cloud provider (Render, Railway, Supabase).")
        print("  2. Run 'pg_dump -U username -h host dbname > backup.sql' via CLI.")
        print("Local backup skipped.")
        return 0

    # Extract db filepath from sqlite connection string
    # Connection string format: sqlite:///./path/to/db
    db_file_raw = database_url.replace("sqlite:///", "")
    db_file = os.path.abspath(db_file_raw)

    if not os.path.exists(db_file):
        print(f"[FAIL] SQLite database file not found at: {db_file}")
        return 1

    # Create backups directory in workspace root
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backup_dir = os.path.join(workspace_dir, "backups")
    os.makedirs(backup_dir, exist_ok=True)

    # Generate timestamped backup filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"nutriorder_backup_{timestamp}.db"
    backup_path = os.path.join(backup_dir, backup_filename)

    try:
        shutil.copy2(db_file, backup_path)
        print(f"[OK] Backup created successfully at: {backup_path}")

        # Rotate backups: delete those older than 7 days
        cutoff = datetime.now() - timedelta(days=7)
        deleted_count = 0
        for f in os.listdir(backup_dir):
            if f.startswith("nutriorder_backup_") and f.endswith(".db"):
                f_path = os.path.join(backup_dir, f)
                file_time = datetime.fromtimestamp(os.path.getmtime(f_path))
                if file_time < cutoff:
                    os.remove(f_path)
                    deleted_count += 1

        if deleted_count > 0:
            print(f"[OK] Rotated: deleted {deleted_count} backup files older than 7 days.")

        return 0
    except Exception as e:
        print(f"[FAIL] Failed to copy database backup: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(backup_database())
