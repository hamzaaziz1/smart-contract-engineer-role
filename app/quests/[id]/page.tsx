"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useQuest, useQuestActions } from "@/lib/hooks/useQuestEscrow";
import { StatusBadge } from "@/components/quest/status-badge";
import { formatReward, shortAddress } from "@/lib/utils/format";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function QuestDetailPage() {
  const params = useParams();
  const questId = BigInt(params.id as string);
  const { address, isConnected } = useAccount();
  const { quest, refetch, isLoading } = useQuest(questId);
  const actions = useQuestActions(questId);
  const [deliverableUri, setDeliverableUri] = useState("ipfs://QmYourDeliverableHash");

  if (isLoading || !quest) {
    return <p className="text-slate-400">Loading quest #{String(questId)}…</p>;
  }

  const isPoster = address?.toLowerCase() === quest.poster.toLowerCase();
  const isWorker = address?.toLowerCase() === quest.worker.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const reviewEnded = quest.reviewDeadline > 0n && now > Number(quest.reviewDeadline);

  async function run(action: () => Promise<void>, label: string) {
    if (!isConnected) {
      toast.error("Connect wallet first");
      return;
    }
    try {
      await action();
      toast.success(label);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/quests" className="text-sm text-blue-400 hover:underline">
        ← Quest board
      </Link>

      <header className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Quest #{String(quest.id)}</p>
            <h1 className="text-2xl font-bold">{quest.title}</h1>
          </div>
          <StatusBadge status={quest.status} />
        </div>
        <p className="mt-3 text-slate-300">{quest.description}</p>
        <dl className="mt-4 grid gap-2 text-sm text-slate-400 md:grid-cols-2">
          <div>Reward: {formatReward(quest.reward, quest.isEth)}</div>
          <div>Poster: {shortAddress(quest.poster)}</div>
          <div>
            Worker:{" "}
            {quest.worker === "0x0000000000000000000000000000000000000000"
              ? "Unassigned"
              : shortAddress(quest.worker)}
          </div>
          <div>Accept by: {format(Number(quest.acceptDeadline) * 1000, "PP p")}</div>
          {quest.reviewDeadline > 0n && (
            <div>Review by: {format(Number(quest.reviewDeadline) * 1000, "PP p")}</div>
          )}
          {quest.deliverableUri && <div className="md:col-span-2">Deliverable: {quest.deliverableUri}</div>}
        </dl>
      </header>

      <section className="card space-y-4 p-6">
        <h2 className="font-semibold">Actions (wallet required)</h2>
        <p className="text-sm text-amber-200/90">
          TODO: implement transaction hooks in <code>lib/hooks/useQuestEscrow.ts</code> so these buttons
          send real transactions.
        </p>

        {quest.status === 0 && !isPoster && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => run(actions.accept, "Quest accepted")}
          >
            Accept quest
          </button>
        )}

        {quest.status === 1 && isWorker && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input flex-1"
              value={deliverableUri}
              onChange={(e) => setDeliverableUri(e.target.value)}
            />
            <button
              type="button"
              className="btn-primary"
              onClick={() => run(() => actions.submit(deliverableUri), "Work submitted")}
            >
              Submit deliverable
            </button>
          </div>
        )}

        {quest.status === 2 && isPoster && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => run(actions.approve, "Payment released")}
          >
            Approve & pay worker
          </button>
        )}

        {quest.status === 2 && isWorker && reviewEnded && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => run(actions.claimTimeout, "Timeout payout claimed")}
          >
            Claim timeout payout
          </button>
        )}

        {quest.status === 2 && isPoster && reviewEnded && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => run(actions.refund, "Poster refunded")}
          >
            Refund after review window
          </button>
        )}

        {quest.status === 0 && isPoster && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => run(actions.cancel, "Quest cancelled")}
          >
            Cancel quest (refund)
          </button>
        )}
      </section>
    </div>
  );
}
