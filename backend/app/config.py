from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    environment: str = "development"
    base_url: str = "http://localhost:8000"
    secret_key: str = "dev-secret-key"
    database_url: str = "sqlite+aiosqlite:///./linksnap.db"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = {"env_file": ".env"}


settings = Settings()
