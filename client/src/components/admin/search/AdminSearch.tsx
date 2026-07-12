import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaTimes,
  FaArrowRight,
} from "react-icons/fa";

import {
  searchAdminItems,
  type AdminSearchItem,
} from "../../../config/adminSearchData";

export default function AdminSearch() {
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");

  const [results, setResults] = useState<AdminSearchItem[]>([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    setResults(searchAdminItems(query));
  }, [query]);

  function handleNavigate(item: AdminSearchItem) {
    setOpen(false);
    setQuery("");
    navigate(item.path);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-blue-500">
        <FaSearch className="ml-4 text-slate-400" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users, emergencies, GIS, agencies, police..."
          className="w-full bg-transparent px-4 py-3 outline-none"
        />

        {query && (
          <button
            onClick={clearSearch}
            className="mr-3 rounded-lg p-2 hover:bg-slate-100"
            type="button"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {open && query !== "" && (
        <div className="absolute z-50 mt-2 max-h-[420px] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
          {results.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No results found.
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item)}
                className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50"
                type="button"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {item.title}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.description}
                  </p>

                  <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {item.category}
                  </span>
                </div>

                <FaArrowRight className="text-slate-400" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}