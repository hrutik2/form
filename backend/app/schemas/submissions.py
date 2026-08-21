from datetime import datetime

from pydantic import BaseModel, Field


class SubmissionCreate(BaseModel):
    data: dict[str, str | list[str]] | None = None


class SubmissionResponse(BaseModel):
    id: str | None = Field(default=None, alias="_id")
    form_id: str
    form_version: int
    data: dict[str, str | list[str]]
    submitted_at: datetime

    model_config = {"populate_by_name": True}
