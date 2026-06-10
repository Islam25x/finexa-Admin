import type { ReactNode } from "react";
import Text from "./Text";

type PanelHeaderProps = {
  title: string;
  right?: ReactNode;
  className?: string;
};

function PanelHeader({ title, right, className = "" }: PanelHeaderProps) {
  return (
    <div className={`mb-4 flex items-center justify-between ${className}`}>
      <Text as="h2" variant="subtitle" weight="bold">
        {title}
      </Text>
      {right}
    </div>
  );
}

export default PanelHeader;
