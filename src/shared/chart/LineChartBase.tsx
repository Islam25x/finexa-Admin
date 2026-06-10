import { memo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type LineChartRow = {
  label: string;
  [key: string]: string | number;
};

type LineChartBaseProps = {
  data: LineChartRow[];
  series: {
    dataKey: string;
    stroke: string;
    fill?: string;
  }[];
};

const LineChartBase = ({
  data,
  series,
}: LineChartBaseProps) => {
  return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-text-secondary)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-text-secondary)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip />
          {series.map((item) => (
            <Area
              key={item.dataKey}
              type="monotone"
              dataKey={item.dataKey}
              stroke={item.stroke}
              fill={item.fill ?? "none"}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={true}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
  );
};

export default memo(LineChartBase);
