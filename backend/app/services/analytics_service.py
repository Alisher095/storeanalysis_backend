from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product
from app.models.sale import Sale
from app.models.shelf_space import ShelfSpace
from app.models.traffic_zone import TrafficZone


def tail_analysis(
    db: Session,
    store_id: int,
    date_start: datetime | None,
    date_end: datetime | None,
    category_id: int | None,
    search: str | None,
) -> dict:
    stmt = (
        select(
            Product.sku,
            Product.name,
            Category.name.label("category"),
            func.sum(Sale.revenue).label("revenue"),
        )
        .join(Sale, Sale.product_id == Product.id)
        .join(Category, Category.id == Product.category_id)
        .where(Sale.store_id == store_id)
    )

    if date_start is not None:
        stmt = stmt.where(Sale.date >= date_start)
    if date_end is not None:
        stmt = stmt.where(Sale.date <= date_end)
    if category_id is not None:
        stmt = stmt.where(Product.category_id == category_id)
    if search:
        like = f"%{search}%"
        stmt = stmt.where((Product.name.ilike(like)) | (Product.sku.ilike(like)))

    stmt = stmt.group_by(Product.id, Category.id)

    rows = db.execute(stmt).all()
    total_revenue = sum(row.revenue or 0 for row in rows)
    total_skus = len(rows)

    if total_revenue == 0 or total_skus == 0:
        return {
            "summary": {
                "total_skus": 0,
                "core_pct": 0,
                "average_pct": 0,
                "tail_pct": 0,
                "tail_sales_share": 0,
            },
            "table": [],
            "chart": {
                "core_sales_share": 0,
                "average_sales_share": 0,
                "tail_sales_share": 0,
            },
        }

    sorted_rows = sorted(rows, key=lambda r: r.revenue or 0, reverse=True)

    cumulative = 0.0
    table = []
    core_count = average_count = tail_count = 0
    core_revenue = average_revenue = tail_revenue = 0.0

    for row in sorted_rows:
        revenue = float(row.revenue or 0)
        sales_pct = revenue / total_revenue
        cumulative += sales_pct

        if cumulative <= 0.7:
            classification = "core"
            core_count += 1
            core_revenue += revenue
        elif cumulative <= 0.9:
            classification = "average"
            average_count += 1
            average_revenue += revenue
        else:
            classification = "tail"
            tail_count += 1
            tail_revenue += revenue

        table.append(
            {
                "sku": row.sku,
                "product_name": row.name,
                "category": row.category,
                "sales_pct": round(sales_pct, 6),
                "classification": classification,
            }
        )

    summary = {
        "total_skus": total_skus,
        "core_pct": round(core_count / total_skus, 6),
        "average_pct": round(average_count / total_skus, 6),
        "tail_pct": round(tail_count / total_skus, 6),
        "tail_sales_share": round(tail_revenue / total_revenue, 6),
    }

    chart = {
        "core_sales_share": round(core_revenue / total_revenue, 6),
        "average_sales_share": round(average_revenue / total_revenue, 6),
        "tail_sales_share": round(tail_revenue / total_revenue, 6),
    }

    return {"summary": summary, "table": table, "chart": chart}


def space_elasticity(
    db: Session,
    store_id: int,
    date_start: datetime | None,
    date_end: datetime | None,
) -> dict:
    sales_stmt = (
        select(Category.name.label("category"), func.sum(Sale.revenue).label("revenue"))
        .join(Product, Product.id == Sale.product_id)
        .join(Category, Category.id == Product.category_id)
        .where(Sale.store_id == store_id)
    )
    if date_start is not None:
        sales_stmt = sales_stmt.where(Sale.date >= date_start)
    if date_end is not None:
        sales_stmt = sales_stmt.where(Sale.date <= date_end)

    sales_stmt = sales_stmt.group_by(Category.id)

    sales_rows = db.execute(sales_stmt).all()
    total_revenue = sum(row.revenue or 0 for row in sales_rows)

    shelf_stmt = (
        select(Category.name.label("category"), func.sum(ShelfSpace.current_meters).label("meters"))
        .join(Category, Category.id == ShelfSpace.category_id)
        .where(ShelfSpace.store_id == store_id)
        .group_by(Category.id)
    )
    shelf_rows = {row.category: float(row.meters or 0) for row in db.execute(shelf_stmt).all()}
    total_current_meters = sum(shelf_rows.values())

    table = []
    current_chart = []
    recommended_chart = []

    for row in sales_rows:
        revenue = float(row.revenue or 0)
        sales_pct = revenue / total_revenue if total_revenue else 0
        current_meters = shelf_rows.get(row.category, 0.0)
        recommended_meters = total_current_meters * sales_pct if total_current_meters else 0.0

        table.append(
            {
                "category": row.category,
                "sales_pct": round(sales_pct, 6),
                "current_meters": round(current_meters, 4),
                "recommended_meters": round(recommended_meters, 4),
            }
        )
        current_chart.append({"category": row.category, "meters": round(current_meters, 4)})
        recommended_chart.append({"category": row.category, "meters": round(recommended_meters, 4)})

    return {"table": table, "chart": {"current": current_chart, "recommended": recommended_chart}}


def heatmap_analysis(
    db: Session,
    store_id: int,
    date_start: datetime | None,
    date_end: datetime | None,
) -> dict:
    zones = db.query(TrafficZone).filter(TrafficZone.store_id == store_id).all()

    result = []
    for zone in zones:
        score = float(zone.traffic_score)
        if score >= 0.7:
            performance = "high"
            color = "blue"
        elif score >= 0.4:
            performance = "average"
            color = "orange"
        else:
            performance = "low"
            color = "red"

        result.append(
            {
                "zone_name": zone.zone_name,
                "x": zone.x,
                "y": zone.y,
                "traffic_score": score,
                "performance": performance,
                "color": color,
            }
        )

    return {"zones": result}
