# PostgreSQL Migration Guide using Alembic

Since auto-mutating schemas directly on startup is highly risky in cloud production Postgres environments, this document provides the disciplined roadmap for migrating our database layer from local SQLite to production PostgreSQL using Alembic.

---

## 🛠️ Alembic Migration Setup

Follow these steps to initialize and manage migrations:

### 1. Install Dependencies
Make sure you have `alembic` and `psycopg2-binary` (or `pg8000`) installed:
```bash
.venv/bin/pip install alembic psycopg2-binary
```

### 2. Initialize Alembic
From the repository root, run the Alembic initialization command:
```bash
.venv/bin/alembic init migrations
```
This creates a `migrations/` directory and an `alembic.ini` configuration file.

### 3. Configure Alembic Settings
Modify the generated files to link Alembic to our SQLAlchemy models:

* **In `alembic.ini`**:
  Set the database URL dynamically using an environment variable, or configure it via `env.py`. We recommend leaving the `sqlalchemy.url` placeholder, and reading it dynamically in `migrations/env.py`.
  
* **In `migrations/env.py`**:
  Link our model metadata for autogenerate capability:
  ```python
  from backend.db.session import Base
  import backend.db.models # Ensure all models are imported
  
  target_metadata = Base.metadata
  ```
  
  And override the connection URL with our centralized configuration setting:
  ```python
  from config.settings import get_settings
  
  def get_url():
      return get_settings().database_url
  ```

---

## 🔄 Running Migrations

### 1. Auto-generate the Initial Migration
Run the autogenerate script which compares your Python SQLAlchemy models against the current database schema:
```bash
.venv/bin/alembic revision --autogenerate -m "Initial schema setup"
```

### 2. Apply Migrations to PostgreSQL
Set your production `DATABASE_URL` and run the upgrade command:
```bash
export DATABASE_URL="postgresql://user:password@host:port/dbname"
.venv/bin/alembic upgrade head
```

---

## 📋 Production Deploy Recommendations

1. **Migration Hook on Startup**:
   In production container deployments, execute database upgrades *before* spawning the server process. In your Docker entrypoint or Render/Railway build commands, configure:
   ```bash
   alembic upgrade head && uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```
2. **Never Auto-Create**:
   Ensure `Base.metadata.create_all()` is **only** triggered in SQLite testing environments, keeping production PostgreSQL schemas entirely controlled via Alembic revisions.
