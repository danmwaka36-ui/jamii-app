import { useAuth } from "../../auth/AuthContext";
import { FaEnvelope, FaIdBadge, FaUser, FaUserShield } from "react-icons/fa";

export default function ProfileSettings() {
  const { currentUser, userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          👤 Profile Settings
        </h1>
        <p className="mt-2 text-slate-600">
          Manage your Jamii App account information and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Account Information
          </h2>

          <div className="mt-6 grid gap-5">
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-500">
                <FaUser />
                <span className="text-sm font-semibold">Full Name</span>
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {userProfile?.fullName || "Not available"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-500">
                <FaEnvelope />
                <span className="text-sm font-semibold">Email Address</span>
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {userProfile?.email || currentUser?.email || "Not available"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-500">
                <FaUserShield />
                <span className="text-sm font-semibold">Role</span>
              </div>
              <p className="mt-2 text-lg font-bold capitalize text-blue-700">
                {userProfile?.role || "citizen"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-slate-500">
                <FaIdBadge />
                <span className="text-sm font-semibold">User ID</span>
              </div>
              <p className="mt-2 break-all font-mono text-sm text-slate-700">
                {currentUser?.uid || "Not available"}
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-lg font-bold text-blue-800">
              Profile Completion
            </h2>
            <p className="mt-3 text-sm leading-6 text-blue-700">
              Soon you will be able to add phone number, county, ward, profile
              photo and emergency contact person.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Coming Next
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>✅ Edit profile details</li>
              <li>✅ Change password</li>
              <li>✅ Add phone number</li>
              <li>✅ Notification preferences</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}