from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    environment: str = "development"
    base_url: str = "http://localhost:8000"
    secret_key: str = "dev-secret-key"
    database_url: str = "sqlite+aiosqlite:///./linksnap.db"

    model_config = {"env_file": ".env"}


settings = Settings()
