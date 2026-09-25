import { indexer } from "envio";

indexer.onEvent({ contract: "SteakUSDG", event: "Deposit" }, async ({ event, context }) => {
  context.VaultFlow.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    kind: "DEPOSIT",
    sender: event.params.sender,
    onBehalf: event.params.onBehalf,
    assets: event.params.assets,
    shares: event.params.shares,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
});

indexer.onEvent({ contract: "SteakUSDG", event: "Withdraw" }, async ({ event, context }) => {
  context.VaultFlow.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    kind: "WITHDRAW",
    sender: event.params.sender,
    onBehalf: event.params.onBehalf,
    assets: event.params.assets,
    shares: event.params.shares,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
});
