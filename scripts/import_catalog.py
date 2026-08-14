#!/usr/bin/env python3
"""Build Leaf Solar's curated catalogue from the public WooCommerce Store API.

Run manually when the merchandising selection or source catalogue changes.
Product records and images are copied into this project so the storefront does
not depend on the legacy WordPress hostname after DNS cutover.
"""
from __future__ import annotations

import html
import io
import json
import re
import urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
API = "https://leafsolar.ng/wp-json/wc/store/v1/products"
OUT = ROOT / "lib" / "catalog.json"
IMAGE_DIR = ROOT / "public" / "images" / "catalog"
CATEGORY_DIR = ROOT / "public" / "images" / "categories"

# A deliberate cross-section of entry, mid-range and premium products in every
# major store category, plus every current solar package.
CURATED_IDS = {
    # TVs
    1119, 1120, 1121, 1125, 1127, 1130, 1131, 1134, 1137, 1140, 1145, 1155,
    # Fridges and freezers
    1190, 1192, 1196, 1200, 1203, 1208, 1212, 1220, 1227, 1231, 1233, 1238, 1243,
    # Air conditioners
    1161, 1165, 1166, 1168, 1170, 1174, 1178, 1180, 1183, 1186,
    # Washers and dryers
    1244, 1246, 1248, 1252, 1255, 1260, 1265, 1269,
    # Kitchen and cooking
    1272, 1283, 1290, 1295, 1302, 1310, 1313, 1315, 1318, 1321, 1323, 1329,
    1338, 1343, 1348, 1449,
    # Fans and cooling
    1380, 1381, 1386, 1388, 1390, 1393,
    # Generators and power
    1371, 1373, 1375, 1378, 1379,
    # Audio
    1399, 1401, 1403, 1407, 1415, 1417, 1422, 1428,
    # Water dispensers and heaters
    1394, 1395, 1396, 1397, 1398,
    # Accessories, monitors, irons and vacuums
    1429, 1430, 1433, 1434, 1435, 1440, 1448,
    # Solar equipment
    1359, 1360, 1361, 1362, 1363, 1364, 1367, 1368, 1369,
    # All 15 solar packages
    *range(1457, 1472),
}

CATEGORY_META = {
    "tvs": ("TVs", "Televisions", "electronics"),
    "fridges-freezers": ("Fridges & Freezers", "Fridges & Freezers", "electronics"),
    "air-conditioners": ("Air Conditioners", "Air Conditioners", "electronics"),
    "washers-dryers": ("Washers & Dryers", "Washers & Dryers", "electronics"),
    "kitchen-cooking": ("Kitchen & Cooking", "Kitchen & Cooking", "electronics"),
    "fans-coolers": ("Fans & Coolers", "Fans & Coolers", "electronics"),
    "generators-power": ("Generators & Power", "Generators & Power", "electronics"),
    "audio-sound": ("Audio & Sound", "Audio & Sound", "electronics"),
    "water-dispensers": ("Water & Dispensers", "Water & Dispensers", "electronics"),
    "accessories": ("Accessories", "Accessories", "electronics"),
    "solar-panels": ("Solar Panels", "Solar Panels", "solar"),
    "inverters": ("Inverters", "Inverters", "solar"),
    "batteries": ("Batteries", "Solar Batteries", "solar"),
    "tubular-packages": ("Tubular Packages", "Tubular Solar", "packages"),
    "lithium-packages": ("Lithium Packages", "Lithium Solar", "packages"),
    "commercial-packages": ("Commercial Packages", "Commercial Solar", "packages"),
    "industrial-packages": ("Industrial Packages", "Industrial Solar", "packages"),
}

CATEGORY_IMAGES = {
    "tvs": "https://i0.wp.com/leafsolar.ng/wp-content/uploads/2026/08/leafsolar-cat-1-tvs-audio.png?w=800&ssl=1",
    "fridges-freezers": "https://i0.wp.com/leafsolar.ng/wp-content/uploads/2026/08/leafsolar-cat-2-fridges.png?w=800&ssl=1",
    "air-conditioners": "https://i0.wp.com/leafsolar.ng/wp-content/uploads/2026/08/leafsolar-cat-3-acs.png?w=800&ssl=1",
    "washers-dryers": "https://i0.wp.com/leafsolar.ng/wp-content/uploads/2026/08/leafsolar-cat-4-washers.png?w=800&ssl=1",
    "kitchen-cooking": "https://i0.wp.com/leafsolar.ng/wp-content/uploads/2026/08/leafsolar-cat-5-kitchen.png?w=800&ssl=1",
    "fans-coolers": "https://i0.wp.com/leafsolar.ng/wp-content/uploads/2026/08/leafsolar-cat-6-fans.png?w=800&ssl=1",
    "solar": "https://i0.wp.com/leafsolar.ng/wp-content/uploads/2026/08/leafsolar-cat-7-solar.png?w=800&ssl=1",
    "generators-power": "https://i0.wp.com/leafsolar.ng/wp-content/uploads/2026/08/leafsolar-cat-8-generators.png?w=800&ssl=1",
}


def fetch_json(url: str):
    request = urllib.request.Request(url, headers={"User-Agent": "LeafSolarCatalogue/1.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.load(response)


def fetch_bytes(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 LeafSolarCatalogue/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def plain(value: str) -> str:
    value = re.sub(r"<br\s*/?>", " ", value, flags=re.I)
    value = re.sub(r"</(?:p|li)>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", "", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def brand_for(name: str) -> str:
    lowered = name.lower()
    for brand in ("Hisense", "LG", "Maxi", "Mora", "Deye", "Jinko", "Pylontech"):
        if lowered.startswith(brand.lower()) or brand.lower() in lowered:
            return brand
    if "solar package" in lowered:
        return "Leaf Solar"
    if "lithium-ion battery" in lowered:
        return "Pylontech"
    if "solar panel" in lowered:
        return "Jinko"
    return "Leaf Solar"


def save_webp(url: str, destination: Path, size: int = 800) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        image = Image.open(io.BytesIO(fetch_bytes(url))).convert("RGB")
        image.thumbnail((size, size), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (size, size), "white")
        x = (size - image.width) // 2
        y = (size - image.height) // 2
        canvas.paste(image, (x, y))
        canvas.save(destination, "WEBP", quality=84, method=6)
    except Exception as exc:
        raise RuntimeError(f"Failed image {url}: {exc}") from exc


def main() -> None:
    products = []
    for page in range(1, 5):
        products.extend(fetch_json(f"{API}?per_page=100&page={page}"))

    selected = [p for p in products if p["id"] in CURATED_IDS]
    missing = sorted(CURATED_IDS - {p["id"] for p in selected})
    if missing:
        raise RuntimeError(f"Missing selected product IDs: {missing}")

    records = []
    for source in selected:
        source_category = source["categories"][0]["slug"]
        if source_category not in CATEGORY_META:
            raise RuntimeError(f"Unmapped category {source_category} for {source['name']}")
        category, category_label, department = CATEGORY_META[source_category]
        image_url = source["images"][0]["src"] if source["images"] else ""
        image_path = IMAGE_DIR / f"{source['slug']}.webp"
        if image_url and not image_path.exists():
            save_webp(image_url, image_path)

        price = int(source["prices"]["price"])
        regular = int(source["prices"]["regular_price"])
        description = plain(source["short_description"]) or plain(source["description"])
        records.append({
            "id": source["id"],
            "slug": source["slug"],
            "name": plain(source["name"]),
            "sku": source["sku"],
            "brand": brand_for(plain(source["name"])),
            "category": category,
            "categoryLabel": category_label,
            "department": department,
            "price": price,
            "oldPrice": regular if regular > price else None,
            "onSale": bool(source["on_sale"]),
            "image": f"/images/catalog/{source['slug']}.webp" if image_url else "/images/product-placeholder.webp",
            "imageAlt": plain(source["images"][0].get("alt") or source["name"]) if source["images"] else plain(source["name"]),
            "description": description,
            "inStock": bool(source["is_in_stock"]),
        })

    records.sort(key=lambda p: (p["department"], p["categoryLabel"], p["price"]))
    OUT.write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")

    CATEGORY_DIR.mkdir(parents=True, exist_ok=True)
    for slug, url in CATEGORY_IMAGES.items():
        destination = CATEGORY_DIR / f"{slug}.webp"
        if not destination.exists():
            save_webp(url, destination, 900)

    print(f"Wrote {len(records)} products to {OUT}")
    print(f"Local catalogue images: {len(list(IMAGE_DIR.glob('*.webp')))}")


if __name__ == "__main__":
    main()
