import {
  FaDownload,
  FaFileCsv,
  FaFilePdf,
  FaPrint,
} from "react-icons/fa";

import {
  downloadCSV,
  downloadPDF,
  printReport,
} from "../../services/reportService";

import type {
  ReportColumn,
  ReportMeta,
} from "../../services/reportService";

type ReportActionsProps<T> = {
  meta: ReportMeta;

  data: T[];

  columns: ReportColumn<T>[];

  filenamePrefix?: string;

  compact?: boolean;
};

export default function ReportActions<T>({
  meta,
  data,
  columns,
  filenamePrefix,
  compact = false,
}: ReportActionsProps<T>) {
  const disabled =
    data.length === 0;

  const buttonClass =
    "flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

  const sizing = compact
    ? "px-3 py-2 text-xs"
    : "px-4 py-3 text-sm";

  const prefix =
    filenamePrefix ||
    meta.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          printReport({
            meta,
            data,
            columns,
          })
        }
        className={`${buttonClass} ${sizing}`}
      >
        <FaPrint />
        Print
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          downloadPDF({
            meta,
            data,
            columns,
            filename: `${prefix}.pdf`,
          })
        }
        className={`${buttonClass} ${sizing}`}
      >
        <FaFilePdf className="text-red-600" />
        PDF
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          downloadCSV({
            meta,
            data,
            columns,
            filename: `${prefix}.csv`,
          })
        }
        className={`${buttonClass} ${sizing}`}
      >
        <FaFileCsv className="text-emerald-600" />
        CSV
      </button>

      <span
        className={`hidden items-center gap-2 rounded-xl bg-slate-100 font-bold text-slate-500 sm:flex ${sizing}`}
      >
        <FaDownload />
        {data.length} records
      </span>
    </div>
  );
}