import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  FaSearch,
  FaTimes,
} from "react-icons/fa";

type SearchBarProps = {
  value?: string;
  placeholder?: string;

  /**
   * Runs whenever the search text changes.
   * Use this for instant filtering.
   */
  onChange?: (value: string) => void;

  /**
   * Runs when the user presses Enter or clicks Search.
   */
  onSearch?: (value: string) => void;

  /**
   * Runs when the user clears the search.
   */
  onClear?: () => void;

  disabled?: boolean;
  loading?: boolean;
  showSearchButton?: boolean;
  className?: string;
  inputId?: string;
  ariaLabel?: string;
};

export default function SearchBar({
  value = "",
  placeholder = "Search...",
  onChange,
  onSearch,
  onClear,
  disabled = false,
  loading = false,
  showSearchButton = false,
  className = "",
  inputId = "search-input",
  ariaLabel = "Search",
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(value);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  function handleInputChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const nextValue = event.target.value;

    setSearchValue(nextValue);
    onChange?.(nextValue);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSearch?.(searchValue.trim());
  }

  function handleClear() {
    setSearchValue("");
    onChange?.("");
    onClear?.();

    if (onSearch) {
      onSearch("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`flex w-full items-center gap-3 ${className}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
        <FaSearch
          className={`shrink-0 ${
            loading
              ? "animate-pulse text-blue-600"
              : "text-slate-400"
          }`}
        />

        <label htmlFor={inputId} className="sr-only">
          {ariaLabel}
        </label>

        <input
          id={inputId}
          type="search"
          value={searchValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:text-slate-400"
        />

        {searchValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {showSearchButton && (
        <button
          type="submit"
          disabled={disabled || loading}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaSearch />

          <span className="hidden sm:inline">
            {loading ? "Searching..." : "Search"}
          </span>
        </button>
      )}
    </form>
  );
}