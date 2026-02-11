#!/usr/bin/env python3
"""
generate_products.py

Usage:
  python generate_products.py --count 5000 --output products.csv --seed 42

Generates products CSV with columns:
id,sku,name,category_id,category_name,price,shelf_space_meters,store_id,created_at,updated_at
"""
import csv
import random
import argparse
from datetime import datetime, timedelta

def iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%S")

def gen_products(count, categories=100, stores=(1,2,3), seed=None, start_date_days=365):
    rnd = random.Random(seed)
    now = datetime.utcnow()
    for i in range(1, count+1):
        cid = rnd.randint(1, categories)
        sku = f"PK-PROD-{i:05d}"
        name = f"Category {cid} Product {i}"
        category_name = f"Category {cid}"
        # price in PKR-like range (2 decimals)
        price = round(rnd.uniform(50.0, 2000.0), 2)
        shelf_space = round(rnd.uniform(0.2, 2.5), 2)
        store_id = rnd.choice(stores)
        # random created_at within last `start_date_days` days
        created_at = now - timedelta(days=rnd.randint(0, start_date_days), seconds=rnd.randint(0, 86400))
        updated_at = created_at + timedelta(days=rnd.randint(0,30), seconds=rnd.randint(0,86400))
        yield {
            "id": i,
            "sku": sku,
            "name": name,
            "category_id": cid,
            "category_name": category_name,
            "price": f"{price:.2f}",
            "shelf_space_meters": f"{shelf_space:.2f}",
            "store_id": store_id,
            "created_at": iso(created_at),
            "updated_at": iso(updated_at),
        }

def main():
    parser = argparse.ArgumentParser(description="Generate products CSV.")
    parser.add_argument("--count", type=int, default=5000, help="Number of products (default 5000)")
    parser.add_argument("--categories", type=int, default=100, help="Number of categories (default 100)")
    parser.add_argument("--output", type=str, default="products.csv", help="Output CSV path")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--stores", type=str, default="1,2,3", help="Comma-separated store ids")
    args = parser.parse_args()

    stores = tuple(int(s.strip()) for s in args.stores.split(",") if s.strip())

    with open(args.output, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "id","sku","name","category_id","category_name","price",
            "shelf_space_meters","store_id","created_at","updated_at"
        ])
        writer.writeheader()
        for row in gen_products(args.count, categories=args.categories, stores=stores, seed=args.seed):
            writer.writerow(row)

    print(f"Generated {args.count} products to {args.output}")

if __name__ == "__main__":
    main()