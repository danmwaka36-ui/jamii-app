import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import {
  FaAmbulance,
  FaFire,
  FaHospital,
  FaPhoneAlt,
  FaShieldAlt,
  FaUsers,
} from "react-icons/fa";

import { db } from "../../firebase/firebase";

type Contact = {
  id: string;
  name: string;
  category: string;
  phone: string;
  location: string;
  available: boolean;
};

const demoContacts: Contact[] = [
  {
    id: "demo-police",
    name: "Police Emergency",
    category: "Police",
    phone: "999 / 112",
    location: "Kenya National Emergency",
    available: true,
  },
  {
    id: "demo-ambulance",
    name: "Ambulance Services",
    category: "Ambulance",
    phone: "998",
    location: "Mombasa County",
    available: true,
  },
  {
    id: "demo-fire",
    name: "Fire Brigade",
    category: "Fire",
    phone: "997",
    location: "Mombasa CBD",
    available: true,
  },
  {
    id: "demo-hospital",
    name: "Coast General Hospital",
    category: "Hospital",
    phone: "+254 700 000 000",
    location: "Mombasa Island",
    available: true,
  },
  {
    id: "demo-community",
    name: "Nyumba Kumi Desk",
    category: "Community",
    phone: "+254 711 000 000",
    location: "Bamburi",
    available: true,
  },
];

function contactIcon(category: string) {
  if (category === "Police") return <FaShieldAlt />;
  if (category === "Ambulance") return <FaAmbulance />;
  if (category === "Fire") return <FaFire />;
  if (category === "Hospital") return <FaHospital />;
  return <FaUsers />;
}

function contactColor(category: string) {
  if (category === "Police") return "bg-blue-100 text-blue-700";
  if (category === "Ambulance") return "bg-emerald-100 text-emerald-700";
  if (category === "Fire") return "bg-red-100 text-red-700";
  if (category === "Hospital") return "bg-purple-100 text-purple-700";
  return "bg-amber-100 text-amber-700";
}

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "emergencyContacts"),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Contact[];

        setContacts(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setContacts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const visibleContacts =
    contacts.length > 0 ? contacts : demoContacts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          📞 Emergency Contacts
        </h1>

        <p className="mt-2 text-slate-600">
          Quick access to emergency numbers, hospitals, responders and community safety desks.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="grid gap-5 md:grid-cols-2">
          {loading ? (
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              Loading emergency contacts...
            </div>
          ) : (
            visibleContacts.map((contact) => (
              <div
                key={contact.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`${contactColor(
                      contact.category
                    )} flex h-14 w-14 items-center justify-center rounded-2xl text-2xl`}
                  >
                    {contactIcon(contact.category)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-slate-950">
                          {contact.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {contact.category} • {contact.location}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          contact.available
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {contact.available ? "Available" : "Offline"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          Emergency Number
                        </p>
                        <p className="font-bold text-slate-900">
                          {contact.phone}
                        </p>
                      </div>

                      <a
                        href={`tel:${contact.phone.replaceAll(" ", "")}`}
                        className="rounded-xl bg-blue-600 p-3 text-white hover:bg-blue-700"
                      >
                        <FaPhoneAlt />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <h2 className="text-lg font-bold text-red-700">
              Emergency Reminder
            </h2>

            <p className="mt-3 text-sm leading-6 text-red-700">
              If you are in immediate danger, call emergency services directly and also submit a Jamii App report.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Contact Categories
            </h2>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>👮 Police and security response</li>
              <li>🚑 Ambulance and hospitals</li>
              <li>🚒 Fire and rescue services</li>
              <li>👥 Community and Nyumba Kumi desks</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}