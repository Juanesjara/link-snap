import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "secret123"
    })
    assert response.status_code == 201
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload = {"email": "dup@example.com", "password": "secret123"}
    await client.post("/auth/register", json=payload)
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post("/auth/register", json={"email": "login@example.com", "password": "secret123"})
    response = await client.post("/auth/login", json={"email": "login@example.com", "password": "secret123"})
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post("/auth/register", json={"email": "wrong@example.com", "password": "secret123"})
    response = await client.post("/auth/login", json={"email": "wrong@example.com", "password": "incorrecta"})
    assert response.status_code == 401
