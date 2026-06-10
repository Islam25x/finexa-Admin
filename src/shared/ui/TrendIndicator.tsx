import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { MetricTrendPresentation } from "../utils/metric-trend";
import Text from "./Text";
import { cn } from "./types";

type TrendIndicatorProps = {
  trend: MetricTrendPresentation;
  className?: string;
};

const TREND_STYLES = {
  positive: {
    textClassName: "text-green-600",
    Icon: ArrowUpRight,
  },
  negative: {
    textClassName: "text-red-600",
    Icon: ArrowDownRight,
  },
  neutral: {
    textClassName: "text-slate-500",
    Icon: Minus,
  },
} as const;

function TrendIndicator({ trend, className }: TrendIndicatorProps) {
  const style = TREND_STYLES[trend.state];
  const Icon = style.Icon;

  return (
    <div className={cn("flex items-center gap-2 text-sm font-medium", style.textClassName, className)}>
      <Icon size={16} strokeWidth={2.1} />
      <Text as="span" variant="body" weight="medium" className={style.textClassName}>
        {trend.label}
      </Text>
    </div>
  );
}

export default TrendIndicator;
