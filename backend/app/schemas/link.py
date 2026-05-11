from datetime import datetime
from pydantic import BaseModel, HttpUrl


class LinkCreate(BaseModel):
    original_url: HttpUrl
    title: str | None = None


class LinkResponse(BaseModel):
    id: int
    slug: str
    original_url: str
    title: str | None
    short_url: str
    created_at: datetime
    total_clicks: int = 0

    model_config = {"from_attributes": True}
