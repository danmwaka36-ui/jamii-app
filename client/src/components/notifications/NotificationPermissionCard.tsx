import { useEffect, useMemo, useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMobileAlt,
  FaRedoAlt,
  FaShieldAlt,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";

import {
  enableEmergencyNotifications,
  getNotificationPermission,
  getStoredMessagingToken,
  isEmergencySoundEnabled,
  playEmergencySound,
  refreshDeviceRegistration,
  setEmergencySoundEnabled,
  showLocalNotification,
  type DeviceRegistrationContext,
} from "../../services/notifications/notificationService";

type NotificationPermissionCardProps = DeviceRegistrationContext & {
  title?: string;
  description?: string;
};

type PermissionState =
  | NotificationPermission
  | "unsupported";

function permissionLabel(permission: PermissionState) {
  switch (permission) {
    case "granted":
      return "Enabled";

    case "denied":
      return "Blocked";

    case "default":
      return "Not enabled";

    default:
      return "Unsupported";
  }
}

function permissionClasses(permission: PermissionState) {
  switch (permission) {
    case "granted":
      return {
        container: "border-emerald-200 bg-emerald-50",
        text: "text-emerald-700",
        dot: "bg-emerald-500",
      };

    case "denied":
      return {
        container: "border-red-200 bg-red-50",
        text: "text-red-700",
        dot: "bg-red-500",
      };

    case "default":
      return {
        container: "border-amber-200 bg-amber-50",
        text: "text-amber-700",
        dot: "bg-amber-500",
      };

    default:
      return {
        container: "border-slate-200 bg-slate-100",
        text: "text-slate-600",
        dot: "bg-slate-400",
      };
  }
}

function detectDeviceName() {
  if (typeof navigator === "undefined") {
    return "Unknown device";
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("android")) {
    return "Android device";
  }

  if (
    userAgent.includes("iphone") ||
    userAgent.includes("ipad") ||
    userAgent.includes("ipod")
  ) {
    return "Apple mobile device";
  }

  if (userAgent.includes("windows")) {
    return "Windows computer";
  }

  if (userAgent.includes("mac")) {
    return "Mac computer";
  }

  if (userAgent.includes("linux")) {
    return "Linux computer";
  }

  return "Browser device";
}

export default function NotificationPermissionCard({
  role,
  agencyId,
  agencyName,
  countyCode,
  countyName,
  wardCode,
  wardName,
  title = "Emergency Notifications",
  description = "Register this phone, tablet or computer to receive real-time Jamii emergency alerts.",
}: NotificationPermissionCardProps) {
  const [permission, setPermission] = useState<PermissionState>(
    getNotificationPermission()
  );

  const [soundEnabled, setSoundEnabled] = useState(
    isEmergencySoundEnabled()
  );

  const [registered, setRegistered] = useState(
    Boolean(getStoredMessagingToken())
  );

  const [busyAction, setBusyAction] = useState<
    "notifications" | "refresh" | "sound" | "test" | null
  >(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("info");

  const registrationContext = useMemo<DeviceRegistrationContext>(
    () => ({
      role,
      agencyId,
      agencyName,
      countyCode,
      countyName,
      wardCode,
      wardName,
    }),
    [
      role,
      agencyId,
      agencyName,
      countyCode,
      countyName,
      wardCode,
      wardName,
    ]
  );

  const statusStyles = permissionClasses(permission);
  const deviceName = detectDeviceName();

  useEffect(() => {
    function refreshPermissionStatus() {
      const currentPermission = getNotificationPermission();

      setPermission(currentPermission);
      setRegistered(Boolean(getStoredMessagingToken()));
    }

    window.addEventListener("focus", refreshPermissionStatus);

    return () => {
      window.removeEventListener("focus", refreshPermissionStatus);
    };
  }, []);

  function showMessage(
    text: string,
    type: "success" | "error" | "info"
  ) {
    setMessage(text);
    setMessageType(type);
  }

  async function handleEnableNotifications() {
    try {
      setBusyAction("notifications");
      setMessage("");

      const result = await enableEmergencyNotifications(
        registrationContext
      );

      setPermission(getNotificationPermission());
      setRegistered(Boolean(result.token));

      showMessage(
        result.message,
        result.success ? "success" : "error"
      );
    } catch (error) {
      console.error(error);

      showMessage(
        "Failed to enable emergency notifications.",
        "error"
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleRefreshRegistration() {
    try {
      setBusyAction("refresh");
      setMessage("");

      if (permission !== "granted") {
        showMessage(
          "Enable browser notifications before refreshing this device.",
          "error"
        );

        return;
      }

      const token = await refreshDeviceRegistration(
        registrationContext
      );

      if (!token) {
        showMessage(
          "The device registration could not be refreshed.",
          "error"
        );

        return;
      }

      setRegistered(true);

      showMessage(
        "This device was registered successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showMessage(
        "Failed to refresh this device registration.",
        "error"
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSoundToggle() {
    try {
      setBusyAction("sound");
      setMessage("");

      const nextSoundState = !soundEnabled;

      setEmergencySoundEnabled(nextSoundState);
      setSoundEnabled(nextSoundState);

      if (nextSoundState) {
        const played = await playEmergencySound();

        showMessage(
          played
            ? "Emergency sound is enabled and ready."
            : "Emergency sound was enabled. Your browser may require another interaction before playing audio.",
          played ? "success" : "info"
        );
      } else {
        showMessage(
          "Emergency sound has been disabled on this device.",
          "info"
        );
      }

      if (permission === "granted") {
        try {
          await refreshDeviceRegistration(registrationContext);
        } catch (error) {
          console.warn(
            "Device sound preference could not be synchronized:",
            error
          );
        }
      }
    } catch (error) {
      console.error(error);

      showMessage(
        "Failed to update emergency sound.",
        "error"
      );
    } finally {
      setBusyAction(null);
    }
  }

  async function handleTestNotification() {
    try {
      setBusyAction("test");
      setMessage("");

      if (permission !== "granted") {
        showMessage(
          "Enable notifications before sending a test alert.",
          "error"
        );

        return;
      }

      await showLocalNotification(
        "🚨 Jamii Emergency Test",
        {
          body:
            "Emergency notifications are working correctly on this device.",
          tag: "jamii-notification-test",
          data: {
            url: role === "police" ? "/police" : "/dashboard",
            test: true,
          },
        }
      );

      if (soundEnabled) {
        await playEmergencySound();
      }

      showMessage(
        "Test notification sent successfully.",
        "success"
      );
    } catch (error) {
      console.error(error);

      showMessage(
        "The test notification could not be displayed.",
        "error"
      );
    } finally {
      setBusyAction(null);
    }
  }

  const messageClasses =
    messageType === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : messageType === "error"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-lg shadow-blue-950/40">
              <FaBell />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Jamii Alert System
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                {title}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {description}
              </p>
            </div>
          </div>

          <div
            className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${statusStyles.container} ${statusStyles.text}`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${statusStyles.dot}`}
            />

            {permissionLabel(permission)}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6 lg:p-8">
        {message && (
          <div
            className={`rounded-2xl border p-4 text-sm font-medium ${messageClasses}`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <FaBell className="text-xl text-blue-600" />

              <p className="font-bold text-slate-900">
                Browser Permission
              </p>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Current status
            </p>

            <p
              className={`mt-1 font-extrabold ${statusStyles.text}`}
            >
              {permissionLabel(permission)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <FaMobileAlt className="text-xl text-purple-600" />

              <p className="font-bold text-slate-900">
                Device
              </p>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Registered platform
            </p>

            <p className="mt-1 font-extrabold text-slate-900">
              {deviceName}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <FaShieldAlt className="text-xl text-emerald-600" />

              <p className="font-bold text-slate-900">
                Device Registration
              </p>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Firestore token
            </p>

            <p
              className={`mt-1 font-extrabold ${
                registered
                  ? "text-emerald-700"
                  : "text-amber-700"
              }`}
            >
              {registered ? "Registered" : "Not registered"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <FaVolumeUp className="text-xl text-orange-600" />
              ) : (
                <FaVolumeMute className="text-xl text-slate-500" />
              )}

              <p className="font-bold text-slate-900">
                Emergency Sound
              </p>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Dashboard alert sound
            </p>

            <p
              className={`mt-1 font-extrabold ${
                soundEnabled
                  ? "text-orange-700"
                  : "text-slate-600"
              }`}
            >
              {soundEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>
        </div>

        {permission === "denied" && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <FaExclamationTriangle className="mt-1 shrink-0" />

            <div>
              <p className="font-bold">
                Notifications are blocked
              </p>

              <p className="mt-1 text-sm leading-6">
                Open your browser’s site settings, allow notifications
                for Jamii App and then refresh this page.
              </p>
            </div>
          </div>
        )}

        {permission === "unsupported" && (
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-5 text-slate-700">
            <FaExclamationTriangle className="mt-1 shrink-0" />

            <div>
              <p className="font-bold">
                Notifications are unavailable
              </p>

              <p className="mt-1 text-sm leading-6">
                This browser does not support the notification features
                required by Jamii App. Use a modern version of Chrome,
                Edge or an installed Jamii PWA.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={handleEnableNotifications}
            disabled={
              busyAction !== null ||
              permission === "unsupported"
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaBell />

            {busyAction === "notifications"
              ? "Enabling..."
              : permission === "granted"
                ? "Re-enable Notifications"
                : "Enable Notifications"}
          </button>

          <button
            type="button"
            onClick={handleSoundToggle}
            disabled={busyAction !== null}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              soundEnabled
                ? "bg-slate-700 hover:bg-slate-800"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {soundEnabled ? <FaVolumeMute /> : <FaVolumeUp />}

            {busyAction === "sound"
              ? "Updating..."
              : soundEnabled
                ? "Disable Sound"
                : "Enable Sound"}
          </button>

          <button
            type="button"
            onClick={handleTestNotification}
            disabled={
              busyAction !== null ||
              permission !== "granted"
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaCheckCircle />

            {busyAction === "test"
              ? "Sending..."
              : "Test Notification"}
          </button>

          <button
            type="button"
            onClick={handleRefreshRegistration}
            disabled={
              busyAction !== null ||
              permission !== "granted"
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaRedoAlt
              className={
                busyAction === "refresh"
                  ? "animate-spin"
                  : ""
              }
            />

            {busyAction === "refresh"
              ? "Refreshing..."
              : "Refresh Device"}
          </button>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="font-bold text-blue-900">
            Notification routing profile
          </h3>

          <div className="mt-4 grid gap-3 text-sm text-blue-800 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                Role
              </p>

              <p className="mt-1 font-semibold capitalize">
                {role || "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                Agency
              </p>

              <p className="mt-1 font-semibold">
                {agencyName || agencyId || "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                County
              </p>

              <p className="mt-1 font-semibold">
                {countyName || countyCode || "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                Ward
              </p>

              <p className="mt-1 font-semibold">
                {wardName || wardCode || "Not assigned"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}