import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import {
  FaShieldAlt,
  FaUserShield,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";
import { rolesConfig, type AppRole } from "../../../config/roles";

type AppUser = {
  id: string;
  role?: string;
};

export default function RoleManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as AppUser[];

      setUsers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const roleRows = useMemo(() => {
    return Object.entries(rolesConfig).map(([role, config]) => {
      const count = users.filter((user) => user.role === role).length;

      return {
        role: role as AppRole,
        label: config.label,
        dashboardPath: config.dashboardPath,
        permissions: [...config.permissions],
        count,
      };
    });
  }, [users]);

  const totalRoles = roleRows.length;
  const totalPermissions = roleRows.reduce(
    (sum, role) => sum + role.permissions.length,
    0
  );
  const adminCount =
    roleRows.find((role) => role.role === "admin")?.count || 0;
  const responderCount = roleRows
    .filter((role) =>
      ["police", "fire", "ambulance", "county", "redcross", "nyumbakumi"].includes(
        role.role
      )
    )
    .reduce((sum, role) => sum + role.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          🏷️ Role Management
        </h1>

        <p className="mt-2 text-slate-600">
          Manage platform roles, permissions and dashboard access governance.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaUserShield className="text-3xl text-purple-600" />
          <p className="mt-4 text-sm text-slate-500">System Roles</p>
          <h2 className="text-3xl font-extrabold">{totalRoles}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaCheckCircle className="text-3xl text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Permissions</p>
          <h2 className="text-3xl font-extrabold">{totalPermissions}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaShieldAlt className="text-3xl text-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Responders</p>
          <h2 className="text-3xl font-extrabold">{responderCount}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <FaUsers className="text-3xl text-red-600" />
          <p className="mt-4 text-sm text-slate-500">Admins</p>
          <h2 className="text-3xl font-extrabold">{adminCount}</h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Role Governance Matrix
          </h2>
          <p className="text-sm text-slate-500">
            Roles are currently managed from the centralized role configuration.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-slate-500">Loading role data...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {roleRows.map((role) => (
              <div key={role.role} className="p-6">
                <div className="grid gap-5 xl:grid-cols-[220px_120px_1fr_180px]">
                  <div>
                    <p className="text-lg font-bold text-slate-950">
                      {role.label}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                      {role.role}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Users</p>
                    <p className="mt-1 text-2xl font-extrabold text-blue-700">
                      {role.count}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Permissions</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {role.permissions.map((permission) => (
                        <span
                          key={permission}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Dashboard</p>
                    <p className="mt-2 rounded-xl bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700">
                      {role.dashboardPath}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
        <h2 className="text-lg font-bold text-blue-800">
          SaaS Permission Roadmap
        </h2>

        <p className="mt-3 text-sm leading-6 text-blue-700">
          The next version will allow admins to create custom roles, edit
          permissions, assign module access and enforce permissions throughout
          the platform.
        </p>
      </div>
    </div>
  );
}