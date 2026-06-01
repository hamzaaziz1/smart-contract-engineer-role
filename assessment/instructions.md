# ChainQuest — Web3 engineer home task

**Time:** ~2–3 hours  
**Build:** `QuestEscrow.sol` + wallet-connected UI at **http://localhost:3000**

---

## Setup

```bash
npm install
npm install --prefix contracts
```

---

## Part A — Contract

1. Implement **`contracts/contracts/QuestEscrow.sol`** (replace stubs).
2. Run tests:

```bash
npm run test
# or: cd contracts && npx hardhat test
```

All **9 scenarios (A–I)** in `QuestEscrow.assessment.test.ts` must pass.

**Rules:** 3% fee (`FEE_BPS = 300`); ETH when `token == address(0)`; match revert strings in tests exactly.

| ID | Checks |
| --- | --- |
| A | ETH: accept → submit → approve; worker gets 97% |
| B | Owner withdraws fees |
| C | No accept after deadline |
| D | Only poster approves |
| E | No approve before submit |
| F | ERC20 path |
| G | Cancel + refund |
| H | Worker timeout payout |
| I | Poster refund after review |

---

## Part B — UI + wallet

**Terminal 1:** `npm run contracts:node`  
**Terminal 2:** `npm run contracts:deploy` → copy addresses to `.env.local` (see `.env.example`)  
**Terminal 3:** `npm run dev` → open **http://localhost:3000**

MetaMask: chain **31337**, RPC `http://127.0.0.1:8545`, import two Hardhat accounts.

Implement **`lib/hooks/useQuestEscrow.ts`** (`useCreateQuest`, `useQuestActions`) with `useWriteContract` + `useWaitForTransactionReceipt`.

---

## Part C — UI checklist (required)

| Step | Account | Confirm |
| --- | --- | --- |
| 1 | A | Wallet connected in header |
| 2 | A | Create quest on `/quests/create` |
| 3 | A | Quest on `/quests` (Open) |
| 4 | B | Accept on `/quests/[id]` |
| 5 | B | Submit deliverable |
| 6 | A | Approve & pay → Completed |
| 7 | B | Balance ≈ 97% of reward |

---

## Submit

- [ ] All tests pass
- [ ] Part C done on localhost:3000
- [ ] **GitHub URL** to your completed task repository (fork or your own repo with your implementation)
- [ ] **Screenshots** of successful UI results with wallet connected (header shows connected account): quest board, accepted/submitted flow, completed payout — include these in the project under `assets/` (see `assets/screenshot.png` for reference)
- [ ] `README-SUBMISSION.md` (name, email, contract address, how to run, GitHub repo URL; screenshots in `assets/`)
