from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class FieldSchema(BaseModel):
    id: str
    type: str
    label: str
    name: str
    placeholder: str | None = None
    description: str | None = None
    required: bool = False
    width: Literal[25, 33, 50, 66, 75, 100] = 100
    order: int
    options: list[str] | None = None


class RowSchema(BaseModel):
    id: str
    fields: list[FieldSchema]


class SectionSchema(BaseModel):
    id: str
    title: str
    description: str | None = None
    order: int
    rows: list[RowSchema]


class HeaderSchema(BaseModel):
    title: str
    subtitle: str | None = None
    description: str | None = None
    logo: str | None = None
    alignment: Literal["left", "center", "right"] = "center"


class FormSchema(BaseModel):
    id: str | None = Field(default=None, alias="_id")
    name: str
    slug: str
    description: str | None = None
    status: Literal["draft", "published", "unpublished"] = "draft"
    version: int = 1
    header: HeaderSchema
    sections: list[SectionSchema]
    created_at: datetime | None = None
    updated_at: datetime | None = None
    published_at: datetime | None = None
    expires_at: datetime | None = None

    model_config = {"populate_by_name": True}


class PublishFormRequest(BaseModel):
    enable_expiry: bool = False
    expiry_value: int | None = None
    expiry_unit: Literal["minutes", "hours", "days", "weeks"] | None = None
