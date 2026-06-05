import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatSigned } from "@/lib/utils";

type StockScoreBadgeProps = {
  score: number;
  size?: "sm" | "lg";
};

export function StockScoreBadge({ score, size = "sm" }: StockScoreBadgeProps) {
  const isPositive = score > 2;
  const isNegative = score < -2;
  const Icon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-mono font-semibold",
        size === "lg" ? "px-4 py-2 text-lg" : "px-2.5 py-1 text-xs",
        isPositive && "border-gain/40 bg-gain/10 text-gain",
        isNegative && "border-loss/40 bg-loss/10 text-loss",
        !isPositive && !isNegative && "border-muted-foreground/30 bg-muted text-muted-foreground",
      )}
    >
      <Icon className={cn(size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5")} />
      {formatSigned(score)}
    </span>
  );
}
