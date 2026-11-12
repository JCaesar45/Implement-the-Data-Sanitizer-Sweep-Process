package aurum;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class StockService {
    private final Map<String, Integer> stock = new ConcurrentHashMap<>();

    public void restock(String reference, int units) {
        if (units <= 0) {
            throw new IllegalArgumentException("units must be positive");
        }
        stock.merge(reference, units, Integer::sum);
    }

    /** Atomically takes one unit. Returns false if the reference is unknown or sold out. */
    public boolean reserve(String reference) {
        boolean[] reserved = {false};
        stock.computeIfPresent(reference, (key, units) -> {
            if (units > 0) {
                reserved[0] = true;
                return units - 1;
            }
            return units;
        });
        return reserved[0];
    }

    public int available(String reference) {
        return stock.getOrDefault(reference, 0);
    }

    public static void main(String[] args) {
        StockService service = new StockService();
        service.restock("MERIDIAN", 2);

        for (int i = 1; i <= 3; i++) {
            System.out.println("Reserve #" + i + ": " + service.reserve("MERIDIAN"));
        }
        System.out.println("Remaining: " + service.available("MERIDIAN"));
    }
}
