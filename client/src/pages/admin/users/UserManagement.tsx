import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  FaSearch,
  FaUserShield,
  FaUsers,
  FaCheckCircle,
  FaBan,
} from "react-icons/fa";

import { db } from "../../../firebase/firebase";
import { useAuth } from "../../../auth/AuthContext";

type AppUser = {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  role: string;
  status?: string;
  county?: string;
  ward?: string;
  createdAt?: any;
};

const roles = [
  "citizen",
  "police",
  "fire",
  "ambulance",
  "county",
  "redcross",
  "nyumbakumi",
  "admin",
];

export default function UserManagement() {
  const { currentUser, userProfile } = useAuth();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  async function createAuditLog(data: {
    action: string;
    targetUserId: string;
    targetUserName: string;
    targetUserEmail: string;
    oldValue: string;
    newValue: string;
  }) {
    await addDoc(collection(db, "auditLogs"), {
      ...data,
      performedById: currentUser?.uid || null,
      performedByName: userProfile?.fullName || "Unknown Admin",
      performedByEmail: currentUser?.email || null,
      createdAt: serverTimestamp(),
    });
  }

  async function updateUserRole(user: AppUser, newRole: string) {
    if (user.role === newRole) return;

    const confirmed = confirm(
      `Change ${user.fullName || user.email} from ${user.role} to ${newRole}?`
    );

    if (!confirmed) return;

    try {
      await updateDoc(doc(db, "users", user.id), {
        role: newRole,
        updatedAt: serverTimestamp(),
      });

      await createAuditLog({
        action: "ROLE_CHANGED",
        targetUserId: user.id,
        targetUserName: user.fullName || "Unnamed User",
        targetUserEmail: user.email,
        oldValue: user.role || "citizen",
        newValue: newRole,
      });

      setMessage("User role updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update user role.");
    }
  }

  async function updateUserStatus(user: AppUser, status: string) {
    const currentStatus = user.status || "active";

    const confirmed = confirm(
      `Change ${user.fullName || user.email} status from ${currentStatus} to ${status}?`
    );

    if (!confirmed) return;

    try {
      await updateDoc(doc(db, "users", user.id), {
        status,
        updatedAt: serverTimestamp(),
      });

      await createAuditLog({
        action: "STATUS_CHANGED",
        targetUserId: user.id,
        targetUserName: user.fullName || "Unnamed User",
        targetUserEmail: user.email,
        oldValue: currentStatus,
        newValue: status,
      });

      setMessage("User status updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update user status.");
    }
  }

  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const responders = users.filter((u) =>
    ["police", "fire", "ambulance", "county", "redcross", "nyumbakumi"].includes(
      u.role
    )
  ).length;
  const suspended = users.filter((u) => u.status === "suspended").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          👥 User Management
        </h1>
        <p className="mt-2 text-slate-600">
          Manage registered users, roles, account status and platform access.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-700">
          {message}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <FaUsers className="text-3xl text-blue-600" />
          <p className="mt-4 text-sm text-slate-500">Total Users</p>
          <h2 className="text-3xl font-extrabold">{totalUsers}</h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <FaUserShield className="text-3xl text-purple-600" />
          <p className="mt-4 text-sm text-slate-500">Admins</p>
          <h2 className="text-3xl font-extrabold">{adminUsers}</h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <FaCheckCircle className="text-3xl text-emerald-600" />
          <p className="mt-4 text-sm text-slate-500">Responders</p>
          <h2 className="text-3xl font-extrabold">{responders}</h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <FaBan className="text-3xl text-red-600" />
          <p className="mt-4 text-sm text-slate-500">Suspended</p>
          <h2 className="text-3xl font-extrabold">{suspended}</h2>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:w-96">
            <FaSearch className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-950">
            Registered Users
          </h2>
          <p className="text-sm text-slate-500">
            Live data from Firestore users collection.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">County/Ward</th>
                  <th className="px-6 py-4">Change Role</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">
                        {user.fullName || "Unnamed User"}
                      </p>
                      <p className="text-slate-500">{user.email}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold capitalize text-blue-700">
                        {user.role || "citizen"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          user.status === "suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {user.status || "active"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {user.county || "—"} / {user.ward || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={user.role || "citizen"}
                        onChange={(e) => updateUserRole(user, e.target.value)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      {user.status === "suspended" ? (
                        <button
                          onClick={() => updateUserStatus(user, "active")}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => updateUserStatus(user, "suspended")}
                          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}