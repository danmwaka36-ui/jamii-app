import {
  FaCheckCircle,
  FaMinusCircle,
  FaShieldAlt,
} from "react-icons/fa";

import {
  permissionActionLabels,
  type PermissionAction,
  type PermissionModule,
} from "../../../config/adminPermissions";

type ModulePermissionsProps = {
  module: PermissionModule;
  selectedActions: PermissionAction[];
  onToggleAction: (action: PermissionAction) => void;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  readOnly?: boolean;
};

export default function ModulePermissions({
  module,
  selectedActions,
  onToggleAction,
  onSelectAll,
  onClearAll,
  readOnly = false,
}: ModulePermissionsProps) {
  const selectedCount = module.actions.filter((action) =>
    selectedActions.includes(action)
  ).length;

  const allSelected =
    module.actions.length > 0 &&
    selectedCount === module.actions.length;

  const partiallySelected =
    selectedCount > 0 && selectedCount < module.actions.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl text-purple-700">
            <FaShieldAlt />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-purple-600">
              {module.group}
            </p>

            <h3 className="mt-1 text-lg font-extrabold text-slate-950">
              {module.name}
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {module.description}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-4 py-3 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Selected
          </p>

          <p className="mt-1 text-xl font-extrabold text-purple-700">
            {selectedCount}/{module.actions.length}
          </p>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {module.actions.map((action) => {
          const checked = selectedActions.includes(action);

          return (
            <button
              key={action}
              type="button"
              disabled={readOnly}
              onClick={() => onToggleAction(action)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${
                checked
                  ? "border-purple-300 bg-purple-50 text-purple-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-purple-200 hover:bg-purple-50/50"
              }`}
            >
              <div>
                <p className="font-bold">
                  {permissionActionLabels[action]}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {checked
                    ? "Permission enabled"
                    : "Permission disabled"}
                </p>
              </div>

              {checked ? (
                <FaCheckCircle className="shrink-0 text-xl text-purple-600" />
              ) : (
                <FaMinusCircle className="shrink-0 text-xl text-slate-300" />
              )}
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {allSelected
              ? "All module permissions are enabled."
              : partiallySelected
                ? "Some module permissions are enabled."
                : "No module permissions are enabled."}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClearAll}
              disabled={selectedCount === 0}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear All
            </button>

            <button
              type="button"
              onClick={onSelectAll}
              disabled={allSelected}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Select All
            </button>
          </div>
        </div>
      )}
    </section>
  );
}