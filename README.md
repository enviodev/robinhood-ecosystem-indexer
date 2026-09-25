# Robinhood Chain ecosystem indexer

An [Envio HyperIndex](https://docs.envio.dev/docs/HyperIndex/overview) indexer for four busy apps on [Robinhood Chain](https://docs.robinhood.com/chain/) (chain ID `4663`), in one project:

| App | Contract | What it indexes |
| --- | --- | --- |
| Uniswap v4 | PoolManager `0x8366a39cc670b4001a1121b8f6a443a643e40951` | Every swap, with a running swap count per pool |
| steakUSDG (Morpho vault) | `0xBeEff033F34C046626B8D0A041844C5d1A5409dd` | Deposits and withdrawals |
| Pons | V2 launch factory `0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e` | Token launches, and when each graduates from its bonding curve |
| Across | SpokePool `0xD29C85F15DF544bA632C9E25829fd29d767d7978` | Transfers leaving Robinhood Chain (`OUT`) and arriving on it (`IN`) |

It goes with the blog [Robinhood Chain Ecosystem: Live Apps and How to Index Them](https://docs.envio.dev/blog/robinhood-chain-ecosystem).

## Requirements

- Node.js 22 or newer. On Node 20 the tests fail with `Promises.glob is not a function`.
- pnpm
- Docker, only if you run the indexer locally with `pnpm dev`
- A free [Envio API token](https://envio.dev/app/api-tokens)

## Run it

```bash
pnpm install
cp .env.example .env   # then put your token in .env
pnpm codegen
pnpm dev
```

`pnpm dev` starts Postgres and Hasura in Docker and begins indexing. Query the data at `http://localhost:8080/v1/graphql`, or open the Hasura console at `http://localhost:8080` (the local admin secret is `testing`).

```graphql
{
  Launch(limit: 5, order_by: { launchedAt: desc }) {
    id
    deployer
    launchedAt
    graduated
  }
}
```

## Where it starts

`config.yaml` sets `start_block: latest`, so the indexer starts at the current chain head and follows new blocks from there. Uniswap v4 alone emits millions of events a week on Robinhood Chain, so a full backfill takes a while. To index history, replace `latest` with a block number.

Starting mid-history has two effects:

- Pools created before the start block have no `Initialize` event in range. They're still created on their first swap, with the pool details left empty.
- Pons tokens launched before the start block are skipped when they graduate, since their launch details are unknown.

## Test it

```bash
pnpm test
```

The test runs the indexer over a real stretch of Robinhood Chain, blocks 71,852,423 to 71,855,423, which has events from all four apps. It checks each app produced rows and that the per-pool swap counts add up to the number of swaps.

## Measure any contract

`scripts/measure.py` counts direct transactions, unique senders and events for any contracts over a block range, using [HyperSync](https://docs.envio.dev/docs/HyperSync/overview). It only needs Python 3.

```bash
ENVIO_API_TOKEN=... python3 scripts/measure.py 65779486 71782334 0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010
```

## Build your own

To index a different app on Robinhood Chain, scaffold it from the verified ABI on the block explorer:

```bash
envio init contract-import explorer -b robinhood -c <CONTRACT_ADDRESS> --single-contract --all-events -n my-indexer -l typescript
```

Then add its contract, events, schema types and handlers to this project to index it alongside the others. The [Envio docs](https://docs.envio.dev/docs/HyperIndex/overview) cover the config, schema and handlers.
