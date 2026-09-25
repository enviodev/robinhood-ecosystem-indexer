"""Count direct transactions, unique senders and events for contracts on
Robinhood Chain over a block range, using HyperSync.

Usage:
  ENVIO_API_TOKEN=... python3 scripts/measure.py FROM_BLOCK TO_BLOCK ADDRESS [ADDRESS ...]

Example (Morpho, one week):
  python3 scripts/measure.py 65779486 71782334 0x9D53d5E3bd5E8d4Cbfa6DB1ca238AEA02E651010
"""
import os, sys, json, urllib.request

TOKEN = os.environ.get("ENVIO_API_TOKEN")
URL = "https://robinhood.hypersync.xyz/query"

def query(body):
    req = urllib.request.Request(
        URL,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {TOKEN}"},
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read())

if len(sys.argv) < 4 or not TOKEN:
    sys.exit(__doc__)
start, end, contracts = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3:]

wanted = {a.lower() for a in contracts}
txs, events, senders = 0, 0, set()
block = start
while block < end:
    d = query({
        "from_block": block,
        "to_block": end,
        "transactions": [{"to": contracts}],     # calls made straight to them
        "logs": [{"address": contracts}],        # events they emitted
        "field_selection": {"transaction": ["from", "to"], "log": ["address"]},
        "join_mode": "JoinNothing",              # don't pull extra rows
    })
    for batch in d.get("data", []):
        for tx in batch.get("transactions", []):
            if (tx.get("to") or "").lower() in wanted:
                txs += 1
                senders.add(tx["from"])
        events += len(batch.get("logs", []))
    nxt = d.get("next_block")
    if not nxt or nxt <= block:
        break
    block = nxt

print(f"{txs:,} transactions from {len(senders):,} senders, {events:,} events")
