from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    mongodb_uri: str
    database_name: str = "form_builder"
    jwt_secret: str
    access_token_expire_minutes: int = 60
    cors_origins: str = "http://localhost:5173"
    public_form_base_url: str = "http://localhost:5173/form"


settings = Settings()
