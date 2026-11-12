"""Batch quote calculator. Mirrors the rules in api/pricing.ts.

Usage:
    echo '{"material":"steel","strap":"calf","engraving":"JW"}' | python quote_engine.py
"""
import json
import sys
from dataclasses import dataclass, asdict

MATERIAL_PRICE = {"steel": 4200, "rose-gold": 9800, "platinum": 14500}
STRAP_PRICE = {"calf": 0, "alligator": 650, "bracelet": 900}
LEAD_WEEKS = {"steel": 8, "rose-gold": 14, "platinum": 20}
ENGRAVING_FEE = 150
ENGRAVING_WEEKS = 2
ENGRAVING_MAX = 14


@dataclass(frozen=True)
class Quote:
    total: int
    currency: str
    leadTimeWeeks: int


def quote(material: str, strap: str, engraving: str = "") -> Quote:
    if material not in MATERIAL_PRICE:
        raise ValueError(f"unknown material: {material!r}")
    if strap not in STRAP_PRICE:
        raise ValueError(f"unknown strap: {strap!r}")
    if len(engraving) > ENGRAVING_MAX:
        raise ValueError(f"engraving exceeds {ENGRAVING_MAX} characters")

    engraved = bool(engraving.strip())
    total = MATERIAL_PRICE[material] + STRAP_PRICE[strap] + (ENGRAVING_FEE if engraved else 0)
    weeks = LEAD_WEEKS[material] + (ENGRAVING_WEEKS if engraved else 0)
    return Quote(total=total, currency="USD", leadTimeWeeks=weeks)


def main() -> int:
    try:
        payload = json.load(sys.stdin)
        items = payload if isinstance(payload, list) else [payload]
        results = [
            asdict(quote(i.get("material"), i.get("strap"), i.get("engraving") or ""))
            for i in items
        ]
    except (ValueError, AttributeError, json.JSONDecodeError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    json.dump(results, sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
