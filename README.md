# LinkSnap

A full-stack URL shortener with a real-time analytics dashboard. Built as a portfolio project to learn modern web development and cloud infrastructure.

---

## What it does

- Shorten any URL and get a unique slug (e.g. `/abc123`)
- Track every click with device, browser, and referrer data
- Visualize click trends over time with charts
- Secure accounts with JWT authentication

---

## Architecture

```
Browser
  │
  ├── https://d3ej2y29wt7sle.cloudfront.net   (frontend)
  │         CloudFront → S3 bucket
  │         React SPA served as static files
  │
  └── https://d3qr8p649qax7n.cloudfront.net   (API)
            CloudFront → EC2 :8000
            FastAPI running in Docker
                  │
                  └── RDS PostgreSQL (private subnet)
```

CloudFront sits in front of both the frontend (S3) and the backend (EC2) to enforce HTTPS and act as a CDN.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, SQLAlchemy 2 (async), Alembic |
| Database | PostgreSQL 16 (AWS RDS) · SQLite for local dev |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4, Recharts |
| Auth | JWT (HS256) via python-jose, bcrypt password hashing |
| Infrastructure | AWS EC2, RDS, S3, CloudFront · Terraform |
| CI/CD | GitHub Actions (pytest + ESLint + Docker deploy) |
| Containerization | Docker (multi-stage builds) |

---

## Project structure

```
link-snap/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (auth, links, analytics, redirect)
│   │   ├── core/         # Security utilities (JWT, bcrypt)
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── config.py     # Settings loaded from environment variables
│   │   ├── database.py   # Async engine and session setup
│   │   └── main.py       # FastAPI app, CORS middleware, router registration
│   ├── tests/            # pytest test suite (async, in-memory SQLite)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/        # Login, Dashboard, Analytics
│   │   ├── services/     # Axios API client with JWT interceptor
│   │   └── main.tsx
│   ├── Dockerfile
│   └── vite.config.ts
├── infra/                # Terraform — all AWS resources defined as code
│   ├── main.tf           # Provider and S3 remote state backend
│   ├── vpc.tf            # VPC, subnets, internet gateway
│   ├── ec2.tf            # Backend server
│   ├── rds.tf            # PostgreSQL database
│   ├── s3.tf             # Frontend bucket + CloudFront distribution
│   └── cloudfront_api.tf # CloudFront distribution for the API
└── .github/
    └── workflows/
        ├── ci.yml        # Runs on every PR: pytest + ESLint + frontend build
        └── cd.yml        # Runs on push to main: deploys backend + frontend
```

---

## Running locally

### Prerequisites
- Python 3.12
- Node.js 20
- Docker (optional)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create a .env file
cp .env.example .env          # or create it manually (see below)

# Start the server
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

**Backend `.env` (local development):**
```env
ENVIRONMENT=development
BASE_URL=http://localhost:8000
SECRET_KEY=any-random-string-for-local-dev
DATABASE_URL=sqlite+aiosqlite:///./linksnap.db
CORS_ORIGINS=http://localhost:5173
```

### Frontend

```bash
cd frontend

npm install

# Create a .env file
echo "VITE_API_URL=http://localhost:8000" > .env.local

npm run dev
# App available at http://localhost:5173
```

### Running tests

```bash
cd backend
pytest tests/ -v
```

---

## Infrastructure (Terraform)

All AWS resources are defined in the `infra/` folder. Terraform state is stored remotely in an S3 bucket.

```bash
cd infra

# Initialize (downloads providers, connects to remote state)
terraform init

# Preview what will be created
terraform plan -var="db_password=yourpassword"

# Create all resources (~10 minutes)
terraform apply -var="db_password=yourpassword"

# Tear everything down
terraform destroy -var="db_password=yourpassword"
```

Resources created: VPC, EC2 t3.micro, RDS PostgreSQL db.t3.micro, S3 bucket, 2 CloudFront distributions.

---

## CI/CD

Every `git push` to `main` triggers two parallel jobs:

**deploy-backend:**
1. SSH into EC2
2. Pull latest code
3. Write `.env` from GitHub Secrets
4. Build Docker image and restart container

**deploy-frontend:**
1. Install Node dependencies
2. Build React app (`VITE_API_URL` injected at build time)
3. Upload to S3 (`aws s3 sync --delete`)
4. Invalidate CloudFront cache

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | Public IP of the EC2 instance |
| `EC2_SSH_KEY` | Private SSH key to access EC2 |
| `DATABASE_URL` | Full PostgreSQL connection string |
| `SECRET_KEY` | Random string used to sign JWT tokens |
| `API_URL` | CloudFront HTTPS URL for the backend |
| `FRONTEND_URL` | CloudFront HTTPS URL for the frontend (used as CORS origin) |
| `AWS_ACCESS_KEY_ID` | IAM credentials for S3/CloudFront access |
| `AWS_SECRET_ACCESS_KEY` | IAM credentials for S3/CloudFront access |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID of the frontend CloudFront distribution (for cache invalidation) |
