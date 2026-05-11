from pydantic import BaseModel


class ClicksPerDay(BaseModel):
    date: str
    clicks: int


class BreakdownItem(BaseModel):
    label: str
    clicks: int


class LinkAnalytics(BaseModel):
    total_clicks: int
    clicks_per_day: list[ClicksPerDay]
    by_device: list[BreakdownItem]
    by_browser: list[BreakdownItem]
    by_referrer: list[BreakdownItem]
