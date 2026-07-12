import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  FaChevronLeft,
  FaChevronRight,
  FaSort,
  FaSortDown,
  FaSortUp,
} from "react-icons/fa";

export type DataTableColumn<T> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | Date | null | undefined;
};

type SortDirection = "asc" | "desc";

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;

  loading?: boolean;
  emptyMessage?: string;

  pageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;

  selectable?: boolean;
  selectedRowIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;

  onRowClick?: (row: T) => void;

  caption?: string;
  className?: string;
};

function compareValues(
  first: string | number | Date | null | undefined,
  second: string | number | Date | null | undefined
) {
  if (first == null && second == null) return 0;
  if (first == null) return 1;
  if (second == null) return -1;

  if (first instanceof Date && second instanceof Date) {
    return first.getTime() - second.getTime();
  }

  if (typeof first === "number" && typeof second === "number") {
    return first - second;
  }

  return String(first).localeCompare(String(second), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export default function DataTable<T>({
  columns,
  data,
  getRowId,

  loading = false,
  emptyMessage = "No records found.",

  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  showPagination = true,

  selectable = false,
  selectedRowIds = [],
  onSelectionChange,

  onRowClick,

  caption,
  className = "",
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return data;
    }

    const column = columns.find(
      (item) => String(item.key) === sortKey
    );

    if (!column) {
      return data;
    }

    return [...data].sort((first, second) => {
      const firstValue = column.sortValue
        ? column.sortValue(first)
        : (first as Record<string, unknown>)[sortKey] as
            | string
            | number
            | Date
            | null
            | undefined;

      const secondValue = column.sortValue
        ? column.sortValue(second)
        : (second as Record<string, unknown>)[sortKey] as
            | string
            | number
            | Date
            | null
            | undefined;

      const result = compareValues(firstValue, secondValue);

      return sortDirection === "asc" ? result : -result;
    });
  }, [columns, data, sortDirection, sortKey]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / rowsPerPage)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    if (!showPagination) {
      return sortedData;
    }

    const start = (safeCurrentPage - 1) * rowsPerPage;

    return sortedData.slice(start, start + rowsPerPage);
  }, [
    rowsPerPage,
    safeCurrentPage,
    showPagination,
    sortedData,
  ]);

  const visibleRowIds = paginatedData.map(getRowId);

  const allVisibleSelected =
    visibleRowIds.length > 0 &&
    visibleRowIds.every((id) => selectedRowIds.includes(id));

  function handleSort(column: DataTableColumn<T>) {
    if (!column.sortable) {
      return;
    }

    const nextKey = String(column.key);

    if (sortKey === nextKey) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(nextKey);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  }

  function toggleRow(rowId: string) {
    if (!onSelectionChange) {
      return;
    }

    if (selectedRowIds.includes(rowId)) {
      onSelectionChange(
        selectedRowIds.filter((id) => id !== rowId)
      );
    } else {
      onSelectionChange([...selectedRowIds, rowId]);
    }
  }

  function toggleVisibleRows() {
    if (!onSelectionChange) {
      return;
    }

    if (allVisibleSelected) {
      onSelectionChange(
        selectedRowIds.filter(
          (id) => !visibleRowIds.includes(id)
        )
      );
    } else {
      onSelectionChange(
        Array.from(
          new Set([...selectedRowIds, ...visibleRowIds])
        )
      );
    }
  }

  function getSortIcon(column: DataTableColumn<T>) {
    if (!column.sortable) {
      return null;
    }

    const columnKey = String(column.key);

    if (sortKey !== columnKey) {
      return <FaSort className="text-slate-400" />;
    }

    return sortDirection === "asc" ? (
      <FaSortUp className="text-blue-600" />
    ) : (
      <FaSortDown className="text-blue-600" />
    );
  }

  const firstVisibleRow =
    sortedData.length === 0
      ? 0
      : (safeCurrentPage - 1) * rowsPerPage + 1;

  const lastVisibleRow = showPagination
    ? Math.min(
        safeCurrentPage * rowsPerPage,
        sortedData.length
      )
    : sortedData.length;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          {caption && (
            <caption className="sr-only">
              {caption}
            </caption>
          )}

          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-4">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleVisibleRows}
                    aria-label="Select all visible rows"
                    className="h-4 w-4 rounded border-slate-300"
                  />
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500 ${column.headerClassName || ""}`}
                >
                  <button
                    type="button"
                    disabled={!column.sortable}
                    onClick={() => handleSort(column)}
                    className={`flex items-center gap-2 ${
                      column.sortable
                        ? "cursor-pointer hover:text-slate-900"
                        : "cursor-default"
                    }`}
                  >
                    <span>{column.label}</span>
                    {getSortIcon(column)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`loading-${index}`}>
                  {selectable && (
                    <td className="px-4 py-5">
                      <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
                    </td>
                  )}

                  {columns.map((column) => (
                    <td
                      key={`${String(column.key)}-${index}`}
                      className="px-5 py-5"
                    >
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              paginatedData.map((row) => {
                const rowId = getRowId(row);
                const selected = selectedRowIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row)}
                    className={`transition ${
                      onRowClick
                        ? "cursor-pointer hover:bg-slate-50"
                        : ""
                    } ${
                      selected ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    {selectable && (
                      <td
                        className="px-4 py-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleRow(rowId)}
                          aria-label={`Select row ${rowId}`}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </td>
                    )}

                    {columns.map((column) => {
                      const value = (
                        row as Record<string, unknown>
                      )[String(column.key)];

                      return (
                        <td
                          key={String(column.key)}
                          className={`px-5 py-4 text-slate-700 ${column.className || ""}`}
                        >
                          {column.render
                            ? column.render(row)
                            : value == null
                              ? "—"
                              : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

            {!loading && paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0)
                  }
                  className="px-6 py-12 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showPagination && !loading && sortedData.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {firstVisibleRow}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-700">
              {lastVisibleRow}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700">
              {sortedData.length}
            </span>{" "}
            records
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Rows
              <select
                value={rowsPerPage}
                onChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              disabled={safeCurrentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <FaChevronLeft />
            </button>

            <span className="min-w-20 text-center text-sm font-bold text-slate-700">
              {safeCurrentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setCurrentPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              disabled={safeCurrentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}