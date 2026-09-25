import { describe, it } from "vitest";
import { createTestIndexer } from "envio";

// A real stretch of Robinhood Chain (about five minutes of blocks) that
// contains events from all four apps.
const START = 71_852_423;
const END = 71_855_423;

describe("Robinhood Chain ecosystem indexer", () => {
  it("indexes all four apps from real blocks", async (t) => {
    const indexer = createTestIndexer();
    await indexer.process({ chains: { 4663: { startBlock: START, endBlock: END } } });

    const swaps = await indexer.Swap.getAll();
    const pools = await indexer.Pool.getAll();
    const flows = await indexer.VaultFlow.getAll();
    const launches = await indexer.Launch.getAll();
    const transfers = await indexer.BridgeTransfer.getAll();

    console.log({
      swaps: swaps.length,
      pools: pools.length,
      vaultFlows: flows.length,
      launches: launches.length,
      bridgeOut: transfers.filter((x) => x.direction === "OUT").length,
      bridgeIn: transfers.filter((x) => x.direction === "IN").length,
    });

    t.expect(swaps.length).toBeGreaterThan(0);
    t.expect(flows.length).toBeGreaterThan(0);
    t.expect(launches.length).toBeGreaterThan(0);
    t.expect(transfers.some((x) => x.direction === "OUT")).toBe(true);
    t.expect(transfers.some((x) => x.direction === "IN")).toBe(true);

    // Every swap's pool was created or updated with a matching swap count.
    const total = pools.reduce((sum, p) => sum + p.swapCount, 0n);
    t.expect(total).toBe(BigInt(swaps.length));
  });
});
