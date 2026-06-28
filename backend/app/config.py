from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "pes-elective-management-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    database_url: str = "sqlite:///./elective_management.db"

    class Config:
        env_file = ".env"


settings = Settings()
