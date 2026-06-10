import Text from "./Text";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <Text as="h1" variant="title" weight="bold">
          {title}
        </Text>
        {subtitle && (
          <Text variant="body" className="text-gray-500">
            {subtitle}
          </Text>
        )}
      </div>
      {right}
    </div>
  );
}

export default PageHeader;
