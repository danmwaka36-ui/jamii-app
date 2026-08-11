import {
  FaDownload,
  FaFileCsv,
  FaFilePdf,
  FaPrint,
} from "react-icons/fa";

type ReportValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type ReportColumn<T> = {
  label: string;
  value: (record: T) => ReportValue;
};

type Props<T> = {
  title: string;
  fileName: string;
  data: T[];
  columns: ReportColumn<T>[];
  subtitle?: string;
};

function escapeCsv(value: ReportValue) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function escapeHtml(value: ReportValue) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function ReportActions<T>({
  title,
  fileName,
  data,
  columns,
  subtitle,
}: Props<T>) {
  function downloadCSV() {
    const headers = columns.map((column) => column.label);

    const rows = data.map((record) =>
      columns.map((column) => column.value(record))
    );

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) =>
        row.map(escapeCsv).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function openPrintableReport(autoPrint = false) {
    const reportWindow = window.open(
      "",
      "_blank",
      "width=1200,height=850"
    );

    if (!reportWindow) {
      window.alert(
        "The report window was blocked. Please allow pop-ups for Jamii App."
      );
      return;
    }

    const generatedAt = new Date().toLocaleString();

    const tableHead = columns
      .map(
        (column) =>
          `<th>${escapeHtml(column.label)}</th>`
      )
      .join("");

    const tableRows = data
      .map(
        (record) => `
          <tr>
            ${columns
              .map(
                (column) =>
                  `<td>${escapeHtml(
                    column.value(record)
                  )}</td>`
              )
              .join("")}
          </tr>
        `
      )
      .join("");

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <title>${escapeHtml(title)}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 32px;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              color: #0f172a;
              background: white;
            }

            .report-header {
              border-bottom: 3px solid #dc2626;
              padding-bottom: 18px;
              margin-bottom: 24px;
            }

            .brand {
              color: #dc2626;
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            h1 {
              margin: 8px 0 6px;
              font-size: 28px;
            }

            .subtitle {
              color: #64748b;
              font-size: 14px;
              line-height: 1.5;
            }

            .meta {
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              margin-top: 16px;
              color: #475569;
              font-size: 12px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
            }

            th {
              background: #0f172a;
              color: white;
              text-align: left;
              padding: 10px;
              font-size: 12px;
            }

            td {
              border-bottom: 1px solid #e2e8f0;
              padding: 10px;
              font-size: 12px;
              vertical-align: top;
            }

            tr:nth-child(even) {
              background: #f8fafc;
            }

            .footer {
              margin-top: 30px;
              border-top: 1px solid #e2e8f0;
              padding-top: 14px;
              color: #64748b;
              font-size: 11px;
            }

            @media print {
              body {
                padding: 12mm;
              }

              @page {
                size: landscape;
                margin: 10mm;
              }
            }
          </style>
        </head>

        <body>
          <div class="report-header">
            <div class="brand">
              Jamii App • Kenya Red Cross Operations
            </div>

            <h1>${escapeHtml(title)}</h1>

            ${
              subtitle
                ? `<div class="subtitle">${escapeHtml(
                    subtitle
                  )}</div>`
                : ""
            }

            <div class="meta">
              <span>
                Generated:
                ${escapeHtml(generatedAt)}
              </span>

              <span>
                Records:
                ${data.length}
              </span>
            </div>
          </div>

          ${
            data.length === 0
              ? `
                <p>
                  No records are available for this report.
                </p>
              `
              : `
                <table>
                  <thead>
                    <tr>
                      ${tableHead}
                    </tr>
                  </thead>

                  <tbody>
                    ${tableRows}
                  </tbody>
                </table>
              `
          }

          <div class="footer">
            Generated by Jamii App Emergency Operations Platform.
          </div>

          ${
            autoPrint
              ? `
                <script>
                  window.onload = function () {
                    window.print();
                  };
                </script>
              `
              : ""
          }
        </body>
      </html>
    `);

    reportWindow.document.close();
  }

  function printReport() {
    openPrintableReport(true);
  }

  function downloadPDF() {
    /*
     * Browser printing is intentionally used here.
     * The user selects "Save as PDF" from the print dialog.
     *
     * This avoids introducing a large PDF library into
     * the main application bundle at this stage.
     */
    openPrintableReport(true);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={printReport}
        disabled={data.length === 0}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FaPrint />
        <span className="hidden sm:inline">
          Print
        </span>
      </button>

      <button
        type="button"
        onClick={downloadPDF}
        disabled={data.length === 0}
        className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FaFilePdf />
        <span className="hidden sm:inline">
          PDF
        </span>
      </button>

      <button
        type="button"
        onClick={downloadCSV}
        disabled={data.length === 0}
        className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FaFileCsv />

        <span className="hidden sm:inline">
          CSV
        </span>

        <FaDownload className="text-xs opacity-60" />
      </button>
    </div>
  );
}