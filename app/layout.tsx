import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/web3-provider";
import Header from "@/components/layout/header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChainQuest — On-chain bounty board",
  description: "Web3 engineer home task: escrow quests with wallet-connected UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          </div>
          <Toaster richColors position="top-right" />
        </Web3Provider>
      </body>
    </html>
  );
}
