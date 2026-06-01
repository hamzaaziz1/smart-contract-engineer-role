"use client";

import Link from "next/link";
import { useQuestList } from "@/lib/hooks/useQuestEscrow";
import { StatusBadge } from "@/components/quest/status-badge";
import { formatReward, shortAddress } from "@/lib/utils/format";
import { format } from "date-fns";

export default function QuestBoardPage() {
  const { quests, loading, refresh } = useQuestList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quest board</h1>
          <p className="mt-1 text-sm text-slate-400">Browse and manage on-chain bounties.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => refresh()}>
            Refresh
          </button>
          <Link href="/quests/create" className="btn-primary">
            Post quest
          </Link>
        </div>
      </div>

      {loading && <p className="text-slate-400">Reading chain state…</p>}

      {!loading && quests.length === 0 && (
        <p className="card p-4 text-slate-400">
          No quests yet. Deploy <code>QuestEscrow</code>, set <code>.env.local</code>, then post one.
        </p>
      )}

      <ul className="grid gap-4">
        {quests.map((q) => (
          <li key={String(q.id)} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link href={`/quests/${q.id}`} className="text-lg font-semibold hover:text-blue-300">
                  #{String(q.id)} — {q.title}
                </Link>
                <p className="mt-1 text-sm text-slate-400">{q.description}</p>
              </div>
              <StatusBadge status={q.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300 md:grid-cols-4">
              <div>
                <dt className="text-slate-500">Reward</dt>
                <dd>{formatReward(q.reward, q.isEth)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Poster</dt>
                <dd>{shortAddress(q.poster)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Worker</dt>
                <dd>
                  {q.worker === "0x0000000000000000000000000000000000000000"
                    ? "—"
                    : shortAddress(q.worker)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Accept deadline</dt>
                <dd>{format(Number(q.acceptDeadline) * 1000, "PP p")}</dd>
              </div>
            </dl>
            <Link href={`/quests/${q.id}`} className="mt-4 inline-block text-sm text-blue-400 hover:underline">
              Open quest →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
