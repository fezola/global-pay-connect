import { StatusBadge } from "@/components/StatusBadge";
import type { Transaction } from "@/lib/mockData";
import { formatDistanceToNow } from "date-fns";

interface TransactionRowProps {
  transaction: Transaction;
  onClick: () => void;
}

export function TransactionRow({ transaction, onClick }: TransactionRowProps) {
  const formattedTime = formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true });

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg text-left group"
    >
      <div className="flex items-center gap-4">
        <StatusBadge status={transaction.status} />
        <div>
          <div className="font-mono text-sm text-muted-foreground">{transaction.id}</div>
          <div className="text-sm mt-0.5">{transaction.description}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">
          {transaction.type === 'payout' ? '-' : '+'}{transaction.amount} {transaction.currency}
        </div>
        <div className="text-xs text-muted-foreground">{formattedTime}</div>
      </div>
    </button>
  );
}
