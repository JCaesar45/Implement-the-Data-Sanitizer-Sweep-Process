export type Material = "steel" | "rose-gold" | "platinum";
export type Strap = "calf" | "alligator" | "bracelet";

export interface QuoteRequest {
  material: Material;
  strap: Strap;
  engraving?: string;
}

export interface Quote {
  total: number;
  currency: "USD";
  leadTimeWeeks: number;
}

const MATERIAL_PRICE: Record<Material, number> = {
  steel: 4200,
  "rose-gold": 9800,
  platinum: 14500,
};

const STRAP_PRICE: Record<Strap, number> = {
  calf: 0,
  alligator: 650,
  bracelet: 900,
};

const LEAD_WEEKS: Record<Material, number> = {
  steel: 8,
  "rose-gold": 14,
  platinum: 20,
};

const ENGRAVING_FEE = 150;
const ENGRAVING_WEEKS = 2;
const ENGRAVING_MAX = 14;

export function isQuoteRequest(value: unknown): value is QuoteRequest {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  const engravingOk =
    r.engraving === undefined ||
    (typeof r.engraving === "string" && r.engraving.length <= ENGRAVING_MAX);
  return (
    typeof r.material === "string" &&
    Object.hasOwn(MATERIAL_PRICE, r.material) &&
    typeof r.strap === "string" &&
    Object.hasOwn(STRAP_PRICE, r.strap) &&
    engravingOk
  );
}

export function quote(req: QuoteRequest): Quote {
  const engraved = (req.engraving ?? "").trim().length > 0;
  return {
    total:
      MATERIAL_PRICE[req.material] +
      STRAP_PRICE[req.strap] +
      (engraved ? ENGRAVING_FEE : 0),
    currency: "USD",
    leadTimeWeeks: LEAD_WEEKS[req.material] + (engraved ? ENGRAVING_WEEKS : 0),
  };
}
