import type { ReactNode } from "react";

import {
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

type ConfirmDialogProps = {
  open: boolean;

  title?: string;

  message?: string;

  icon?: ReactNode;

  confirmText?: string;

  cancelText?: string;

  confirmColor?:
    | "red"
    | "blue"
    | "green"
    | "orange";

  loading?: boolean;

  onConfirm: () => void;

  onCancel: () => void;
};

const colors = {
  red: {
    button:
      "bg-red-600 hover:bg-red-700 focus:ring-red-200",
  },

  blue: {
    button:
      "bg-blue-600 hover:bg-blue-700 focus:ring-blue-200",
  },

  green: {
    button:
      "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200",
  },

  orange: {
    button:
      "bg-orange-600 hover:bg-orange-700 focus:ring-orange-200",
  },
};

export default function ConfirmDialog({
  open,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  icon,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "red",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const style = colors[confirmColor];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-5 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

        <div className="flex items-start justify-between border-b border-slate-200 p-6">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">

              {icon ?? <FaExclamationTriangle />}

            </div>

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                {title}
              </h2>

              <p className="mt-2 leading-7 text-slate-500">
                {message}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <FaTimes />
          </button>

        </div>

        <div className="flex flex-col-reverse gap-3 p-6 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-xl px-5 py-3 font-bold text-white transition focus:outline-none focus:ring-4 disabled:opacity-50 ${style.button}`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>

        </div>

      </div>

    </div>
  );
}