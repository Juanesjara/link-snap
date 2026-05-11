import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.config import settings
from app.database import get_db
from app.models.click import Click
from app.models.link import Link
from app.models.user import User
from app.schemas.link import LinkCreate, LinkResponse

router = APIRouter(prefix="/links", tags=["links"])


def _build_response(link: Link, total_clicks: int) -> LinkResponse:
    return LinkResponse(
        id=link.id,
        slug=link.slug,
        original_url=str(link.original_url),
        title=link.title,
        short_url=f"{settings.base_url}/{link.slug}",
        created_at=link.created_at,
        total_clicks=total_clicks,
    )


@router.post("/", response_model=LinkResponse, status_code=status.HTTP_201_CREATED)
async def create_link(
    body: LinkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    slug = secrets.token_urlsafe(6)
    while await db.scalar(select(Link).where(Link.slug == slug)):
        slug = secrets.token_urlsafe(6)

    link = Link(
        slug=slug,
        original_url=str(body.original_url),
        title=body.title,
        owner_id=current_user.id,
    )
    db.add(link)
    await db.commit()
    await db.refresh(link)

    return _build_response(link, total_clicks=0)


@router.get("/", response_model=list[LinkResponse])
async def list_links(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Link).where(Link.owner_id == current_user.id))
    links = result.scalars().all()

    click_counts = {}
    for link in links:
        count = await db.scalar(select(func.count()).where(Click.link_id == link.id))
        click_counts[link.id] = count or 0

    return [_build_response(link, click_counts[link.id]) for link in links]


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_link(
    link_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    link = await db.scalar(select(Link).where(Link.id == link_id, Link.owner_id == current_user.id))
    if not link:
        raise HTTPException(status_code=404, detail="Link no encontrado")

    await db.delete(link)
    await db.commit()
