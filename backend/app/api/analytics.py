from datetime import datetime, timedelta, UTC

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.click import Click
from app.models.link import Link
from app.models.user import User
from app.schemas.analytics import BreakdownItem, ClicksPerDay, LinkAnalytics

router = APIRouter(prefix="/links", tags=["analytics"])


@router.get("/{link_id}/analytics", response_model=LinkAnalytics)
async def get_link_analytics(
    link_id: int,
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = await db.scalar(select(Link).where(Link.id == link_id, Link.owner_id == current_user.id))
    if not link:
        raise HTTPException(status_code=404, detail="Link no encontrado")

    since = datetime.now(UTC) - timedelta(days=days)

    total = await db.scalar(
        select(func.count()).where(Click.link_id == link_id)
    ) or 0

    rows = await db.execute(
        select(func.date(Click.clicked_at), func.count())
        .where(Click.link_id == link_id, Click.clicked_at >= since)
        .group_by(func.date(Click.clicked_at))
        .order_by(func.date(Click.clicked_at))
    )
    clicks_per_day = [ClicksPerDay(date=str(row[0]), clicks=row[1]) for row in rows]

    async def breakdown(column) -> list[BreakdownItem]:
        rows = await db.execute(
            select(column, func.count())
            .where(Click.link_id == link_id, Click.clicked_at >= since, column.isnot(None))
            .group_by(column)
            .order_by(func.count().desc())
        )
        return [BreakdownItem(label=str(row[0]), clicks=row[1]) for row in rows]

    return LinkAnalytics(
        total_clicks=total,
        clicks_per_day=clicks_per_day,
        by_device=await breakdown(Click.device),
        by_browser=await breakdown(Click.browser),
        by_referrer=await breakdown(Click.referrer),
    )
