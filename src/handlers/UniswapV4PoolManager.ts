import { indexer } from "envio";

// Pool details come from Initialize. Pools created before the start block
// are created on their first swap and keep null details.
indexer.onEvent({ contract: "UniswapV4PoolManager", event: "Initialize" }, async ({ event, context }) => {
  const existing = await context.Pool.get(event.params.id);
  context.Pool.set({
    id: event.params.id,
    currency0: event.params.currency0,
    currency1: event.params.currency1,
    fee: Number(event.params.fee),
    tickSpacing: Number(event.params.tickSpacing),
    hooks: event.params.hooks,
    swapCount: existing?.swapCount ?? 0n,
  });
});

indexer.onEvent({ contract: "UniswapV4PoolManager", event: "Swap" }, async ({ event, context }) => {
  const pool = await context.Pool.get(event.params.id);
  context.Pool.set({
    id: event.params.id,
    currency0: pool?.currency0,
    currency1: pool?.currency1,
    fee: pool?.fee,
    tickSpacing: pool?.tickSpacing,
    hooks: pool?.hooks,
    swapCount: (pool?.swapCount ?? 0n) + 1n,
  });

  context.Swap.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    pool_id: event.params.id,
    sender: event.params.sender,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    fee: Number(event.params.fee),
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
});
