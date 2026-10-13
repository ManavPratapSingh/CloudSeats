from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "CloudSeats API"
    database_url: str = "postgresql+psycopg://cloudseats:cloudseats@postgres:5432/cloudseats"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
