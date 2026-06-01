import { QUEST_STATUS_LABELS } from "@/lib/contracts/questEscrowAbi";

export function StatusBadge({ status }: { status: number }) {
  const label = QUEST_STATUS_LABELS[status] ?? "Unknown";
  const cls = `badge badge-${label.toLowerCase()}`;
  return <span className={cls}>{label}</span>;
}
