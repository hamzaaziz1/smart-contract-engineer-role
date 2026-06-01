"use client";

import { FormEvent, useState } from "react";
import { useAccount } from "wagmi";
import { useCreateQuest } from "@/lib/hooks/useQuestEscrow";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateQuestPage() {
  const { isConnected } = useAccount();
  const { createEthQuest, isPending } = useCreateQuest();
  const [title, setTitle] = useState("Fix wallet connect flow");
  const [description, setDescription] = useState(
    "Implement RainbowKit + wagmi write hooks for createQuest."
  );
  const [rewardEth, setRewardEth] = useState("0.1");
  const [acceptHours, setAcceptHours] = useState("24");
  const [reviewHours, setReviewHours] = useState("2");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isConnected) {
      toast.error("Connect your Web3 wallet first");
      return;
    }
    try {
      const acceptDeadline = new Date(Date.now() + Number(acceptHours) * 3600 * 1000);
      await createEthQuest({
        title,
        description,
        rewardEth,
        acceptDeadline,
        reviewPeriodHours: Number(reviewHours),
      });
      toast.success("Quest created — check the board");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transaction failed");
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Post a quest</h1>
        <p className="mt-2 text-sm text-slate-400">
          TODO: wire this form to <code>createQuest</code> on your deployed contract (ETH path).
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <label className="block space-y-1 text-sm">
          Title
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="block space-y-1 text-sm">
          Description
          <textarea
            className="input min-h-[96px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label className="block space-y-1 text-sm">
          Reward (ETH)
          <input
            className="input"
            value={rewardEth}
            onChange={(e) => setRewardEth(e.target.value)}
            required
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1 text-sm">
            Accept window (hours)
            <input
              className="input"
              type="number"
              min={1}
              value={acceptHours}
              onChange={(e) => setAcceptHours(e.target.value)}
            />
          </label>
          <label className="block space-y-1 text-sm">
            Review period (hours)
            <input
              className="input"
              type="number"
              min={1}
              value={reviewHours}
              onChange={(e) => setReviewHours(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={isPending || !isConnected}>
          {isPending ? "Confirm in wallet…" : "Create quest on-chain"}
        </button>
      </form>

      <Link href="/quests" className="text-sm text-blue-400 hover:underline">
        ← Back to board
      </Link>
    </div>
  );
}
