export const questEscrowAbi = [
  {
    type: "function",
    name: "questCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getQuest",
    stateMutability: "view",
    inputs: [{ name: "questId", type: "uint256" }],
    outputs: [
      { name: "poster", type: "address" },
      { name: "worker", type: "address" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "reward", type: "uint256" },
      { name: "token", type: "address" },
      { name: "acceptDeadline", type: "uint256" },
      { name: "reviewPeriod", type: "uint256" },
      { name: "reviewDeadline", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "deliverableUri", type: "string" },
    ],
  },
  {
    type: "function",
    name: "createQuest",
    stateMutability: "payable",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "reward", type: "uint256" },
      { name: "acceptDeadline", type: "uint256" },
      { name: "reviewPeriod", type: "uint256" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  { type: "function", name: "acceptQuest", inputs: [{ name: "questId", type: "uint256" }] },
  {
    type: "function",
    name: "submitWork",
    inputs: [
      { name: "questId", type: "uint256" },
      { name: "deliverableUri", type: "string" },
    ],
  },
  { type: "function", name: "approveAndPay", inputs: [{ name: "questId", type: "uint256" }] },
  { type: "function", name: "claimTimeoutPayout", inputs: [{ name: "questId", type: "uint256" }] },
  { type: "function", name: "cancelQuest", inputs: [{ name: "questId", type: "uint256" }] },
  { type: "function", name: "refundPoster", inputs: [{ name: "questId", type: "uint256" }] },
  {
    type: "event",
    name: "QuestCreated",
    inputs: [
      { name: "questId", type: "uint256", indexed: true },
      { name: "poster", type: "address", indexed: true },
      { name: "reward", type: "uint256", indexed: false },
    ],
  },
] as const;

export const QUEST_STATUS_LABELS = [
  "Open",
  "Accepted",
  "Submitted",
  "Completed",
  "Cancelled",
  "Refunded",
] as const;
