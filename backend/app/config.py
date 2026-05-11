from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./linksnap.db"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    base_url: str = "http://localhost:8000"
    environment: str = "development"

    model_config = {"env_file": ".env"}


settings = Settings()
