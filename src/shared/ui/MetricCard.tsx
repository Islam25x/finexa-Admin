import { MoveUpRight } from "lucide-react";
import type { ReactNode } from "react";
import Card from "./Card";
import Text from "./Text";

type MetricCardProps = {
  title: string;
  icon: ReactNode;
  value: number | string;
  trendContent: ReactNode;
  showArrow?: boolean;
  onArrowClick?: () => void;
  actionLabel?: string;
  className?: string;
};

function MetricCard({
  title,
  icon,
  value,
  trendContent,
  showArrow = false,
  onArrowClick,
  actionLabel,
  className = "",
}: MetricCardProps) {
  return (
    <Card
      variant="default"
      padding="md"
      className={`rounded-4xl pt-4 text-black ${className}`}
    >
      <div className="flex justify-between">
        <Text as="h6" variant="subtitle" weight="medium" className="mb-4 text-black">
          {title}
        </Text>
        {showArrow && (
          <button
            type="button"
            onClick={onArrowClick}
            className="me-[-1rem] mt-[-.8rem] h-10 w-10 rounded-full border border-gray-300 text-slate-600 transition duration-150 hover:bg-primary hover:text-white"
            aria-label={actionLabel ?? `Open ${title} transaction modal`}
          >
            <MoveUpRight className="mx-auto" />
          </button>
        )}
      </div>

      <div className="mb-2 flex items-center gap-3">
        {icon}
        <Text as="span" variant="title" weight="bold" className="text-2xl">
          {value}
        </Text>
      </div>

      <div>{trendContent}</div>
    </Card>
  );
}

export default MetricCard;
