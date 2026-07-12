import { useMemo, useState } from "react";
import {
  Bar,
  Doughnut,
  Line,
} from "react-chartjs-2";

import {
  CategoryScale,
  Chart as ChartJS,
  ArcElement,
  BarElement,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";

import {
  FaChartBar,
  FaChartLine,
  FaChartPie,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartType = "line" | "bar" | "doughnut";

export type AnalyticsDataItem = {
  label: string;
  value: number;
};

type AnalyticsChartProps = {
  title?: string;
  description?: string;
  data?: AnalyticsDataItem[];
  chartType?: ChartType;
  loading?: boolean;
  showChartSelector?: boolean;
  valueLabel?: string;
  height?: number;
};

const defaultData: AnalyticsDataItem[] = [
  {
    label: "Fire",
    value: 18,
  },
  {
    label: "Police",
    value: 35,
  },
  {
    label: "Medical",
    value: 24,
  },
  {
    label: "Flood",
    value: 12,
  },
  {
    label: "Road Accident",
    value: 21,
  },
  {
    label: "Community",
    value: 9,
  },
];

export default function AnalyticsChart({
  title = "Emergency Analytics",
  description = "Emergency reports grouped by incident category.",
  data = defaultData,
  chartType = "bar",
  loading = false,
  showChartSelector = true,
  valueLabel = "Emergency Reports",
  height = 360,
}: AnalyticsChartProps) {
  const [selectedChartType, setSelectedChartType] =
    useState<ChartType>(chartType);

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const highestItem = useMemo(() => {
    if (data.length === 0) {
      return null;
    }

    return data.reduce((highest, current) =>
      current.value > highest.value ? current : highest
    );
  }, [data]);

  const chartData = useMemo<ChartData<ChartType>>(
    () => ({
      labels: data.map((item) => item.label),
      datasets: [
        {
          label: valueLabel,
          data: data.map((item) => item.value),

          backgroundColor:
            selectedChartType === "doughnut"
              ? [
                  "rgba(37, 99, 235, 0.78)",
                  "rgba(220, 38, 38, 0.78)",
                  "rgba(5, 150, 105, 0.78)",
                  "rgba(8, 145, 178, 0.78)",
                  "rgba(234, 88, 12, 0.78)",
                  "rgba(124, 58, 237, 0.78)",
                  "rgba(71, 85, 105, 0.78)",
                ]
              : "rgba(37, 99, 235, 0.72)",

          borderColor:
            selectedChartType === "doughnut"
              ? [
                  "rgb(37, 99, 235)",
                  "rgb(220, 38, 38)",
                  "rgb(5, 150, 105)",
                  "rgb(8, 145, 178)",
                  "rgb(234, 88, 12)",
                  "rgb(124, 58, 237)",
                  "rgb(71, 85, 105)",
                ]
              : "rgb(37, 99, 235)",

          borderWidth: 2,
          borderRadius: selectedChartType === "bar" ? 8 : 0,
          tension: selectedChartType === "line" ? 0.35 : 0,
          fill: selectedChartType === "line",
          pointRadius: selectedChartType === "line" ? 4 : 0,
          pointHoverRadius: selectedChartType === "line" ? 6 : 0,
        },
      ],
    }),
    [data, selectedChartType, valueLabel]
  );

  const chartOptions = useMemo<ChartOptions<ChartType>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        intersect: false,
        mode: "index",
      },

      plugins: {
        legend: {
          display: selectedChartType === "doughnut",
          position: "bottom",

          labels: {
            usePointStyle: true,
            padding: 18,
            font: {
              size: 12,
              weight: 600,
            },
          },
        },

        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          padding: 12,
          titleFont: {
            size: 13,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
          },
          cornerRadius: 10,
        },
      },

      scales:
        selectedChartType === "doughnut"
          ? undefined
          : {
              x: {
                grid: {
                  display: false,
                },

                ticks: {
                  color: "#64748b",
                  font: {
                    size: 11,
                    weight: 600,
                  },
                },
              },

              y: {
                beginAtZero: true,

                grid: {
                  color: "rgba(148, 163, 184, 0.18)",
                },

                ticks: {
                  precision: 0,
                  color: "#64748b",
                },
              },
            },

      cutout:
        selectedChartType === "doughnut"
          ? "62%"
          : undefined,
    }),
    [selectedChartType]
  );

  function renderChart() {
    if (selectedChartType === "line") {
      return (
        <Line
          data={chartData as ChartData<"line">}
          options={chartOptions as ChartOptions<"line">}
        />
      );
    }

    if (selectedChartType === "doughnut") {
      return (
        <Doughnut
          data={chartData as ChartData<"doughnut">}
          options={chartOptions as ChartOptions<"doughnut">}
        />
      );
    }

    return (
      <Bar
        data={chartData as ChartData<"bar">}
        options={chartOptions as ChartOptions<"bar">}
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        {showChartSelector && (
          <div className="flex w-fit items-center gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setSelectedChartType("bar")}
              aria-label="Show bar chart"
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                selectedChartType === "bar"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <FaChartBar />
            </button>

            <button
              type="button"
              onClick={() => setSelectedChartType("line")}
              aria-label="Show line chart"
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                selectedChartType === "line"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <FaChartLine />
            </button>

            <button
              type="button"
              onClick={() => setSelectedChartType("doughnut")}
              aria-label="Show doughnut chart"
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                selectedChartType === "doughnut"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <FaChartPie />
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 border-b border-slate-100 bg-slate-50 p-5 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Total Reports
          </p>

          <p className="mt-1 text-2xl font-extrabold text-slate-950">
            {total.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Categories
          </p>

          <p className="mt-1 text-2xl font-extrabold text-blue-700">
            {data.length}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Highest Category
          </p>

          <p className="mt-1 truncate text-lg font-extrabold text-red-700">
            {highestItem
              ? `${highestItem.label} (${highestItem.value})`
              : "No data"}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div
            className="animate-pulse rounded-2xl bg-slate-100"
            style={{ height }}
          />
        ) : data.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500"
            style={{ height }}
          >
            No analytics data is currently available.
          </div>
        ) : (
          <div style={{ height }}>
            {renderChart()}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <p className="text-xs leading-5 text-slate-500">
          The chart currently uses demonstration information. Live Firestore
          emergency-report data will replace it when the Master Dashboard is
          assembled.
        </p>
      </div>
    </section>
  );
}