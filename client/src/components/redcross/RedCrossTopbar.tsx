import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FaBars,
  FaBell,
  FaFirstAid,
  FaSearch,
  FaTimes,
  FaUserFriends,
} from "react-icons/fa";

import {
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useAuth } from "../../auth/AuthContext";

type RedCrossTopbarProps = {
  onMenuClick: () => void;
};

type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  keywords: string;
  path: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;

  type?: string;

  reportId?: string;

  createdAt?: {
    seconds?: number;
  };
};

const searchItems: SearchItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    subtitle: "Humanitarian operations overview",
    keywords: "home dashboard operations",
    path: "/redcross",
  },

  {
    id: "incidents",
    title: "Emergency Incidents",
    subtitle: "Humanitarian incident management",
    keywords:
      "incident emergency alerts reports disaster",
    path: "/redcross/incidents",
  },

  {
    id: "dispatch",
    title: "Dispatch Centre",
    subtitle: "Teams, vehicles and deployment",
    keywords:
      "dispatch emergency deployment assign team ambulance",
    path: "/redcross/dispatch",
  },

  {
    id: "responders",
    title: "Volunteers & Responders",
    subtitle: "Response personnel management",
    keywords:
      "responder volunteer medic paramedic team personnel",
    path: "/redcross/responders",
  },

  {
    id: "vehicles",
    title: "Ambulances & Rescue Vehicles",
    subtitle: "Fleet operations and readiness",
    keywords:
      "ambulance rescue vehicle fleet truck car",
    path: "/redcross/vehicles",
  },

  {
    id: "drivers",
    title: "Driver Registry",
    subtitle:
      "Drivers, licences and fleet assignments",
    keywords:
      "driver driving licence license assignment fleet",
    path: "/redcross/drivers",
  },

  {
    id: "medical",
    title: "Medical Support",
    subtitle:
      "Emergency medical response coordination",
    keywords:
      "medical patient paramedic health ambulance treatment",
    path: "/redcross/medical",
  },

  {
    id: "shelters",
    title: "Shelters & Relief Centres",
    subtitle:
      "Temporary shelters and humanitarian centres",
    keywords:
      "shelter evacuation displaced relief centre camp",
    path: "/redcross/shelters",
  },

  {
    id: "inventory",
    title: "Relief Inventory",
    subtitle:
      "Humanitarian supplies and distribution",
    keywords:
      "inventory stock supplies food blankets hygiene relief",
    path: "/redcross/inventory",
  },

  {
    id: "blood",
    title: "Blood Coordination",
    subtitle:
      "Blood requests and donor coordination",
    keywords:
      "blood donor donation hospital emergency",
    path: "/redcross/blood",
  },

  {
    id: "gis",
    title: "Live GIS Map",
    subtitle:
      "Incidents, responders and vehicles",
    keywords:
      "gis map gps location tracking",
    path: "/redcross/gis",
  },

  {
    id: "reports",
    title: "Assessments & Reports",
    subtitle:
      "Humanitarian operational reporting",
    keywords:
      "report assessment pdf download statistics",
    path: "/redcross/reports",
  },

  {
    id: "communication",
    title: "Team Communication",
    subtitle:
      "Humanitarian operational messaging",
    keywords:
      "communication messages chat teams",
    path: "/redcross/communication",
  },

  {
    id: "analytics",
    title: "Humanitarian Analytics",
    subtitle:
      "Response performance and trends",
    keywords:
      "analytics statistics performance charts",
    path: "/redcross/analytics",
  },

  {
    id: "settings",
    title: "Settings",
    subtitle:
      "Notifications and response preferences",
    keywords:
      "settings notification sound preferences account",
    path: "/redcross/settings",
  },
];

export default function RedCrossTopbar({
  onMenuClick,
}: RedCrossTopbarProps) {
  const navigate = useNavigate();

  const { currentUser, userProfile } = useAuth();

  const [search, setSearch] = useState("");

  const [desktopSearchOpen, setDesktopSearchOpen] =
    useState(false);

  const [mobileSearchOpen, setMobileSearchOpen] =
    useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const displayName =
    userProfile?.fullName ||
    currentUser?.displayName ||
    currentUser?.email ||
    "Red Cross User";

  const displayRole =
    userProfile?.role === "redcross"
      ? "Response Coordinator"
      : userProfile?.role ||
        "Humanitarian User";

  const filteredSearchItems = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return searchItems.filter((item) => {
      return (
        item.title
          .toLowerCase()
          .includes(value) ||
        item.subtitle
          .toLowerCase()
          .includes(value) ||
        item.keywords
          .toLowerCase()
          .includes(value)
      );
    });
  }, [search]);

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [notifications]
  );

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      return;
    }

    const notificationsRef = collection(
      db,
      "notifications"
    );

    /*
     * Each operational notification should contain:
     *
     * recipientUserId: Firebase UID
     * recipientRole: "redcross"
     * title
     * message
     * read
     * createdAt
     *
     * Later Cloud Functions will create these records
     * when emergencies are routed.
     */

    const notificationsQuery = query(
      notificationsRef,
      where(
        "recipientUserId",
        "==",
        currentUser.uid
      )
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,

      (snapshot) => {
        const loadedNotifications =
          snapshot.docs.map((snapshotDoc) => {
            const data =
              snapshotDoc.data();

            return {
              id: snapshotDoc.id,

              title:
                typeof data.title === "string"
                  ? data.title
                  : "Emergency Notification",

              message:
                typeof data.message ===
                "string"
                  ? data.message
                  : "",

              read: Boolean(data.read),

              type:
                typeof data.type === "string"
                  ? data.type
                  : undefined,

              reportId:
                typeof data.reportId ===
                "string"
                  ? data.reportId
                  : undefined,

              createdAt: data.createdAt,
            } satisfies NotificationItem;
          });

        loadedNotifications.sort(
          (a, b) =>
            (b.createdAt?.seconds ?? 0) -
            (a.createdAt?.seconds ?? 0)
        );

        setNotifications(
          loadedNotifications.slice(0, 25)
        );
      },

      (error) => {
        console.error(
          "Unable to load Red Cross notifications:",
          error
        );
      }
    );

    return unsubscribe;
  }, [currentUser?.uid]);

  function openSearchResult(
    item: SearchItem
  ) {
    navigate(item.path);

    setSearch("");
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
  }

  async function markNotificationRead(
    notification: NotificationItem
  ) {
    if (notification.read) {
      openNotification(notification);
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          "notifications",
          notification.id
        ),
        {
          read: true,
        }
      );
    } catch (error) {
      console.error(
        "Unable to mark notification as read:",
        error
      );
    }

    openNotification(notification);
  }

  function openNotification(
    notification: NotificationItem
  ) {
    setNotificationsOpen(false);

    if (notification.reportId) {
      navigate(
        `/redcross/incidents?incident=${notification.reportId}`
      );

      return;
    }

    switch (notification.type) {
      case "dispatch":
        navigate("/redcross/dispatch");
        break;

      case "vehicle":
        navigate("/redcross/vehicles");
        break;

      case "driver":
        navigate("/redcross/drivers");
        break;

      case "medical":
        navigate("/redcross/medical");
        break;

      case "blood":
        navigate("/redcross/blood");
        break;

      case "shelter":
        navigate("/redcross/shelters");
        break;

      default:
        navigate("/redcross/incidents");
    }
  }

  function formatNotificationTime(
    notification: NotificationItem
  ) {
    const seconds =
      notification.createdAt?.seconds;

    if (!seconds) {
      return "Just now";
    }

    const date = new Date(
      seconds * 1000
    );

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function SearchResults() {
    if (!search.trim()) {
      return null;
    }

    return (
      <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {filteredSearchItems.length ===
        0 ? (
          <div className="p-6 text-center">
            <FaSearch className="mx-auto text-3xl text-slate-300" />

            <p className="mt-3 font-bold text-slate-800">
              No result found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Search incidents, ambulances,
              drivers, responders, GIS or
              reports.
            </p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredSearchItems.map(
              (item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    openSearchResult(item)
                  }
                  className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-red-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                    <FaSearch />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* ================= TOPBAR ================= */}
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md lg:left-72">
        <div className="flex h-20 items-center justify-between gap-2 px-3 sm:px-5 lg:px-6 xl:px-8">
          {/* LEFT */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open navigation"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 lg:hidden"
            >
              <FaBars />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-extrabold text-slate-950 sm:text-base xl:text-lg">
                Emergency Operations Centre
              </h1>

              <p className="hidden truncate text-[11px] text-slate-500 md:block">
                Kenya Red Cross humanitarian
                coordination
              </p>
            </div>
          </div>

          {/* DESKTOP SEARCH */}
          <div className="relative hidden min-w-0 max-w-xl flex-1 px-4 xl:block">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onFocus={() =>
                  setDesktopSearchOpen(true)
                }
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

                  setDesktopSearchOpen(
                    true
                  );
                }}
                placeholder="Search incidents, drivers, vehicles, responders..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
              />

              {desktopSearchOpen && (
                <SearchResults />
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-2">
            {/* MOBILE SEARCH */}
            <button
              type="button"
              onClick={() =>
                setMobileSearchOpen(true)
              }
              aria-label="Open search"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 xl:hidden"
            >
              <FaSearch />
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (current) => !current
                  )
                }
                aria-label="Open notifications"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
              >
                <FaBell />

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-[90] w-[calc(100vw-1.5rem)] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 p-4">
                    <div>
                      <h2 className="font-extrabold text-slate-950">
                        Notifications
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {unreadCount} unread
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
                      <FaBell />
                    </div>
                  </div>

                  <div className="max-h-[440px] overflow-y-auto">
                    {notifications.length ===
                    0 ? (
                      <div className="p-8 text-center">
                        <FaBell className="mx-auto text-4xl text-slate-200" />

                        <p className="mt-4 font-bold text-slate-700">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          New emergency alerts
                          assigned to you will appear
                          here automatically.
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() =>
                              markNotificationRead(
                                notification
                              )
                            }
                            className={`w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                              notification.read
                                ? "bg-white"
                                : "bg-red-50/70"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                                <FaFirstAid />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="font-bold text-slate-900">
                                    {
                                      notification.title
                                    }
                                  </p>

                                  {!notification.read && (
                                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
                                  )}
                                </div>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                  {
                                    notification.message
                                  }
                                </p>

                                <p className="mt-2 text-xs font-semibold text-slate-400">
                                  {formatNotificationTime(
                                    notification
                                  )}
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ONLINE STATUS */}
            <div className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 lg:flex">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              <span className="text-xs font-bold text-emerald-700">
                Network Online
              </span>
            </div>

            {/* USER */}
            <div className="hidden min-w-0 items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 sm:flex">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                <FaUserFriends />
              </div>

              <div className="min-w-0">
                <p
                  title={displayName}
                  className="max-w-36 truncate text-xs font-bold text-slate-900"
                >
                  {displayName}
                </p>

                <p className="max-w-36 truncate text-[10px] text-slate-500">
                  {displayRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE SEARCH ================= */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 p-3 backdrop-blur-sm xl:hidden">
          <div className="mx-auto mt-14 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 p-4">
              <FaSearch className="shrink-0 text-slate-400" />

              <input
                type="search"
                autoFocus
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search Red Cross..."
                className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearch("");
                }}
                aria-label="Close search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {!search.trim() ? (
                <div className="p-8 text-center">
                  <FaSearch className="mx-auto text-3xl text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    Start typing to search.
                  </p>
                </div>
              ) : filteredSearchItems.length ===
                0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No matching result found.
                </div>
              ) : (
                <div className="p-2">
                  {filteredSearchItems.map(
                    (item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          openSearchResult(
                            item
                          )
                        }
                        className="flex w-full items-start gap-3 rounded-xl p-4 text-left transition hover:bg-red-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                          <FaSearch />
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-slate-900">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.subtitle}
                          </p>
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}