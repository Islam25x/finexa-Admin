import type { ReactNode } from "react";
import Card from "./Card";

type PanelCardProps = {
  children: ReactNode;
  className?: string;
};

function PanelCard({ children, className = "" }: PanelCardProps) {
  return (
    <Card variant="default" padding="md" className={className}>
      {children}
    </Card>
  );
}

export default PanelCard;
