import { indexer } from "envio";

// A deposit on Robinhood Chain is money leaving it.
indexer.onEvent({ contract: "AcrossSpokePool", event: "FundsDeposited" }, async ({ event, context }) => {
  context.BridgeTransfer.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    direction: "OUT",
    depositId: event.params.depositId,
    otherChainId: event.params.destinationChainId,
    inputAmount: event.params.inputAmount,
    outputAmount: event.params.outputAmount,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
});

// A fill on Robinhood Chain is a relayer delivering money arriving on it.
indexer.onEvent({ contract: "AcrossSpokePool", event: "FilledRelay" }, async ({ event, context }) => {
  context.BridgeTransfer.set({
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    direction: "IN",
    depositId: event.params.depositId,
    otherChainId: event.params.originChainId,
    inputAmount: event.params.inputAmount,
    outputAmount: event.params.outputAmount,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  });
});
