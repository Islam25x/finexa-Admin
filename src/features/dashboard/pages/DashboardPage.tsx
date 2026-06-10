import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bot,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { startOfMonth } from "date-fns";
import { useState } from "react";
import AdminLayout from "../../../shared/layout/AdminLayout";
import DoughnutChartBase from "../../../shared/chart/DoughnutChartBase";
import { Button, cn } from "../../../shared/ui";
import DateRangePickerPopover from "../../../shared/ui/DateRangePickerPopover";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import type { AiUsageItem, MetricSummary } from "../types/dashboard.types";

const metricIcons = [Users, UserRound, ArrowUpFromLine, ArrowUpFromLine, ArrowDownToLine, WalletCards];
const panelClass = "rounded-lg border border-border bg-surface p-5 shadow-md";
const mutedTextClass = "text-sm text-text-secondary";
const toneClasses: Record<MetricSummary["tone"], string> = {
  blue: "bg-primary/10 text-primary",
  green: "bg-primary/10 text-primary",
  violet: "bg-primary/10 text-primary",
  red: "bg-primary/10 text-primary",
};

function MetricTile({ metric, index }: { metric: MetricSummary; index: number }) {
  const Icon = metricIcons[index] ?? CreditCard;

  return (
    <article className="grid min-h-[132px] grid-cols-[54px_1fr] gap-4 rounded-lg border border-border bg-surface p-5 shadow-md">
      <span className={cn("inline-flex h-[50px] w-[50px] items-center justify-center rounded-lg", toneClasses[metric.tone])}>
        <Icon size={24} strokeWidth={2.1} />
      </span>
      <div>
        <h2 className="m-0 text-base font-semibold text-text-primary">{metric.title}</h2>
        <strong className="mt-2 block text-[24px] font-bold leading-none text-text-primary">{metric.value}</strong>
        <p className="mt-4 text-[13px] text-text-secondary">{metric.helper}</p>
      </div>
    </article>
  );
}

function AiUsageOverview({ items }: { items: AiUsageItem[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className={panelClass}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="m-0 text-base font-semibold text-text-primary">AI Usage Overview</h2>
      </div>
      {items.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(170px,0.9fr)_minmax(180px,1fr)] lg:items-center">
          <div className="relative min-h-[220px]">
            <DoughnutChartBase
              data={{
                labels: items.map((item) => item.label),
                datasets: [{
                  data: items.map((item) => item.count),
                  backgroundColor: items.map((item) => item.color),
                  borderColor: "var(--color-surface)",
                  borderWidth: 2,
                  cutout: "68%",
                  borderRadius: 0,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
              }}
              centerText={String(total)}
              centerSubText="Total AI"
            />
          </div>
          <div className="grid gap-3.5">
            {items.map((item) => (
              <div className="grid grid-cols-[12px_1fr_auto] items-center gap-3 border-b border-border pb-3 text-[13px] text-text-secondary" key={item.label}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>
                  <strong className="font-semibold text-text-primary">{item.label}</strong>
                  <br />
                  {item.count} ({total ? Math.round((item.count / total) * 1000) / 10 : 0}%)
                </span>
                <span>{new Intl.NumberFormat("en-US").format(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="py-4 text-text-secondary">No AI usage has been recorded yet.</p>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const { data, isLoading, isError, refetch } = useDashboardSummary(dateRange.from, dateRange.to);

  return (
    <AdminLayout>
      <div className="grid gap-4">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="m-0 text-[26px] font-extrabold leading-tight text-text-primary">Good morning, Admin!</h1>
            <p className="mt-1.5 text-text-secondary">Here's what's happening with your platform today.</p>
          </div>
          <DateRangePickerPopover
            from={dateRange.from}
            to={dateRange.to}
            onChange={(from, to) => setDateRange({ from, to })}
          />
        </header>

        {isLoading ? <p className="py-4 text-text-secondary">Loading dashboard summary...</p> : null}
        {isError ? (
          <div className={panelClass}>
            <p className="py-4 text-text-secondary">Unable to load dashboard summary.</p>
            <Button type="button" onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : null}

        {data ? (
          <>
            <section className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3" aria-label="Dashboard metrics">
              {data.metrics.map((metric, index) => (
                <MetricTile key={metric.title} metric={metric} index={index} />
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">

              <AiUsageOverview items={data.aiUsage} />

              <article className={panelClass}>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="m-0 text-base font-semibold text-text-primary">Bills Summary</h2>
                </div>
                <div className="space-y-4">
                  {/* First Row */}
                  <div className="grid grid-cols-4 gap-3">
                    {data.bills.slice(0, 4).map((bill) => (
                      <div
                        key={bill.label}
                        className="min-h-[94px] rounded-lg border border-border p-4"
                      >
                        <span className="text-xs text-text-secondary">
                          {bill.label}
                        </span>

                        <strong className="mt-3.5 block text-[24px] font-bold text-text-primary">
                          {bill.value}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {data.bills.slice(4, 7).map((bill, index) => (
                      <div
                        key={bill.label}
                        className={`min-h-[94px] rounded-lg border p-4 ${index === 2
                            ? "border-border bg-muted/40"
                            : "border-border"
                          }`}
                      >
                        <span className="text-xs text-text-secondary">
                          {bill.label}
                        </span>

                        <strong className="mt-3.5 block text-[24px] font-bold text-text-primary">
                          {bill.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(360px,0.95fr)_minmax(420px,1.05fr)]">
              <article className={cn(panelClass, "grid gap-5")}>
                <div className="mb-0 flex items-center justify-between gap-4">
                  <h2 className="m-0 text-base font-semibold text-text-primary">Job Health</h2>
                  <CalendarDays size={22} className="text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-[18px]">
                  <div><span className={mutedTextClass}>Latest Job</span><strong className="mt-2 block text-[13px] font-semibold text-text-primary">{data.jobHealth.latestJob}</strong></div>
                  <div><span className={mutedTextClass}>Status</span><strong className="mt-2 inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-1 text-[13px] font-bold text-primary">{data.jobHealth.status}</strong></div>
                  <div><span className={mutedTextClass}>Started At</span><strong className="mt-2 block text-[13px] font-semibold text-text-primary">{data.jobHealth.startedAt}</strong></div>
                  <div><span className={mutedTextClass}>Finished At</span><strong className="mt-2 block text-[13px] font-semibold text-text-primary">{data.jobHealth.finishedAt}</strong></div>
                  <div><span className={mutedTextClass}>Duration</span><strong className="mt-2 block text-[13px] font-semibold text-text-primary">{data.jobHealth.duration}</strong></div>
                </div>
                <div className="rounded-lg border border-border p-[18px]">
                  <span className={mutedTextClass}>Failed Jobs (Last 24 Hours)</span>
                  <strong className="mt-2 block text-[24px] font-bold text-text-primary">{data.jobHealth.failedLast24Hours}</strong>
                </div>
              </article>

              <article className={panelClass}>
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="m-0 text-base font-semibold text-text-primary">Recent Activity</h2>
                </div>
                <div className="grid">
                  {data.recentActivity.length > 0 ? data.recentActivity.slice(0, 5).map((activity) => (
                    <div className="grid grid-cols-[42px_1fr_auto] gap-3.5 border-b border-border py-3.5" key={activity.id}>
                      <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {activity.tone === "green" ? <CheckCircle2 size={18} /> : <Bot size={18} />}
                      </span>
                      <div>
                        <h3 className="m-0 text-sm font-semibold text-text-primary">{activity.title}</h3>
                        <p className="text-xs text-text-secondary">{activity.subtitle}</p>
                      </div>
                      <time className="text-xs text-text-secondary">{activity.occurredAt}</time>
                    </div>
                  )) : <p className="py-4 text-text-secondary">No recent activity.</p>}
                </div>
              </article>
            </section>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
