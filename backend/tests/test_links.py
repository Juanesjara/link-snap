import pytest
from httpx import AsyncClient


async def get_token(client: AsyncClient) -> str:
    response = await client.post("/auth/register", json={
        "email": "links@example.com",
        "password": "secret123"
    })
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_create_link(client: AsyncClient):
    token = await get_token(client)
    response = await client.post(
        "/links/",
        json={"original_url": "https://google.com"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "slug" in data
    assert data["original_url"] == "https://google.com/"


@pytest.mark.asyncio
async def test_create_link_unauthenticated(client: AsyncClient):
    response = await client.post("/links/", json={"original_url": "https://google.com"})
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_links(client: AsyncClient):
    token = await get_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    await client.post("/links/", json={"original_url": "https://google.com"}, headers=headers)
    await client.post("/links/", json={"original_url": "https://github.com"}, headers=headers)
    response = await client.get("/links/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


@pytest.mark.asyncio
async def test_redirect(client: AsyncClient):
    token = await get_token(client)
    create = await client.post(
        "/links/",
        json={"original_url": "https://google.com"},
        headers={"Authorization": f"Bearer {token}"},
    )
    slug = create.json()["slug"]
    response = await client.get(f"/{slug}", follow_redirects=False)
    assert response.status_code == 302
    assert "google.com" in response.headers["location"]
