import { useEffect, useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  FaEnvelope,
  FaIdBadge,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSave,
  FaUser,
  FaUserShield,
} from "react-icons/fa";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../auth/AuthContext";

export default function ProfileSettings() {
  const { currentUser, userProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [constituency, setConstituency] = useState("");
  const [ward, setWard] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || "");
      setPhone((userProfile as any).phone || "");
      setCounty((userProfile as any).county || "");
      setConstituency((userProfile as any).constituency || "");
      setWard((userProfile as any).ward || "");
      setAddress((userProfile as any).address || "");
      setEmergencyContactName((userProfile as any).emergencyContactName || "");
      setEmergencyContactPhone((userProfile as any).emergencyContactPhone || "");
      setRelationship((userProfile as any).relationship || "");
      setBloodGroup((userProfile as any).bloodGroup || "");
    }
  }, [userProfile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUser) return;

    try {
      setLoading(true);
      setMessage("");

      await updateDoc(doc(db, "users", currentUser.uid), {
        fullName,
        phone,
        county,
        constituency,
        ward,
        address,
        emergencyContactName,
        emergencyContactPhone,
        relationship,
        bloodGroup,
        updatedAt: serverTimestamp(),
      });

      setMessage("Profile updated successfully. Refresh if the topbar name does not update immediately.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          👤 Profile Settings
        </h1>
        <p className="mt-2 text-slate-600">
          Manage your Jamii App account, location and emergency information.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
              <FaUser />
              Personal Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
                  <FaEnvelope />
                  {userProfile?.email || currentUser?.email || "Not available"}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Role
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 capitalize text-blue-700">
                  <FaUserShield />
                  {userProfile?.role || "citizen"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
              <FaMapMarkerAlt />
              Location Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  County
                </label>
                <input
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  placeholder="Mombasa"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Constituency
                </label>
                <input
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  placeholder="Nyali"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Ward
                </label>
                <input
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Bamburi / Kazandani"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Address / Estate
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Example: Bamburi, near Naivas"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
              <FaPhoneAlt />
              Emergency Contact
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Contact Name
                </label>
                <input
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="Emergency contact person"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Contact Phone
                </label>
                <input
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Relationship
                </label>
                <input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="Parent, spouse, sibling..."
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {message && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <FaSave />
            {loading ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-lg font-bold text-blue-800">
              Profile Completion
            </h2>
            <p className="mt-3 text-sm leading-6 text-blue-700">
              Complete your profile so responders can reach you faster during emergencies.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Account Details
            </h2>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">User ID</p>
                <p className="mt-1 break-all font-mono text-xs text-slate-700">
                  {currentUser?.uid || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Account Role</p>
                <p className="mt-1 font-bold capitalize text-blue-700">
                  {userProfile?.role || "citizen"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Next Security Features
            </h2>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>✅ Change password</li>
              <li>✅ Email verification</li>
              <li>✅ Notification preferences</li>
              <li>✅ Logout from all devices</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            <FaIdBadge className="mb-3 text-2xl text-slate-500" />
            Profile changes are saved in Firestore under your user document.
          </div>
        </aside>
      </form>
    </div>
  );
}