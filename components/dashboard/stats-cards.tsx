import { Card, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <Card>
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </Card>
  );
}

export function WeeklyChart({
  data,
}: {
  data: Array<{ label: string; count: number }>;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardTitle className="mb-4">Aktivitas 7 Hari Terakhir</CardTitle>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((day) => (
          <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-28 w-full items-end">
              <div
                className="w-full rounded-t-md bg-red-600 transition-all"
                style={{
                  height: `${(day.count / max) * 100}%`,
                  minHeight: day.count > 0 ? "8px" : "2px",
                  opacity: day.count > 0 ? 1 : 0.2,
                }}
              />
            </div>
            <span className="text-xs text-stone-500">{day.label}</span>
            <span className="text-xs font-medium text-stone-700">{day.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
