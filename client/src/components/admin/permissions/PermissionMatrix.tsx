import {
  permissionModules,
  permissionActionLabels,
  type PlatformRole,
  type PermissionAction,
} from "../../../config/adminPermissions";

type PermissionMatrixProps = {
  role: PlatformRole;
  onTogglePermission?: (
    moduleId: string,
    action: PermissionAction
  ) => void;
  readOnly?: boolean;
};

export default function PermissionMatrix({
  role,
  onTogglePermission,
  readOnly = false,
}: PermissionMatrixProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900">
          Permission Matrix
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure module access for this role.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="border-b border-slate-200 px-6 py-4 text-left text-sm font-bold text-slate-700">
                Module
              </th>

              {Object.entries(permissionActionLabels).map(
                ([key, label]) => (
                  <th
                    key={key}
                    className="border-b border-slate-200 px-4 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-600"
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {permissionModules.map((module) => (
              <tr
                key={module.id}
                className="hover:bg-slate-50"
              >
                <td className="border-b border-slate-100 px-6 py-5">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {module.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {module.description}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {module.group}
                    </span>
                  </div>
                </td>

                {(
                  Object.keys(
                    permissionActionLabels
                  ) as PermissionAction[]
                ).map((action) => {
                  const supported =
                    module.actions.includes(action);

                  const checked =
                    role.permissions[module.id]?.includes(
                      action
                    ) ?? false;

                  return (
                    <td
                      key={action}
                      className="border-b border-slate-100 px-4 py-4 text-center"
                    >
                      {!supported ? (
                        <span className="text-slate-300">
                          —
                        </span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={readOnly}
                          onChange={() =>
                            onTogglePermission?.(
                              module.id,
                              action
                            )
                          }
                          className="h-5 w-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-500">
          These permissions are currently stored locally.
          They will later synchronize with Firebase and
          control access across every Jamii App module.
        </p>
      </div>
    </div>
  );
}