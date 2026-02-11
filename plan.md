# Shelf IQ Backend Integration Plan (FastAPI + SQLite)

## 1) Goals & Scope
- Replace all mock data with real database-backed data.
- Backend-only calculations for analytics.
- JWT authentication with refresh tokens.
- SQLite for MVP with a clear upgrade path to Postgres.
- Frontend integrates via API calls (no local mock logic).

## 2) Architecture Overview
### 2.1 FastAPI Project Structure
```
backend/
  app/
    main.py
    core/
      config.py
      security.py
      logging.py
    db/
      session.py
      base.py
      migrations/
    models/
      user.py
      store.py
      category.py
      product.py
      sale.py
      shelf_space.py
      traffic_zone.py
      import_job.py
      analytics_result.py
    schemas/
      auth.py
      user.py
      category.py
      product.py
      sale.py
      shelf_space.py
      traffic_zone.py
      analytics.py
      import_job.py
      common.py
    services/
      auth_service.py
      user_service.py
      catalog_service.py
      sales_service.py
      analytics_service.py
      import_service.py
      heatmap_service.py
    routers/
      auth.py
      users.py
      categories.py
      products.py
      sales.py
      shelf_space.py
      traffic.py
      analytics.py
      imports.py
    tasks/
      import_tasks.py
    utils/
      csv_parser.py
      excel_parser.py
      validators.py
      pagination.py
    tests/
      test_auth.py
      test_analytics.py
      test_imports.py
```

### 2.2 Runtime Stack
- FastAPI + Uvicorn
- SQLAlchemy 2.x + Alembic
- Pydantic v2 schemas
- SQLite for MVP; compatible with Postgres
- Background jobs via FastAPI BackgroundTasks (MVP) and upgrade to Celery/RQ later

## 3) Database Schema (SQLite)
### 3.1 Tables
**users**
- id (PK)
- email (unique, indexed)
- password_hash
- full_name
- role (admin/analyst)
- is_active
- created_at
- updated_at

**categories**
- id (PK)
- name (unique)
- description
- created_at
- updated_at

**products**
- id (PK)
- sku (unique, indexed)
- name
- category_id (FK categories.id)
- price
- shelf_space_meters
- store_id (FK stores.id)
- created_at
- updated_at

**sales**
- id (PK)
- product_id (FK products.id)
- store_id (FK stores.id)
- date
- units_sold
- revenue
- created_at

**stores**
- id (PK)
- name
- address
- city
- state
- country
- created_at
- updated_at

**traffic_zones** (store_locations)
- id (PK)
- store_id (FK stores.id)
- zone_name
- x
- y
- traffic_score
- created_at

**shelf_space**
- id (PK)
- store_id (FK stores.id)
- category_id (FK categories.id)
- current_meters
- updated_at

**imports**
- id (PK)
- user_id (FK users.id)
- type (products|sales|categories|traffic|shelf_space)
- status (queued|processing|failed|completed)
- original_filename
- total_rows
- processed_rows
- error_count
- error_report_path
- created_at
- updated_at

**analytics_results**
- id (PK)
- store_id (FK stores.id)
- type (tail|space|heatmap)
- date_range_start
- date_range_end
- payload_json
- created_at

### 3.2 Indexes
- products.sku, sales.date, sales.product_id, sales.store_id
- traffic_zones.store_id
- shelf_space.store_id + category_id

## 4) Calculation Logic Ownership (Backend-Only)
- Tail Analysis: classify core/average/tail by revenue contribution and threshold rules.
- Space Elasticity: recommended meters per category based on revenue share and constraints.
- Heatmap: performance levels by combining traffic_score and sales performance by zone.

Frontend receives computed results only.

## 5) Data Contracts (Request/Response)
### 5.1 Tail Analysis
**Request**
- GET /analytics/tail?store_id&date_start&date_end&category_id&search

**Response**
```
{
  "summary": {
    "total_skus": 1200,
    "core_pct": 0.18,
    "average_pct": 0.32,
    "tail_pct": 0.50,
    "tail_sales_share": 0.12
  },
  "table": [
    {
      "sku": "SKU-001",
      "product_name": "Product A",
      "category": "Beverages",
      "sales_pct": 0.4,
      "classification": "core"
    }
  ],
  "chart": {
    "core_sales_share": 0.68,
    "average_sales_share": 0.20,
    "tail_sales_share": 0.12
  }
}
```

### 5.2 Space Elasticity
**Request**
- GET /analytics/space?store_id&date_start&date_end

**Response**
```
{
  "table": [
    {
      "category": "Beverages",
      "sales_pct": 0.22,
      "current_meters": 42.0,
      "recommended_meters": 48.0
    }
  ],
  "chart": {
    "current": [{"category":"Beverages","meters":42}],
    "recommended": [{"category":"Beverages","meters":48}]
  }
}
```

### 5.3 Heatmap
**Request**
- GET /analytics/heatmap?store_id&date_start&date_end

**Response**
```
{
  "zones": [
    {
      "zone_name": "A1",
      "x": 1,
      "y": 3,
      "traffic_score": 0.85,
      "performance": "high",
      "color": "blue"
    }
  ]
}
```

## 6) API Endpoints
### 6.1 Auth
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/register
- GET /auth/me

### 6.2 Catalog & Sales
- GET /categories
- POST /categories
- GET /products
- POST /products
- GET /sales
- POST /sales

### 6.3 Analytics
- GET /analytics/tail
- GET /analytics/space
- GET /analytics/heatmap

### 6.4 Import
- POST /imports (file upload: CSV/Excel)
- GET /imports/{id}
- GET /imports/{id}/errors

## 7) Import Flow
1. Frontend uploads CSV/Excel to /imports with type.
2. Backend validates schema and enqueues processing.
3. Background processing parses file, validates rows, and inserts into DB.
4. Errors are collected into a report file and status updated.
5. Frontend polls /imports/{id} for status and displays errors if any.

Validation includes:
- Required columns
- Data type checks
- Foreign key checks (category/product/store)
- Duplicate SKU detection

## 8) Frontend Integration Mapping
- [src/pages/TailAnalysis.tsx](src/pages/TailAnalysis.tsx) -> GET /analytics/tail
- [src/pages/SpaceElasticity.tsx](src/pages/SpaceElasticity.tsx) -> GET /analytics/space
- [src/pages/Heatmap.tsx](src/pages/Heatmap.tsx) -> GET /analytics/heatmap
- [src/pages/DataImport.tsx](src/pages/DataImport.tsx) -> POST /imports, GET /imports/{id}
- [src/pages/Login.tsx](src/pages/Login.tsx) -> POST /auth/login
- [src/pages/Signup.tsx](src/pages/Signup.tsx) -> POST /auth/register
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) -> JWT handling + refresh
- [src/contexts/DataContext.tsx](src/contexts/DataContext.tsx) -> central data fetching

## 9) Migration Plan (Mock to API)
1. Remove mock seeds from [src/data/mockData.ts](src/data/mockData.ts).
2. Replace mock data usage in [src/contexts/DataContext.tsx](src/contexts/DataContext.tsx) with API fetches.
3. Replace mock auth logic in [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) with JWT flows.
4. Update analytics pages to use API responses only.
5. Update export flows to use API data.

## 10) Caching & Performance
- Cache analytics results by store + date range in analytics_results.
- TTL-based cache invalidation on new sales imports.
- Index sales by date + product_id for fast aggregation.

## 11) Deployment Notes (FastAPI + SQLite)
- SQLite file stored in backend/data/shelfiq.db.
- Run Alembic migrations on deploy.
- Use Uvicorn with 2-4 workers for MVP.
- For scaling: migrate to Postgres by swapping DB URL and running migrations.

## Further Considerations
- Auth approach: JWT with refresh tokens.
- Analytics computed only in backend.
- SQLite chosen for MVP, with upgrade path to Postgres.
