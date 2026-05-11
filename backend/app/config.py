from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    environment: str = "development"
    base_url: str = "http://localhost:8000"
    secret_key: str = "dev-secret-key"

    model_config = {"env_file": ".env"}


settings = Settings()
