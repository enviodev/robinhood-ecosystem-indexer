import { indexer } from "envio";

indexer.onEvent({ contract: "PonsV2LaunchFactory", event: "TokenLaunched" }, async ({ event, context }) => {
  context.Launch.set({
    id: event.params.token,
    curve: event.params.curve,
    deployer: event.params.deployer,
    pairToken: event.params.pairToken,
    launchedAt: event.block.timestamp,
    graduated: false,
    graduatedAt: undefined,
    positionId: undefined,
  });
});

// A launch that graduated from its bonding curve into a pool. Tokens launched
// before the start block are skipped, since their launch details are unknown.
indexer.onEvent({ contract: "PonsV2LaunchFactory", event: "PoolGraduated" }, async ({ event, context }) => {
  const launch = await context.Launch.get(event.params.token);
  if (!launch) return;
  context.Launch.set({
    ...launch,
    graduated: true,
    graduatedAt: event.block.timestamp,
    positionId: event.params.positionId,
  });
});
