from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from user_agents import parse as parse_ua

from app.database import get_db
from app.models.click import Click
from app.models.link import Link

router = APIRouter(tags=["redirect"])


@router.get("/{slug}", include_in_schema=False)
async def redirect(slug: str, request: Request, db: AsyncSession = Depends(get_db)):
    link = await db.scalar(select(Link).where(Link.slug == slug))
    if not link:
        raise HTTPException(status_code=404, detail="Link no encontrado")

    ua = parse_ua(request.headers.get("user-agent", ""))
    referrer = request.headers.get("referer")

    if ua.is_mobile:
        device = "mobile"
    elif ua.is_tablet:
        device = "tablet"
    else:
        device = "desktop"

    click = Click(
        link_id=link.id,
        device=device,
        browser=ua.browser.family,
        referrer=referrer,
    )
    db.add(click)
    await db.commit()

    return RedirectResponse(url=link.original_url, status_code=302)
