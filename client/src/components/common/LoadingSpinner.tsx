type LoadingSpinnerProps = {
  label?: string;
  size?: "small" | "medium" | "large";
  fullPage?: boolean;
  className?: string;
};

const sizeClasses = {
  small: {
    spinner: "h-5 w-5 border-2",
    text: "text-sm",
  },
  medium: {
    spinner: "h-9 w-9 border-4",
    text: "text-sm",
  },
  large: {
    spinner: "h-14 w-14 border-4",
    text: "text-base",
  },
};

export default function LoadingSpinner({
  label = "Loading...",
  size = "medium",
  fullPage = false,
  className = "",
}: LoadingSpinnerProps) {
  const sizes = sizeClasses[size];

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`${sizes.spinner} animate-spin rounded-full border-slate-200 border-t-blue-700`}
        aria-hidden="true"
      />

      {label && (
        <p className={`${sizes.text} font-medium text-slate-500`}>
          {label}
        </p>
      )}

      <span className="sr-only">{label}</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        {content}
      </div>
    );
  }

  return content;
}