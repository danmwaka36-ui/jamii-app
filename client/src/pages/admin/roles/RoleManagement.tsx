import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaCopy,
  FaEdit,
  FaKey,
  FaPlus,
  FaShieldAlt,
  FaTrash,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";

import PageHeader from "../../../components/common/PageHeader";
import SearchBar from "../../../components/common/SearchBar";
import StatusBadge from "../../../components/common/StatusBadge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

import PermissionEditor from "../../../components/admin/permissions/PermissionEditor";
import RoleEditor from "../../../components/admin/permissions/RoleEditor";

import {
  countRolePermissions,
  defaultRoles,
  type PlatformRole,
} from "../../../config/adminPermissions";

type RoleEditorMode =
  | "create"
  | "edit"
  | "duplicate";

type RoleTypeFilter =
  | "all"
  | "system"
  | "custom";

type StatusFilter =
  | "all"
  | "Active"
  | "Inactive";

const LOCAL_STORAGE_KEY = "jamii-platform-roles";

function cloneRole(role: PlatformRole): PlatformRole {
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

function loadStoredRoles(): PlatformRole[] {
  try {
    const savedRoles = localStorage.getItem(
      LOCAL_STORAGE_KEY
    );

    if (!savedRoles) {
      return defaultRoles.map(cloneRole);
    }

    const parsedRoles = JSON.parse(
      savedRoles
    ) as PlatformRole[];

    if (!Array.isArray(parsedRoles)) {
      return defaultRoles.map(cloneRole);
    }

    return parsedRoles.map(cloneRole);
  } catch (error) {
    console.error(
      "Failed to load saved roles:",
      error
    );

    return defaultRoles.map(cloneRole);
  }
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<
    PlatformRole[]
  >(() => loadStoredRoles());

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [roleTypeFilter, setRoleTypeFilter] =
    useState<RoleTypeFilter>("all");

  const [roleEditorOpen, setRoleEditorOpen] =
    useState(false);

  const [roleEditorMode, setRoleEditorMode] =
    useState<RoleEditorMode>("create");

  const [selectedRole, setSelectedRole] =
    useState<PlatformRole | null>(null);

  const [
    permissionEditorOpen,
    setPermissionEditorOpen,
  ] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [roleToDelete, setRoleToDelete] =
    useState<PlatformRole | null>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(roles)
    );
  }, [roles]);

  const filteredRoles = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return roles.filter((role) => {
      const matchesSearch =
        !query ||
        role.name
          .toLowerCase()
          .includes(query) ||
        role.description
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        role.status === statusFilter;

      const matchesType =
        roleTypeFilter === "all" ||
        (roleTypeFilter === "system" &&
          role.systemRole) ||
        (roleTypeFilter === "custom" &&
          !role.systemRole);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    roles,
    roleTypeFilter,
    search,
    statusFilter,
  ]);

  const statistics = useMemo(() => {
    return {
      total: roles.length,

      active: roles.filter(
        (role) => role.status === "Active"
      ).length,

      system: roles.filter(
        (role) => role.systemRole
      ).length,

      custom: roles.filter(
        (role) => !role.systemRole
      ).length,

      users: roles.reduce(
        (total, role) =>
          total + role.userCount,
        0
      ),

      permissions: roles.reduce(
        (total, role) =>
          total +
          countRolePermissions(role),
        0
      ),
    };
  }, [roles]);

  function openCreateRole() {
    setSelectedRole(null);
    setRoleEditorMode("create");
    setRoleEditorOpen(true);
  }

  function openEditRole(
    role: PlatformRole
  ) {
    setSelectedRole(cloneRole(role));
    setRoleEditorMode("edit");
    setRoleEditorOpen(true);
  }

  function openDuplicateRole(
    role: PlatformRole
  ) {
    setSelectedRole(cloneRole(role));
    setRoleEditorMode("duplicate");
    setRoleEditorOpen(true);
  }

  function openPermissionEditor(
    role: PlatformRole
  ) {
    setSelectedRole(cloneRole(role));
    setPermissionEditorOpen(true);
  }

  function requestDeleteRole(
    role: PlatformRole
  ) {
    if (role.systemRole) {
      setMessage(
        "Protected system roles cannot be deleted."
      );

      return;
    }

    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  }

  function saveRole(
    savedRole: PlatformRole
  ) {
    setRoles((currentRoles) => {
      const existingRole =
        currentRoles.find(
          (role) =>
            role.id === savedRole.id
        );

      if (existingRole) {
        return currentRoles.map((role) =>
          role.id === savedRole.id
            ? cloneRole(savedRole)
            : role
        );
      }

      return [
        cloneRole(savedRole),
        ...currentRoles,
      ];
    });

    setRoleEditorOpen(false);
    setSelectedRole(null);

    setMessage(
      roleEditorMode === "edit"
        ? "Role updated successfully."
        : roleEditorMode === "duplicate"
          ? "Role duplicated successfully."
          : "Role created successfully."
    );
  }

  function savePermissions(
    updatedRole: PlatformRole
  ) {
    setRoles((currentRoles) =>
      currentRoles.map((role) =>
        role.id === updatedRole.id
          ? cloneRole(updatedRole)
          : role
      )
    );

    setPermissionEditorOpen(false);
    setSelectedRole(null);

    setMessage(
      `Permissions for ${updatedRole.name} were saved successfully.`
    );
  }

  function confirmDeleteRole() {
    if (!roleToDelete) {
      return;
    }

    setRoles((currentRoles) =>
      currentRoles.filter(
        (role) =>
          role.id !== roleToDelete.id
      )
    );

    setMessage(
      `${roleToDelete.name} was deleted.`
    );

    setDeleteDialogOpen(false);
    setRoleToDelete(null);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setRoleTypeFilter("all");
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Create platform roles, assign module access and manage enterprise permissions across Jamii App."
        icon={<FaUserShield />}
        badge="Enterprise RBAC"
        badgeColor="purple"
        actions={
          <button
            type="button"
            onClick={openCreateRole}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700"
          >
            <FaPlus />
            Create Role
          </button>
        }
      />

      {message && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <div>
            <p className="font-bold">
              Access management updated
            </p>

            <p className="mt-1 text-sm">
              {message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMessage("")}
            className="rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUserShield className="text-2xl text-purple-600" />

          <p className="mt-4 text-sm text-slate-500">
            Total Roles
          </p>

          <p className="mt-1 text-3xl font-extrabold text-slate-950">
            {statistics.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaShieldAlt className="text-2xl text-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">
            Active Roles
          </p>

          <p className="mt-1 text-3xl font-extrabold text-emerald-700">
            {statistics.active}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaKey className="text-2xl text-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            System Roles
          </p>

          <p className="mt-1 text-3xl font-extrabold text-blue-700">
            {statistics.system}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaCopy className="text-2xl text-orange-600" />

          <p className="mt-4 text-sm text-slate-500">
            Custom Roles
          </p>

          <p className="mt-1 text-3xl font-extrabold text-orange-700">
            {statistics.custom}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaUsers className="text-2xl text-cyan-600" />

          <p className="mt-4 text-sm text-slate-500">
            Assigned Users
          </p>

          <p className="mt-1 text-3xl font-extrabold text-cyan-700">
            {statistics.users}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <FaKey className="text-2xl text-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            Permissions
          </p>

          <p className="mt-1 text-3xl font-extrabold text-indigo-700">
            {statistics.permissions}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px_auto]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search roles by name or responsibility..."
            ariaLabel="Search roles"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as StatusFilter
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
          >
            <option value="all">
              All Statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          <select
            value={roleTypeFilter}
            onChange={(event) =>
              setRoleTypeFilter(
                event.target
                  .value as RoleTypeFilter
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
          >
            <option value="all">
              All Role Types
            </option>

            <option value="system">
              System Roles
            </option>

            <option value="custom">
              Custom Roles
            </option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
          >
            Clear Filters
          </button>
        </div>
      </section>

      {filteredRoles.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <FaUserShield className="mx-auto text-5xl text-slate-300" />

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            No roles found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or role filters.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-6 rounded-xl bg-purple-600 px-5 py-3 font-bold text-white transition hover:bg-purple-700"
          >
            Reset Filters
          </button>
        </section>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {filteredRoles.map((role) => {
            const permissionCount =
              countRolePermissions(role);

            return (
              <article
                key={role.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-md"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                        role.systemRole
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {role.systemRole ? (
                        <FaShieldAlt />
                      ) : (
                        <FaUserShield />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-extrabold text-slate-950">
                            {role.name}
                          </h2>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusBadge
                              status={role.status}
                            />

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                role.systemRole
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {role.systemRole
                                ? "System Role"
                                : "Custom Role"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-500">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Users
                      </p>

                      <p className="mt-1 text-2xl font-extrabold text-blue-700">
                        {role.userCount}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Permissions
                      </p>

                      <p className="mt-1 text-2xl font-extrabold text-purple-700">
                        {permissionCount}
                      </p>
                    </div>

                    <div className="col-span-2 rounded-xl bg-slate-50 p-4 sm:col-span-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Modules
                      </p>

                      <p className="mt-1 text-2xl font-extrabold text-emerald-700">
                        {
                          Object.keys(
                            role.permissions
                          ).filter(
                            (moduleId) =>
                              role.permissions[
                                moduleId
                              ]?.length > 0
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
                  <button
                    type="button"
                    onClick={() =>
                      openPermissionEditor(role)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
                  >
                    <FaKey />
                    Permissions
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openEditRole(role)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openDuplicateRole(role)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                  >
                    <FaCopy />
                    Duplicate
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      requestDeleteRole(role)
                    }
                    disabled={Boolean(
                      role.systemRole
                    )}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="rounded-2xl border border-purple-100 bg-purple-50 p-5 text-sm leading-6 text-purple-800">
        <h2 className="font-bold text-purple-950">
          Enterprise permission management
        </h2>

        <p className="mt-2">
          Role changes are currently saved in this browser using
          local storage. Later, this page will synchronize with
          Firestore collections for roles, permissions and user
          assignments.
        </p>
      </section>

      <RoleEditor
        open={roleEditorOpen}
        role={selectedRole}
        mode={roleEditorMode}
        onClose={() => {
          setRoleEditorOpen(false);
          setSelectedRole(null);
        }}
        onSave={saveRole}
      />

      <PermissionEditor
        open={permissionEditorOpen}
        role={selectedRole}
        onClose={() => {
          setPermissionEditorOpen(false);
          setSelectedRole(null);
        }}
        onSave={savePermissions}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Role"
        message={
          roleToDelete
            ? `Delete the "${roleToDelete.name}" role? This action cannot be undone.`
            : "Delete this role?"
        }
        confirmText="Delete Role"
        confirmColor="red"
        onCancel={() => {
          setDeleteDialogOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={confirmDeleteRole}
      />
    </div>
  );
}