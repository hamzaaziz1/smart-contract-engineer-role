"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useQuestList } from "@/lib/hooks/useQuestEscrow";
import { StatusBadge } from "@/components/quest/status-badge";
import { formatReward, shortAddress } from "@/lib/utils/format";
import { format } from "date-fns";

export default function HomePage() {
  const { isConnected, address } = useAccount();
  const { quests, loading } = useQuestList();

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <article className="prose prose-2xl prose-invert max-w-none">
          <p className="eyebrow !mt-0 !mb-0">Web3 home task</p>
          <h1 className="!mt-2 !mb-2">ChainQuest bounty board</h1>
          <p className="lead">
            Implement the escrow contract, then wire this dashboard to MetaMask so clients and freelancers
            can post, accept, and settle quests on-chain.
          </p>
          <ul>
            <li>
              <strong>Clients</strong> lock ETH and publish a quest.
            </li>
            <li>
              <strong>Freelancers</strong> accept, submit work, and get paid after approval.
            </li>
            <li>
              <strong>You</strong> connect a wallet and complete the on-chain lifecycle in this UI.
            </li>
          </ul>
        </article>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/quests" className="btn-primary">
            View quest board
          </Link>
          <Link href="/quests/create" className="btn-secondary">
            Post a quest
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-400">
          Wallet:{" "}
          {isConnected ? (
            <span className="text-green-400">{shortAddress(address!)} connected</span>
          ) : (
            <span className="text-amber-300">Not connected — use Connect Wallet in the header</span>
          )}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Live quests</h2>
        {loading && <p className="text-slate-400">Loading from contract…</p>}
        {!loading && quests.length === 0 && (
          <p className="card p-4 text-slate-400">
            No quests yet. Deploy your contract, set <code>.env.local</code>, and post one.
          </p>
        )}
        <ul className="grid gap-3">
          {quests.slice(0, 5).map((q) => (
            <li key={String(q.id)}>
              <Link href={`/quests/${q.id}`} className="card block p-4 hover:border-blue-500/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{q.title}</h3>
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{q.description}</p>
                  </div>
                  <StatusBadge status={q.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>Reward: {formatReward(q.reward, q.isEth)}</span>
                  <span>Poster: {shortAddress(q.poster)}</span>
                  <span>Accept by: {format(Number(q.acceptDeadline) * 1000, "PP p")}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
