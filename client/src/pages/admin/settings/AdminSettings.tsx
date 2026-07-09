import { useState } from "react";
import {
  FaBell,
  FaCog,
  FaEnvelope,
  FaLock,
  FaSave,
  FaShieldAlt,
} from "react-icons/fa";

export default function AdminSettings() {
  const [systemName, setSystemName] = useState("Jamii App");
  const [county, setCounty] = useState("Mombasa County");
  const [supportEmail, setSupportEmail] = useState("support@jamiiapp.ke");
  const [emergencyNumber, setEmergencyNumber] = useState("999");
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [message, setMessage] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    setMessage(
      "Settings saved locally. Firestore settings storage will be connected next."
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          ⚙️ Admin Settings
        </h1>

        <p className="mt-2 text-slate-600">
          Configure platform identity, emergency contacts, notifications and
          security options.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
              <FaCog />
              Platform Settings
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  System Name
                </label>
                <input
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  County / Region
                </label>
                <input
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Support Email
                </label>
                <input
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Main Emergency Number
                </label>
                <input
                  value={emergencyNumber}
                  onChange={(e) => setEmergencyNumber(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-950">
              <FaBell />
              Notification Preferences
            </h2>

            <div className="mt-6 space-y-4">
              <label className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span>
                  <p className="font-bold text-slate-900">SMS Alerts</p>
                  <p className="text-sm text-slate-500">
                    Send emergency updates by SMS.
                  </p>
                </span>

                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-5 w-5"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span>
                  <p className="font-bold text-slate-900">Email Alerts</p>
                  <p className="text-sm text-slate-500">
                    Send system notifications by email.
                  </p>
                </span>

                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-5 w-5"
                />
              </label>

              <label className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <span>
                  <p className="font-bold text-slate-900">Push Notifications</p>
                  <p className="text-sm text-slate-500">
                    Enable browser and app push notifications.
                  </p>
                </span>

                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="h-5 w-5"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <h2 className="flex items-center gap-3 text-xl font-bold text-red-700">
              <FaLock />
              Security Controls
            </h2>

            <label className="mt-6 flex items-center justify-between rounded-xl bg-white p-4">
              <span>
                <p className="font-bold text-slate-900">Maintenance Mode</p>
                <p className="text-sm text-slate-500">
                  Temporarily restrict access during updates.
                </p>
              </span>

              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-5 w-5"
              />
            </label>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-3 rounded-xl bg-purple-600 px-6 py-4 font-bold text-white hover:bg-purple-700"
          >
            <FaSave />
            Save Settings
          </button>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6">
            <FaShieldAlt className="text-3xl text-purple-700" />

            <h2 className="mt-4 text-lg font-bold text-purple-800">
              Admin Configuration
            </h2>

            <p className="mt-3 text-sm leading-6 text-purple-700">
              These settings will later be stored in Firestore so the platform
              can be configured without editing code.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <FaEnvelope className="text-3xl text-blue-600" />

            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Notification Roadmap
            </h2>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>✅ Email alerts</li>
              <li>✅ SMS alerts</li>
              <li>✅ Push notifications</li>
              <li>⏳ WhatsApp alerts</li>
              <li>⏳ Agency escalation rules</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}