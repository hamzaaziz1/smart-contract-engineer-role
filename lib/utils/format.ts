import { formatEther, formatUnits } from "viem";

export function shortAddress(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatReward(amount: bigint, isEth: boolean) {
  return isEth ? `${formatEther(amount)} ETH` : `${formatUnits(amount, 6)} mUSDC`;
}
