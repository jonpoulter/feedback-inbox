from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Category = Literal["bug", "idea", "process", "other"]
Status = Literal["new", "reviewed"]
StatusFilter = Literal["new", "reviewed", "all"]
CategoryFilter = Category | Literal["all"]


class FeedbackItemCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1)
    category: Category

    @field_validator("title", "body", mode="before")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value


class FeedbackItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    body: str
    category: Category
    status: Status
    created_at: datetime


class FeedbackStats(BaseModel):
    total: int
    reviewed: int
    percent_reviewed: int
