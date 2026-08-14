import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  FaBars,
  FaBell,
  FaFirstAid,
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
  FaUserFriends,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
  FaAmbulance,
  FaFire,
  FaWater,
  FaShieldAlt,
  FaHospital,
  FaVolumeUp,
  FaVolumeMute,
  FaPlay,
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

type TimestampLike = {
  seconds?: number;
  nanoseconds?: number;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type?: string;
  reportId?: string;
  createdAt?: TimestampLike;
  latitude?: number;
  longitude?: number;
  priority?: string;
  source?: "notification" | "incident";
};

type IncidentReport = {
  id: string;
  title: string;
  message: string;

  type?: string;

  redcrossRelevant?: boolean;

  emergencyType?: string;
  incidentType?: string;

  priority?: string;
  severity?: string;

  status?: string;

  assignedRole?: string;
  assignedTeam?: string;

  assignedAgency?: string;
  agency?: string;

  reportedBy?: string;
  reporterName?: string;
  reporterPhone?: string;

  location?: unknown;

  latitude?: number;
  longitude?: number;

  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
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
    keywords: "incident emergency alerts reports disaster",
    path: "/redcross/incidents",
  },
  {
    id: "dispatch",
    title: "Dispatch Centre",
    subtitle: "Teams, vehicles and deployment",
    keywords: "dispatch emergency deployment assign team ambulance",
    path: "/redcross/dispatch",
  },
  {
    id: "responders",
    title: "Volunteers & Responders",
    subtitle: "Response personnel management",
    keywords: "responder volunteer medic paramedic team personnel",
    path: "/redcross/responders",
  },
  {
    id: "vehicles",
    title: "Ambulances & Rescue Vehicles",
    subtitle: "Fleet operations and readiness",
    keywords: "ambulance rescue vehicle fleet truck car",
    path: "/redcross/vehicles",
  },
  {
    id: "drivers",
    title: "Driver Registry",
    subtitle: "Drivers, licences and fleet assignments",
    keywords: "driver driving licence license assignment fleet",
    path: "/redcross/drivers",
  },
  {
    id: "medical",
    title: "Medical Support",
    subtitle: "Emergency medical response coordination",
    keywords: "medical patient paramedic health ambulance treatment",
    path: "/redcross/medical",
  },
  {
    id: "shelters",
    title: "Shelters & Relief Centres",
    subtitle: "Temporary shelters and humanitarian centres",
    keywords: "shelter evacuation displaced relief centre camp",
    path: "/redcross/shelters",
  },
  {
    id: "inventory",
    title: "Relief Inventory",
    subtitle: "Humanitarian supplies and distribution",
    keywords: "inventory stock supplies food blankets hygiene relief",
    path: "/redcross/inventory",
  },
  {
    id: "blood",
    title: "Blood Coordination",
    subtitle: "Blood requests and donor coordination",
    keywords: "blood donor donation hospital emergency",
    path: "/redcross/blood",
  },
  {
    id: "gis",
    title: "Live GIS Map",
    subtitle: "Incidents, responders and vehicles",
    keywords: "gis map gps location tracking",
    path: "/redcross/gis",
  },
  {
    id: "reports",
    title: "Assessments & Reports",
    subtitle: "Humanitarian operational reporting",
    keywords: "report assessment pdf download statistics",
    path: "/redcross/reports",
  },
  {
    id: "communication",
    title: "Team Communication",
    subtitle: "Humanitarian operational messaging",
    keywords: "communication messages chat teams",
    path: "/redcross/communication",
  },
  {
    id: "analytics",
    title: "Humanitarian Analytics",
    subtitle: "Response performance and trends",
    keywords: "analytics statistics performance charts",
    path: "/redcross/analytics",
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "Notifications and response preferences",
    keywords: "settings notification sound preferences account",
    path: "/redcross/settings",
  },
];

function getTimestampSeconds(
  value?: TimestampLike | null
): number {
  if (!value) return 0;

  if (typeof value.seconds === "number") {
    return value.seconds;
  }

  return 0;
}

function extractCoordinates(
  location: unknown,
  latitude?: number,
  longitude?: number
): {
  latitude?: number;
  longitude?: number;
} {
  if (
    typeof latitude === "number" &&
    typeof longitude === "number"
  ) {
    return {
      latitude,
      longitude,
    };
  }

  if (location && typeof location === "object") {
    const value = location as Record<string, unknown>;

    const lat =
      typeof value.latitude === "number"
        ? value.latitude
        : typeof value.lat === "number"
          ? value.lat
          : undefined;

    const lng =
      typeof value.longitude === "number"
        ? value.longitude
        : typeof value.lng === "number"
          ? value.lng
          : undefined;

    if (
      typeof lat === "number" &&
      typeof lng === "number"
    ) {
      return {
        latitude: lat,
        longitude: lng,
      };
    }
  }

  return {};
}

function normalizeIncident(
  id: string,
  data: Record<string, unknown>
): IncidentReport {
  const coordinates = extractCoordinates(
    data.location,
    typeof data.latitude === "number"
      ? data.latitude
      : undefined,
    typeof data.longitude === "number"
      ? data.longitude
      : undefined
  );

  const type =
    typeof data.emergencyType === "string"
      ? data.emergencyType
      : typeof data.incidentType === "string"
        ? data.incidentType
        : typeof data.type === "string"
          ? data.type
          : "Emergency Incident";

  const priority =
    typeof data.priority === "string"
      ? data.priority
      : typeof data.severity === "string"
        ? data.severity
        : "High";

  const title =
    typeof data.title === "string"
      ? data.title
      : type;

  const message =
    typeof data.description === "string"
      ? data.description
      : typeof data.message === "string"
        ? data.message
        : "A new emergency incident has been received.";

  return {
    id,
    title,
    message,
    type,

    redcrossRelevant:
      data.redcrossRelevant === true,

    emergencyType:
      typeof data.emergencyType === "string"
        ? data.emergencyType
        : undefined,

    incidentType:
      typeof data.incidentType === "string"
        ? data.incidentType
        : undefined,

    priority,

    severity:
      typeof data.severity === "string"
        ? data.severity
        : undefined,

    status:
      typeof data.status === "string"
        ? data.status
        : "Incoming",

    assignedRole:
      typeof data.assignedRole === "string"
        ? data.assignedRole
        : undefined,

    assignedTeam:
      typeof data.assignedTeam === "string"
        ? data.assignedTeam
        : undefined,

    assignedAgency:
      typeof data.assignedAgency === "string"
        ? data.assignedAgency
        : undefined,

    agency:
      typeof data.agency === "string"
        ? data.agency
        : undefined,

    reportedBy:
      typeof data.reportedBy === "string"
        ? data.reportedBy
        : typeof data.userId === "string"
          ? data.userId
          : typeof data.reporterId === "string"
            ? data.reporterId
            : undefined,

    reporterName:
      typeof data.reporterName === "string"
        ? data.reporterName
        : undefined,

    reporterPhone:
      typeof data.phone === "string"
        ? data.phone
        : undefined,

    location: data.location,

    latitude: coordinates.latitude,

    longitude: coordinates.longitude,

    createdAt:
      data.createdAt as TimestampLike | undefined,

    updatedAt:
      data.updatedAt as TimestampLike | undefined,
  };
}

function isRelevantToRedCross(
  incident: IncidentReport
): boolean {
  if (incident.redcrossRelevant === true) {
    return true;
  }

  const role =
    incident.assignedRole?.toLowerCase().trim();

  const agency =
    incident.assignedAgency?.toLowerCase().trim();

  const agencyName =
    incident.agency?.toLowerCase().trim();

  const redCrossValues = [
    "redcross",
    "red cross",
    "kenya red cross",
    "kenya redcross",
    "redcross society",
    "kenya red cross society",
  ];

  if (
    role &&
    redCrossValues.includes(role)
  ) {
    return true;
  }

  if (
    agency &&
    redCrossValues.includes(agency)
  ) {
    return true;
  }

  if (
    agencyName &&
    redCrossValues.includes(agencyName)
  ) {
    return true;
  }

  const humanitarianTypes = [
    "fire",
    "medical",
    "flood",
    "accident",
    "community alert",
    "disaster",
    "rescue",
    "humanitarian",
  ];

  const type =
    incident.type?.toLowerCase().trim();

  if (
    type &&
    humanitarianTypes.includes(type)
  ) {
    return true;
  }

  if (
    !role &&
    !agency &&
    !agencyName
  ) {
    return true;
  }

  return false;
}

function getPriorityClasses(
  priority?: string
): string {
  switch (priority?.toLowerCase()) {
    case "critical":
      return "bg-red-600 text-white";

    case "high":
      return "bg-orange-500 text-white";

    case "medium":
      return "bg-amber-400 text-slate-950";

    case "low":
      return "bg-emerald-500 text-white";

    default:
      return "bg-red-600 text-white";
  }
}

function getIncidentIcon(type?: string) {
  const normalized =
    type?.toLowerCase() ?? "";

  if (normalized.includes("fire")) {
    return <FaFire />;
  }

  if (
    normalized.includes("flood") ||
    normalized.includes("water")
  ) {
    return <FaWater />;
  }

  if (
    normalized.includes("medical") ||
    normalized.includes("ambulance")
  ) {
    return <FaAmbulance />;
  }

  if (
    normalized.includes("crime") ||
    normalized.includes("security") ||
    normalized.includes("police")
  ) {
    return <FaShieldAlt />;
  }

  if (normalized.includes("hospital")) {
    return <FaHospital />;
  }

  return <FaExclamationTriangle />;
}

export default function RedCrossTopbar({
  onMenuClick,
}: RedCrossTopbarProps) {
  const navigate = useNavigate();

  const {
    currentUser,
    userProfile,
  } = useAuth();

  const [search, setSearch] =
    useState("");

  const [
    desktopSearchOpen,
    setDesktopSearchOpen,
  ] = useState(false);

  const [
    mobileSearchOpen,
    setMobileSearchOpen,
  ] = useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<NotificationItem[]>([]);

  const [
    incomingIncident,
    setIncomingIncident,
  ] = useState<IncidentReport | null>(null);

  const [
    liveConnected,
    setLiveConnected,
  ] = useState(false);

  const [
    lastSync,
    setLastSync,
  ] = useState<Date | null>(null);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(new Date());

  /*
   * ============================================================
   * AUDIO STATE
   * ============================================================
   */

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const audioUnlockedRef =
    useRef(false);

  const audioUnlockingRef =
    useRef(false);

  const processedIncidents =
    useRef<Set<string>>(
      new Set()
    );

  const [
    audioReady,
    setAudioReady,
  ] = useState(false);

  /*
   * ============================================================
   * USER DISPLAY
   * ============================================================
   */

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

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const filteredSearchItems =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return [];
      }

      return searchItems.filter(
        (item) =>
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
    }, [search]);

  /*
   * ============================================================
   * UNREAD
   * ============================================================
   */

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [notifications]
  );

  /*
   * ============================================================
   * GET AUDIO CONTEXT
   * ============================================================
   */

  const getAudioContext =
    useCallback((): AudioContext | null => {
      if (
        typeof window ===
        "undefined"
      ) {
        return null;
      }

      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) {
        return null;
      }

      if (
        !audioContextRef.current
      ) {
        audioContextRef.current =
          new AudioContextClass();
      }

      return audioContextRef.current;
    }, []);

  /*
   * ============================================================
   * UNLOCK AUDIO
   * ============================================================
   *
   * MUST happen from a user gesture.
   */

  const unlockAudio =
    useCallback(async () => {
      if (audioUnlockingRef.current) {
        return;
      }

      audioUnlockingRef.current =
        true;

      try {
        const context =
          getAudioContext();

        if (!context) {
          setAudioReady(false);
          return;
        }

        if (
          context.state ===
          "suspended"
        ) {
          await context.resume();
        }

        if (
          context.state ===
          "running"
        ) {
          audioUnlockedRef.current =
            true;

          setAudioReady(true);

          console.log(
            "[Red Cross Audio] Audio unlocked successfully."
          );
        } else {
          audioUnlockedRef.current =
            false;

          setAudioReady(false);

          console.warn(
            "[Red Cross Audio] Audio context state:",
            context.state
          );
        }
      } catch (error) {
        audioUnlockedRef.current =
          false;

        setAudioReady(false);

        console.error(
          "[Red Cross Audio] Unable to unlock audio:",
          error
        );
      } finally {
        audioUnlockingRef.current =
          false;
      }
    }, [getAudioContext]);

  /*
   * ============================================================
   * AUTOMATIC AUDIO UNLOCK AFTER USER INTERACTION
   * ============================================================
   */

  useEffect(() => {
    if (audioUnlockedRef.current) {
      return;
    }

    const handleUserInteraction =
      () => {
        void unlockAudio();
      };

    const events = [
      "click",
      "pointerdown",
      "touchstart",
      "keydown",
    ];

    events.forEach(
      (eventName) => {
        document.addEventListener(
          eventName,
          handleUserInteraction,
          {
            once: false,
            passive: true,
          }
        );
      }
    );

    return () => {
      events.forEach(
        (eventName) => {
          document.removeEventListener(
            eventName,
            handleUserInteraction
          );
        }
      );
    };
  }, [unlockAudio]);

  /*
   * ============================================================
   * EMERGENCY ALERT SOUND
   * ============================================================
   *
   * Strong multi-tone EOC alarm.
   */

  const playEmergencyAlert =
    useCallback(async () => {
      try {
        const context =
          getAudioContext();

        if (!context) {
          console.warn(
            "[Red Cross Audio] Web Audio API unavailable."
          );

          return false;
        }

        if (
          context.state ===
          "suspended"
        ) {
          await context.resume();
        }

        if (
          context.state !==
          "running"
        ) {
          setAudioReady(false);

          console.warn(
            "[Red Cross Audio] Context is not running."
          );

          return false;
        }

        audioUnlockedRef.current =
          true;

        setAudioReady(true);

        const now =
          context.currentTime;

        /*
         * Three emergency bursts.
         */

        const tones = [
          {
            start: 0,
            frequency: 880,
          },
          {
            start: 0.22,
            frequency: 660,
          },
          {
            start: 0.44,
            frequency: 880,
          },
          {
            start: 0.90,
            frequency: 880,
          },
          {
            start: 1.12,
            frequency: 660,
          },
          {
            start: 1.34,
            frequency: 880,
          },
          {
            start: 1.80,
            frequency: 1046,
          },
          {
            start: 2.02,
            frequency: 784,
          },
          {
            start: 2.24,
            frequency: 1046,
          },
        ];

        tones.forEach(
          ({
            start,
            frequency,
          }) => {
            const oscillator =
              context.createOscillator();

            const gain =
              context.createGain();

            oscillator.type =
              "square";

            oscillator.frequency.setValueAtTime(
              frequency,
              now + start
            );

            gain.gain.setValueAtTime(
              0.0001,
              now + start
            );

            gain.gain.exponentialRampToValueAtTime(
              0.22,
              now + start + 0.025
            );

            gain.gain.exponentialRampToValueAtTime(
              0.0001,
              now + start + 0.17
            );

            oscillator.connect(
              gain
            );

            gain.connect(
              context.destination
            );

            oscillator.start(
              now + start
            );

            oscillator.stop(
              now + start + 0.19
            );
          }
        );

        console.log(
          "[Red Cross Audio] Emergency alert played."
        );

        return true;
      } catch (error) {
        console.error(
          "[Red Cross Audio] Emergency alert failed:",
          error
        );

        return false;
      }
    }, [getAudioContext]);

  /*
   * ============================================================
   * TEST ALERT
   * ============================================================
   */

  const testAlertSound =
    useCallback(async () => {
      if (!audioUnlockedRef.current) {
        return;
      }

      await playEmergencyAlert();
    }, [
      unlockAudio,
      playEmergencyAlert,
    ]);

  /*
   * ============================================================
   * LIVE CLOCK
   * ============================================================
   */

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setCurrentTime(
          new Date()
        );
      }, 1000);

    return () =>
      window.clearInterval(
        timer
      );
  }, []);

  /*
   * ============================================================
   * ESCAPE
   * ============================================================
   */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      setDesktopSearchOpen(false);
      setMobileSearchOpen(false);
      setNotificationsOpen(false);
      setIncomingIncident(null);
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, []);

  /*
   * ============================================================
   * FIRESTORE NOTIFICATIONS
   * ============================================================
   */

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      return;
    }

    const notificationsRef =
      collection(
        db,
        "notifications"
      );

    const notificationsQuery =
      query(
        notificationsRef,
        where(
          "recipientUserId",
          "==",
          currentUser.uid
        )
      );

    const unsubscribe =
      onSnapshot(
        notificationsQuery,
        (snapshot) => {
          const loadedNotifications =
            snapshot.docs.map(
              (snapshotDoc) => {
                const data =
                  snapshotDoc.data();

                return {
                  id: snapshotDoc.id,

                  title:
                    typeof data.title === "string"
                      ? data.title
                      : "Emergency Notification",

                  message:
                    typeof data.message === "string"
                      ? data.message
                      : "",

                  read: Boolean(
                    data.read
                  ),

                  type:
                    typeof data.type === "string"
                      ? data.type
                      : undefined,

                  reportId:
                    typeof data.reportId === "string"
                      ? data.reportId
                      : undefined,

                  createdAt:
                    data.createdAt as
                      | TimestampLike
                      | undefined,

                  priority:
                    typeof data.priority === "string"
                      ? data.priority
                      : undefined,

                  source:
                    "notification",
                } satisfies NotificationItem;
              }
            );

          loadedNotifications.sort(
            (a, b) =>
              getTimestampSeconds(
                b.createdAt
              ) -
              getTimestampSeconds(
                a.createdAt
              )
          );

          setNotifications(
            (current) => {
              const firestoreReportIds =
                new Set(
                  loadedNotifications
                    .map(
                      (item) =>
                        item.reportId
                    )
                    .filter(
                      Boolean
                    )
                );

              const localIncidentNotifications =
                current.filter(
                  (item) =>
                    item.source ===
                      "incident" &&
                    item.reportId &&
                    !firestoreReportIds.has(
                      item.reportId
                    )
                );

              return [
                ...localIncidentNotifications,
                ...loadedNotifications,
              ]
                .sort(
                  (a, b) =>
                    getTimestampSeconds(
                      b.createdAt
                    ) -
                    getTimestampSeconds(
                      a.createdAt
                    )
                )
                .slice(0, 25);
            }
          );

          setLastSync(
            new Date()
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

  /*
   * ============================================================
   * REAL-TIME REPORT LISTENER
   * ============================================================
   */

  useEffect(() => {
    if (!currentUser?.uid) {
      setLiveConnected(false);
      return;
    }

    const reportsRef =
      collection(
        db,
        "reports"
      );

    const unsubscribe =
      onSnapshot(
        reportsRef,
        (snapshot) => {
          setLiveConnected(true);

          setLastSync(
            new Date()
          );

          snapshot.docChanges().forEach(
            (change) => {
              if (
                change.type !==
                "added"
              ) {
                return;
              }

              const incident =
                normalizeIncident(
                  change.doc.id,
                  change.doc.data()
                );

              console.log(
                "[Red Cross] New report received:",
                incident
              );

              /*
               * ROUTING
               */

              if (
                !isRelevantToRedCross(
                  incident
                )
              ) {
                console.log(
                  "[Red Cross] Report not relevant:",
                  incident.id,
                  incident.type,
                  incident.assignedRole,
                  incident.redcrossRelevant
                );

                return;
              }

              /*
               * DUPLICATE PROTECTION
               */

              if (
                processedIncidents.current.has(
                  incident.id
                )
              ) {
                return;
              }

              /*
               * IMPORTANT:
               * Mark it processed only after
               * routing has passed.
               */

              const createdSeconds =
                getTimestampSeconds(
                  incident.createdAt
                );

              /*
               * Firebase serverTimestamp may
               * initially be unresolved.
               */

              if (
                createdSeconds <= 0
              ) {
                console.log(
                  "[Red Cross] Waiting for resolved createdAt:",
                  incident.id
                );

                return;
              }

              const nowSeconds =
                Math.floor(
                  Date.now() / 1000
                );

              const age =
                nowSeconds -
                createdSeconds;

              const isRecent =
                age >= -10 &&
                age <= 300;

              if (!isRecent) {
                console.log(
                  "[Red Cross] Historical report:",
                  incident.id,
                  "age:",
                  age
                );

                processedIncidents.current.add(
                  incident.id
                );

                return;
              }

              processedIncidents.current.add(
                incident.id
              );

              /*
               * ==================================================
               * NEW EMERGENCY
               * ==================================================
               */

              setIncomingIncident(
                incident
              );

              /*
               * ADD TO BELL
               */

              setNotifications(
                (current) => {
                  const exists =
                    current.some(
                      (item) =>
                        item.reportId ===
                        incident.id
                    );

                  if (exists) {
                    return current;
                  }

                  const notification: NotificationItem =
                    {
                      id:
                        `incident-${incident.id}`,

                      title:
                        `🚨 ${incident.title}`,

                      message:
                        incident.message ||
                        "New emergency incident received.",

                      read: false,

                      type:
                        incident.type ??
                        "incident",

                      reportId:
                        incident.id,

                      createdAt:
                        incident.createdAt,

                      latitude:
                        incident.latitude,

                      longitude:
                        incident.longitude,

                      priority:
                        incident.priority,

                      source:
                        "incident",
                    };

                  return [
                    notification,
                    ...current,
                  ].slice(0, 25);
                }
              );

              /*
               * ==================================================
               * SOUND
               * ==================================================
               *
               * If the operator has already interacted
               * with the dashboard, this should play.
               *
               * If the browser still blocks audio,
               * the console explains why.
               */

              void playEmergencyAlert();

              /*
               * ==================================================
               * BROWSER NOTIFICATION
               * ==================================================
               */

              if (
                typeof window !==
                  "undefined" &&
                "Notification" in window &&
                Notification.permission ===
                  "granted"
              ) {
                try {
                  const browserNotification =
                    new Notification(
                      `🚨 ${incident.title}`,
                      {
                        body:
                          `${incident.priority ?? "HIGH"} priority emergency\n` +
                          incident.message,

                        tag:
                          `jamii-${incident.id}`,

                        requireInteraction:
                          true,
                      }
                    );

                  browserNotification.onclick =
                    () => {
                      window.focus();

                      navigate(
                        `/redcross/incidents?incident=${incident.id}`
                      );

                      browserNotification.close();
                    };
                } catch (error) {
                  console.warn(
                    "[Red Cross] Browser notification failed:",
                    error
                  );
                }
              }
            }
          );
        },
        (error) => {
          console.error(
            "Red Cross emergency listener error:",
            error
          );

          setLiveConnected(false);
        }
      );

    return () => {
      unsubscribe();

      setLiveConnected(false);
    };
  }, [
    currentUser?.uid,
    playEmergencyAlert,
    navigate,
  ]);

  /*
   * ============================================================
   * AUDIO CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      const context =
        audioContextRef.current;

      if (context) {
        void context.close();

        audioContextRef.current =
          null;
      }
    };
  }, []);

  /*
   * ============================================================
   * BROWSER NOTIFICATIONS
   * ============================================================
   */

  async function enableBrowserNotifications() {
    if (
      !("Notification" in window)
    ) {
      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      if (
        permission ===
        "granted"
      ) {
        await unlockAudio();

        await playEmergencyAlert();
      }
    } catch (error) {
      console.error(
        "Unable to enable browser notifications:",
        error
      );
    }
  }

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  function openSearchResult(
    item: SearchItem
  ) {
    navigate(item.path);

    setSearch("");

    setDesktopSearchOpen(
      false
    );

    setMobileSearchOpen(
      false
    );
  }

  /*
   * ============================================================
   * NOTIFICATIONS
   * ============================================================
   */

  async function markNotificationRead(
    notification: NotificationItem
  ) {
    if (
      notification.source ===
      "incident"
    ) {
      setNotifications(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              notification.id
                ? {
                    ...item,
                    read: true,
                  }
                : item
          )
      );

      openNotification(
        notification
      );

      return;
    }

    if (notification.read) {
      openNotification(
        notification
      );

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

    openNotification(
      notification
    );
  }

  function markAllNotificationsRead() {
    setNotifications(
      (current) =>
        current.map(
          (item) => ({
            ...item,
            read: true,
          })
        )
    );
  }

  function openNotification(
    notification: NotificationItem
  ) {
    setNotificationsOpen(
      false
    );

    if (notification.reportId) {
      navigate(
        `/redcross/incidents?incident=${notification.reportId}`
      );

      return;
    }

    switch (
      notification.type
    ) {
      case "dispatch":
        navigate(
          "/redcross/dispatch"
        );
        break;

      case "vehicle":
        navigate(
          "/redcross/vehicles"
        );
        break;

      case "driver":
        navigate(
          "/redcross/drivers"
        );
        break;

      case "medical":
        navigate(
          "/redcross/medical"
        );
        break;

      case "blood":
        navigate(
          "/redcross/blood"
        );
        break;

      case "shelter":
        navigate(
          "/redcross/shelters"
        );
        break;

      default:
        navigate(
          "/redcross/incidents"
        );
    }
  }

  function openIncomingIncident() {
    if (!incomingIncident) {
      return;
    }

    const incidentId =
      incomingIncident.id;

    setIncomingIncident(
      null
    );

    navigate(
      `/redcross/incidents?incident=${incidentId}`
    );
  }

  function openIncidentGIS() {
    if (!incomingIncident) {
      return;
    }

    const {
      latitude,
      longitude,
    } = incomingIncident;

    if (
      typeof latitude === "number" &&
      typeof longitude === "number"
    ) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    navigate(
      "/redcross/gis"
    );
  }

  /*
   * ============================================================
   * FORMATTING
   * ============================================================
   */

  function formatNotificationTime(
    notification: NotificationItem
  ) {
    const seconds =
      getTimestampSeconds(
        notification.createdAt
      );

    if (!seconds) {
      return "Just now";
    }

    const date =
      new Date(seconds * 1000);

    return date.toLocaleString(
      "en-KE",
      {
        timeZone:
          "Africa/Nairobi",

        month: "short",

        day: "numeric",

        hour: "2-digit",

        minute: "2-digit",
      }
    );
  }

  function formatLiveTime() {
    return currentTime.toLocaleTimeString(
      "en-KE",
      {
        timeZone:
          "Africa/Nairobi",

        hour: "2-digit",

        minute: "2-digit",

        second: "2-digit",

        hour12: false,
      }
    );
  }

  /*
   * ============================================================
   * SEARCH RESULTS
   * ============================================================
   */

  function SearchResults() {
    if (!search.trim()) {
      return null;
    }

    return (
      <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {filteredSearchItems.length === 0 ? (
          <div className="p-6 text-center">
            <FaSearch className="mx-auto text-3xl text-slate-300" />

            <p className="mt-3 font-bold text-slate-800">
              No result found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Search incidents,
              ambulances, drivers,
              responders, GIS or
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
                    openSearchResult(
                      item
                    )
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
      {/* ======================================================
          AUDIO ACTIVATION / STATUS
          ====================================================== */}

      {!audioReady && (
        <div className="fixed bottom-4 left-4 z-[180] max-w-sm">
          <div className="rounded-2xl border border-orange-300 bg-white p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <FaVolumeMute />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-900">
                  Emergency sound is locked
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Activate sound so incoming
                  emergencies can trigger the
                  EOC alarm.
                </p>

                <button
                  type="button"
                  onClick={
                    testAlertSound
                  }
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-red-700"
                >
                  <FaPlay />
                  ACTIVATE & TEST SOUND
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          INCOMING EMERGENCY ALERT
          ====================================================== */}

      {incomingIncident && (
        <div className="fixed right-4 top-24 z-[200] w-[calc(100vw-2rem)] max-w-md animate-in slide-in-from-right">
          <div className="overflow-hidden rounded-2xl border-2 border-red-500 bg-white shadow-2xl">
            <div className="flex items-center gap-3 bg-red-600 px-4 py-3 text-white">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                {getIncidentIcon(
                  incomingIncident.type
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-wider">
                  Incoming Emergency
                </p>

                <p className="truncate text-sm font-bold">
                  {incomingIncident.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIncomingIncident(
                    null
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/20"
                aria-label="Dismiss emergency alert"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${getPriorityClasses(
                    incomingIncident.priority
                  )}`}
                >
                  {incomingIncident.priority ??
                    "HIGH"}{" "}
                  Priority
                </span>

                <span className="text-xs font-semibold text-slate-400">
                  {formatLiveTime()}
                </span>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  {getIncidentIcon(
                    incomingIncident.type
                  )}
                </span>

                <span className="text-xs font-bold uppercase text-slate-500">
                  {incomingIncident.type ??
                    "Emergency Incident"}
                </span>
              </div>

              <p className="text-sm leading-6 text-slate-700">
                {incomingIncident.message}
              </p>

              {incomingIncident.reporterName && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Reported by
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {incomingIncident.reporterName}
                  </p>

                  {incomingIncident.reporterPhone && (
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      📞{" "}
                      {
                        incomingIncident.reporterPhone
                      }
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <FaMapMarkerAlt className="text-red-600" />
                  Incident location
                </div>

                {typeof incomingIncident.latitude ===
                    "number" &&
                typeof incomingIncident.longitude ===
                    "number" ? (
                  <>
                    <p className="mt-1 text-xs text-slate-500">
                      {incomingIncident.latitude.toFixed(
                        6
                      )}
                      ,{" "}
                      {incomingIncident.longitude.toFixed(
                        6
                      )}
                    </p>

                    {typeof incomingIncident.location ===
                      "string" && (
                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        {incomingIncident.location}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-1 text-xs text-amber-600">
                    GPS coordinates not
                    available.
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={
                    openIncomingIncident
                  }
                  className="rounded-xl bg-red-600 px-3 py-3 text-xs font-extrabold text-white transition hover:bg-red-700"
                >
                  Open Incident
                </button>

                <button
                  type="button"
                  onClick={
                    openIncidentGIS
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50"
                >
                  <FaMapMarkerAlt className="mr-1 inline" />
                  View Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          TOPBAR
          ====================================================== */}

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
                  setDesktopSearchOpen(
                    true
                  )
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
                setMobileSearchOpen(
                  true
                )
              }
              aria-label="Open search"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 xl:hidden"
            >
              <FaSearch />
            </button>

            {/* LIVE CLOCK */}

            <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 lg:flex">
              <FaClock className="text-red-600" />

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Kenya Time
                </p>

                <p className="font-mono text-xs font-black text-slate-800">
                  {formatLiveTime()}
                </p>
              </div>
            </div>

            {/* SOUND STATUS */}

            <button
              type="button"
              onClick={
                testAlertSound
              }
              title={
                audioReady
                  ? "Test emergency alarm"
                  : "Activate emergency alarm"
              }
              className={`hidden h-11 w-11 items-center justify-center rounded-xl transition lg:flex ${
                audioReady
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200"
              }`}
            >
              {audioReady ? (
                <FaVolumeUp />
              ) : (
                <FaVolumeMute />
              )}
            </button>

            {/* NOTIFICATIONS */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (current) =>
                      !current
                  )
                }
                aria-label="Open notifications"
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
                  incomingIncident
                    ? "animate-pulse bg-red-100 text-red-700"
                    : unreadCount > 0
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
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

                    <div className="flex items-center gap-2">

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={
                            markAllNotificationsRead
                          }
                          title="Mark all as read"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          <FaCheckCircle />
                        </button>
                      )}

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
                        <FaBell />
                      </div>
                    </div>
                  </div>

                  {/* AUDIO CONTROL */}

                  <div className="border-b border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            audioReady
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {audioReady ? (
                            <FaVolumeUp />
                          ) : (
                            <FaVolumeMute />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Emergency sound
                          </p>

                          <p className="text-[10px] text-slate-500">
                            {audioReady
                              ? "Ready for incoming alerts"
                              : "Activation required"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={
                          testAlertSound
                        }
                        className="rounded-lg bg-red-600 px-3 py-2 text-[10px] font-black text-white hover:bg-red-700"
                      >
                        TEST SOUND
                      </button>
                    </div>
                  </div>

                  {/* NETWORK STATUS */}

                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Emergency network
                      </span>

                      <span className="flex items-center gap-1 text-[10px] font-bold">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            liveConnected
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        />

                        {liveConnected
                          ? "Live"
                          : "Disconnected"}
                      </span>
                    </div>
                  </div>

                  {/* NOTIFICATION LIST */}

                  <div className="max-h-[440px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <FaBell className="mx-auto text-4xl text-slate-200" />

                        <p className="mt-4 font-bold text-slate-700">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          New emergency alerts
                          will appear here
                          automatically.
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
                                {notification.source ===
                                "incident" ? (
                                  getIncidentIcon(
                                    notification.type
                                  )
                                ) : (
                                  <FaFirstAid />
                                )}
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

                                {notification.priority && (
                                  <span
                                    className={`mt-2 inline-block rounded-full px-2 py-1 text-[9px] font-black uppercase ${getPriorityClasses(
                                      notification.priority
                                    )}`}
                                  >
                                    {
                                      notification.priority
                                    }
                                  </span>
                                )}

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

                  {/* BROWSER ALERT BUTTON */}

                  <div className="border-t border-slate-100 p-3">
                    <button
                      type="button"
                      onClick={
                        enableBrowserNotifications
                      }
                      className="w-full rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                    >
                      🔔 Enable browser emergency alerts
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LIVE NETWORK */}

            <div
              className={`hidden items-center gap-2 rounded-xl px-3 py-2 lg:flex ${
                liveConnected
                  ? "bg-emerald-50"
                  : "bg-red-50"
              }`}
            >
              <span className="relative flex h-2.5 w-2.5">
                {liveConnected && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}

                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    liveConnected
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />
              </span>

              <div>
                <span
                  className={`text-xs font-bold ${
                    liveConnected
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {liveConnected
                    ? "Live Network"
                    : "Offline"}
                </span>

                {lastSync && (
                  <p className="text-[8px] text-slate-400">
                    Sync{" "}
                    {lastSync.toLocaleTimeString(
                      "en-KE",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    )}
                  </p>
                )}
              </div>
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

      {/* ======================================================
          MOBILE SEARCH
          ====================================================== */}

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
                  setMobileSearchOpen(
                    false
                  );

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
                    Start typing to
                    search.
                  </p>
                </div>
              ) : filteredSearchItems.length ===
                0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No matching result
                  found.
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