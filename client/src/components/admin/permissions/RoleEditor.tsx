import { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaCopy,
  FaSave,
  FaTimes,
  FaUserShield,
} from "react-icons/fa";

import {
  countRolePermissions,
  type PlatformRole,
} from "../../../config/adminPermissions";

type RoleEditorProps = {
  open: boolean;
  role?: PlatformRole | null;
  mode?: "create" | "edit" | "duplicate";
  onClose: () => void;
  onSave: (role: PlatformRole) => void;
};

function createEmptyRole(): PlatformRole {
  return {
    id: `role-${Date.now()}`,
    name: "",
    description: "",
    status: "Active",
    systemRole: false,
    userCount: 0,
    permissions: {},
  };
}

function createDuplicateRole(role: PlatformRole): PlatformRole {
  return {
    ...role,
    id: `role-${Date.now()}`,
    name: `${role.name} Copy`,
    systemRole: false,
    userCount: 0,
    permissions: Object.fromEntries(
      Object.entries(role.permissions).map(
        ([moduleId, actions]) => [
          moduleId,
          [...actions],
        ]
      )
    ),
  };
}

export default function RoleEditor({
  open,
  role,
  mode = "create",
  onClose,
  onSave,
}: RoleEditorProps) {
  const initialRole = useMemo(() => {
    if (mode === "duplicate" && role) {
      return createDuplicateRole(role);
    }

    if (mode === "edit" && role) {
      return {
        ...role,
        permissions: Object.fromEntries(
          Object.entries(role.permissions).map(
            ([moduleId, actions]) => [
              moduleId,
              [...actions],
            ]
          )
        ),
      };
    }

    return createEmptyRole();
  }, [mode, role]);

  const [draftRole, setDraftRole] =
    useState<PlatformRole>(initialRole);

  const [message, setMessage] = useState("");

  useEffect(() => {
    setDraftRole(initialRole);
    setMessage("");
  }, [initialRole]);

  if (!open) {
    return null;
  }

  const permissionCount =
    countRolePermissions(draftRole);

  const heading =
    mode === "edit"
      ? "Edit Role"
      : mode === "duplicate"
        ? "Duplicate Role"
        : "Create Role";

  const icon =
    mode === "duplicate" ? <FaCopy /> : <FaUserShield />;

  function updateField<
    K extends keyof PlatformRole
  >(key: K, value: PlatformRole[K]) {
    setDraftRole((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = draftRole.name.trim();
    const trimmedDescription =
      draftRole.description.trim();

    if (!trimmedName) {
      setMessage("Enter a role name.");
      return;
    }

    if (!trimmedDescription) {
      setMessage("Enter a role description.");
      return;
    }

    onSave({
      ...draftRole,
      name: trimmedName,
      description: trimmedDescription,
    });
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close role editor"
        onClick={onClose}
        className="absolute inset-0"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-950 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-2xl">
              {icon}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
                Access Management
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                {heading}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Configure the role identity before assigning
                module permissions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-3 text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {message && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {message}
            </div>
          )}

          <div>
            <label
              htmlFor="role-name"
              className="text-sm font-bold text-slate-700"
            >
              Role Name
            </label>

            <input
              id="role-name"
              value={draftRole.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              placeholder="Example: Police Investigator"
              autoFocus
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <div>
            <label
              htmlFor="role-description"
              className="text-sm font-bold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="role-description"
              value={draftRole.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe what this role is responsible for."
              rows={4}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="role-status"
                className="text-sm font-bold text-slate-700"
              >
                Status
              </label>

              <select
                id="role-status"
                value={draftRole.status}
                onChange={(event) =>
                  updateField(
                    "status",
                    event.target.value as
                      | "Active"
                      | "Inactive"
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-purple-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-700">
                Current Permissions
              </p>

              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-2xl font-extrabold text-purple-700">
                  {permissionCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Permission actions assigned
                </p>
              </div>
            </div>
          </div>

          {draftRole.systemRole && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              <FaCheck className="mt-1 shrink-0" />

              <div>
                <p className="font-bold">
                  Protected system role
                </p>

                <p className="mt-1 text-sm leading-6">
                  This role is part of the core platform.
                  Its identity may be edited, but deletion
                  should remain restricted.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700"
          >
            <FaSave />

            {mode === "edit"
              ? "Save Changes"
              : mode === "duplicate"
                ? "Create Copy"
                : "Create Role"}
          </button>
        </div>
      </form>
    </div>
  );
}