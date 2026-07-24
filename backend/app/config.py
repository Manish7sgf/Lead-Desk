import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "leaddesk_db"
    
    SECRET_KEY: str = "leaddesk_mini_super_secret_jwt_key_2026_digital_heroes"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"
    
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

settings = Settings()
