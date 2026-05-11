# LinkSnap

Acortador de URLs con dashboard de analytics en tiempo real.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python · FastAPI · PostgreSQL · Redis |
| Frontend | React · TypeScript · Tailwind · Recharts |
| Infra | AWS (EC2 · RDS · S3 · CloudFront) · Terraform |
| DevOps | GitHub Actions · Docker · SonarCloud |

## Estructura del proyecto

```
link-snap/
├── backend/     # API REST con FastAPI
├── frontend/    # SPA con React + TypeScript
├── infra/       # Infraestructura como código (Terraform)
└── .github/     # Pipelines CI/CD
```

## Levantar en local (próximamente)

```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev
```
