"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            ChainQuest
          </Link>
          <nav className="flex gap-4 text-sm text-slate-300">
            <Link href="/quests" className="hover:text-white">
              Quest board
            </Link>
            <Link href="/quests/create" className="hover:text-white">
              Post quest
            </Link>
          </nav>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>
    </header>
  );
}
