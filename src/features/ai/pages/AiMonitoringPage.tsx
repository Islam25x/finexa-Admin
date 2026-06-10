import AdminLayout from "../../../shared/layout/AdminLayout";
import DoughnutChartBase from "../../../shared/chart/DoughnutChartBase";
import { Button, PageHeader } from "../../../shared/ui";
import { useAiUsageSummary } from "../hooks/useAiUsageSummary";

const panelClass = "rounded-lg border border-border bg-surface p-5 shadow-md";
const emptyClass = "py-4 text-text-secondary";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatMoney(value: number): string {
  return `${formatNumber(Math.round(value))} `;
}

export default function AiMonitoringPage() {
  const { data, isLoading, isError, refetch } = useAiUsageSummary();

  return (
    <AdminLayout>
      <div className="grid gap-[18px]">
        <PageHeader title="AI Monitoring" subtitle="Monitor AI usage volume, cost, and source performance." />

        {isLoading ? <p className={emptyClass}>Loading AI usage summary...</p> : null}
        {isError ? (
          <section className={panelClass}>
            <p className={emptyClass}>Unable to load AI usage summary.</p>
            <Button type="button" onClick={() => refetch()}>Try Again</Button>
          </section>
        ) : null}

        {data ? (
          <>
            <section className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
              {[
                ["Total Requests", formatNumber(data.totalRequests)],
                ["Total Cost", formatMoney(data.totalAmount)],
                ["Success Rate", `${Math.round(data.successRate * 10) / 10}%`],
                ["Average Cost", formatMoney(data.averageCost)],
              ].map(([label, value]) => (
                <article className={panelClass} key={label}>
                  <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
                  <strong className="mt-2.5 block text-[30px] font-bold text-text-primary">{value}</strong>
                </article>
              ))}
            </section>

            <section className="grid gap-[18px] lg:grid-cols-[minmax(320px,0.85fr)_minmax(420px,1.15fr)]">
              <article className={panelClass}>
                <h2 className="mb-[18px] text-[17px] font-semibold text-text-primary">Usage Distribution</h2>
                {data.sources.length > 0 ? (
                  <div className="h-80">
                    <DoughnutChartBase
                      data={{
                        labels: data.sources.map((item) => item.source),
                        datasets: [{
                          data: data.sources.map((item) => item.requests),
                          backgroundColor: data.sources.map((item) => item.color),
                          borderColor: "var(--color-surface)",
                          borderWidth: 2,
                          cutout: "100%",
                          borderRadius: 0,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false }, tooltip: { enabled: true } },
                      }}
                      centerText={formatNumber(data.totalRequests)}
                      centerSubText="Requests"
                    />
                  </div>
                ) : (
                  <p className={emptyClass}>No source usage is available.</p>
                )}
              </article>

              <article className={panelClass}>
                <h2 className="mb-[18px] text-[17px] font-semibold text-text-primary">Source Statistics</h2>
                <div className="grid gap-3">
                  {data.sources.length > 0 ? data.sources.map((source) => (
                    <div className="grid grid-cols-[12px_1fr_auto] items-center gap-3.5 rounded-lg border border-border p-4" key={source.source}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                      <div>
                        <strong className="font-semibold text-text-primary">{source.source}</strong>
                        <p className="mt-1 text-[13px] text-text-secondary">
                          {formatNumber(source.requests)} requests - {Math.round(source.percent * 10) / 10}%
                        </p>
                      </div>
                      <span className="text-[13px] text-text-secondary">{formatMoney(source.amount)}</span>
                    </div>
                  )) : <p className={emptyClass}>No source statistics to show.</p>}
                </div>
              </article>
            </section>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}
