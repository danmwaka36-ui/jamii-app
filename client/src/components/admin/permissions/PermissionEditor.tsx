import { useEffect, useState } from "react";
import {
  FaSave,
  FaTimes,
  FaUserShield,
} from "react-icons/fa";

import PermissionMatrix from "./PermissionMatrix";

import {
  countRolePermissions,
  type PermissionAction,
  type PlatformRole,
} from "../../../config/adminPermissions";

type PermissionEditorProps = {
  open: boolean;
  role: PlatformRole | null;
  onClose: () => void;
  onSave: (role: PlatformRole) => void;
};

export default function PermissionEditor({
  open,
  role,
  onClose,
  onSave,
}: PermissionEditorProps) {
  const [draftRole, setDraftRole] =
    useState<PlatformRole | null>(role);

  useEffect(() => {
    setDraftRole(role);
  }, [role]);

  if (!open || !draftRole) {
    return null;
  }

  function togglePermission(
    moduleId: string,
    action: PermissionAction
  ) {
    setDraftRole((current) => {
      if (!current) return current;

      const currentPermissions =
        current.permissions[moduleId] ?? [];

      const exists =
        currentPermissions.includes(action);

      const updated = exists
        ? currentPermissions.filter(
            (permission) => permission !== action
          )
        : [...currentPermissions, action];

      return {
        ...current,
        permissions: {
          ...current.permissions,
          [moduleId]: updated,
        },
      };
    });
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <button
        className="absolute inset-0"
        onClick={onClose}
        type="button"
        aria-label="Close"
      />

      <div className="relative z-10 flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 p-6 text-white">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-2xl">
              <FaUserShield />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-purple-300">
                SaaS Permission Manager
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {draftRole.name}
              </h2>

              <p className="text-sm text-slate-300">
                {draftRole.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="rounded-xl p-3 hover:bg-slate-800"
          >
            <FaTimes />
          </button>

        </div>

        {/* Statistics */}

        <div className="grid grid-cols-3 gap-4 border-b border-slate-200 bg-slate-50 p-6">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Permissions
            </p>

            <h3 className="mt-2 text-3xl font-bold text-purple-700">
              {countRolePermissions(draftRole)}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Status
            </p>

            <h3 className="mt-2 text-xl font-bold text-emerald-700">
              {draftRole.status}
            </h3>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Assigned Users
            </p>

            <h3 className="mt-2 text-3xl font-bold text-blue-700">
              {draftRole.userCount}
            </h3>
          </div>

        </div>

        {/* Permission Matrix */}

        <div className="flex-1 overflow-auto bg-slate-100 p-6">

          <PermissionMatrix
            role={draftRole}
            onTogglePermission={togglePermission}
          />

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white p-6">

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold hover:bg-slate-100"
            type="button"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSave(draftRole)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white hover:bg-purple-700"
          >
            <FaSave />

            Save Permissions
          </button>

        </div>

      </div>
    </div>
  );
}