# ChainQuest — Web3 engineer home task

On-chain bounty escrow + Next.js UI. Candidates implement `QuestEscrow.sol`, wire wallet hooks, and verify the flow at **http://localhost:3000**.

**Candidate instructions:** [assessment/instructions.md](assessment/instructions.md)

---

## Setup (maintainers)

```bash
npm install
npm install --prefix contracts
```

Verify reference implementation:

```bash
QUEST_ASSESSMENT_SOLUTION=1 npm run test
```

---

## Run locally

```bash
# Terminal 1
npm run contracts:node

# Terminal 2 (after candidate implements contract, or DEPLOY_REFERENCE=1 for demo)
npm run contracts:deploy
# copy addresses into .env.local from .env.example

# Terminal 3
npm run dev
```

Open http://localhost:3000

---

## Structure

| Path | Purpose |
| --- | --- |
| `contracts/contracts/QuestEscrow.sol` | Candidate implements this |
| `contracts/contracts/reference/` | Reference solution (for `QUEST_ASSESSMENT_SOLUTION=1` tests) |
| `contracts/test/` | Assessment tests |
| `app/` | Next.js UI |
| `lib/hooks/useQuestEscrow.ts` | Candidate implements wallet writes |

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run test` | Run assessment tests |
| `npm run dev` | Start UI |
| `npm run contracts:node` | Local Hardhat chain |
| `npm run contracts:deploy` | Deploy `QuestEscrow` to localhost |

Use `DEPLOY_REFERENCE=1 npm run contracts:deploy` to deploy the reference contract for UI demos.

---

## License

MIT
