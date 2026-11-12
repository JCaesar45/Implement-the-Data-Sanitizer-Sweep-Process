```
    ___   __  ______  __  ____  ___
   /   | / / / / __ \/ / / /  |/  /
  / /| |/ / / / /_/ / / / / /|_/ /
 / ___ / /_/ / _, _/ /_/ / /  / /
/_/  |_\____/_/ |_|\____/_/  /_/

   Time, refined to the last micron.
```

# AURUM

A luxury watch storefront built as a polyglot reference project: a single-file
front end, a dependency-free TypeScript API, a Python quote engine, and a Java
inventory service. Aurum is a **fictional brand** created for demonstration.

## What’s inside

| Layer | Path | Stack | Role |
|---|---|---|---|
| Storefront | `web/index.html` | HTML, CSS, JS (one file) | Canvas hero, live SVG watch configurator, reservation form |
| API | `api/` | TypeScript, Node `http` | `/quote`, `/waitlist`, `/health`, static hosting |
| Quote engine | `services/quote_engine.py` | Python 3 (stdlib) | Batch pricing and lead-time calculation |
| Inventory | `inventory/` | Java 17+ | Thread-safe stock reservation |

## Quick start

**1. API and storefront** (Node 20+)

```bash
npm install
npm start
# open http://localhost:3000
```

**2. Quote engine** (Python 3.9+)

```bash
echo '{"material":"platinum","strap":"alligator","engraving":"JW"}' \
  | python services/quote_engine.py
```

**3. Inventory demo** (JDK 17+)

```bash
javac -d out inventory/src/main/java/aurum/StockService.java
java -cp out aurum.StockService
```

## API

### `POST /quote`

```json
{ "material": "rose-gold", "strap": "calf", "engraving": "JW" }
```

```json
{ "total": 9950, "currency": "USD", "leadTimeWeeks": 16 }
```

### `POST /waitlist`

```json
{ "email": "you@domain.com" }
```

Returns `201 { "position": 1, "alreadyListed": false }`, or `200` if the
address is already on the list.

### `GET /health`

Returns `{ "status": "ok", "waitlist": <count> }`.

Errors use `{ "error": "message" }` with status 400, 404, 413, 422 or 500.

## Pricing rules

| Option | Price | Lead time |
|---|---|---|
| Steel case | $4,200 | 8 weeks |
| Rose gold case | $9,800 | 14 weeks |
| Platinum case | $14,500 | 20 weeks |
| Calf leather strap | $0 | n/a |
| Alligator strap | +$650 | n/a |
| Bracelet | +$900 | n/a |
| Engraving (max 14 chars) | +$150 | +2 weeks |

The rules live in `api/pricing.ts` and are mirrored in `services/quote_engine.py`.
Change them in both places.

## Design notes

- **One file on the front end.** CSS and JS are inlined so the page deploys anywhere.
- **Light and dark themes** follow the viewer’s system setting through CSS variables.
- **Reduced motion is respected.** Particles, reveals and counters switch off.
- **Storage is defensive.** Every `localStorage` call is wrapped in `try/catch`.
- **The API has no runtime dependencies,** only Node’s built-in modules.
- **Stock reservation is atomic** through `ConcurrentHashMap.computeIfPresent`.

## Known limitations

- The storefront’s reservation form currently saves to the browser only. It does
  not call `/waitlist` yet.
- The waitlist is held in memory and resets on restart. Swap in a database
  before any real use.
- Pricing is duplicated across TypeScript, Python and the front end.

## Roadmap

- [ ] Wire the form and configurator to `/waitlist` and `/quote`
- [ ] Persist the waitlist
- [ ] Expose `StockService` over HTTP
- [ ] Add automated tests for each service

## License

MIT, for the code. “Aurum” is a fictional name.
