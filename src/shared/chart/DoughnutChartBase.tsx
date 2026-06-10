import { memo, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

export interface DoughnutChartInputDataset {
  data: number[];
  backgroundColor: string[];
  borderColor: string;
  borderWidth: number;
  cutout: string;
  borderRadius: number;
}

export interface DoughnutChartInputData {
  labels: string[];
  datasets: DoughnutChartInputDataset[];
}

export interface DoughnutChartInputOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: { display: boolean };
    tooltip: { enabled: boolean };
  };
}

type DoughnutChartBaseProps = {
  data: DoughnutChartInputData;
  options: DoughnutChartInputOptions;
  width?: number;
  height?: number;
  className?: string;
  centerText?: string;
  centerSubText?: string;
};

type PieDataRow = {
  name: string;
  value: number;
  color: string;
};

const DoughnutChartBase = ({
  data,
  options,
  width,
  height,
  className,
  centerText,
  centerSubText,
}: DoughnutChartBaseProps) => {
  const dataset = data.datasets[0];

  const pieData = useMemo<PieDataRow[]>(
    () =>
      data.labels.map((label, index) => ({
        name: String(label),
        value: dataset.data[index] ?? 0,
        color: dataset.backgroundColor[index] ?? "#111827",
      })),
    [data.labels, dataset.backgroundColor, dataset.data]
  );

  const containerStyle = useMemo(
    () => ({
      width: width ? `${width}px` : "100%",
      height: height ? `${height}px` : "260px",
    }),
    [height, width]
  );
  return (
    <div className={className} style={containerStyle}>
      <div className="w-full h-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="68%"
              outerRadius="88%"
              paddingAngle={2}
              cornerRadius={4}
              isAnimationActive
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  stroke={dataset.borderColor}
                  strokeWidth={dataset.borderWidth}
                />
              ))}
            </Pie>
            {options.plugins.tooltip.enabled ? <Tooltip /> : null}
            {options.plugins.legend.display ? <Legend /> : null}
          </PieChart>
        </ResponsiveContainer>
        {centerSubText ? (
          <p className="absolute left-1/2 top-[44%] -translate-x-1/2 text-sm text-text-secondary">{centerSubText}</p>
        ) : null}
        {centerText ? (
          <p className="absolute left-1/2 top-1/2 -translate-x-1/2 text-[20px] font-bold text-text-primary">{centerText}</p>
        ) : null}
      </div>
    </div>
  );
};

export default memo(DoughnutChartBase);
