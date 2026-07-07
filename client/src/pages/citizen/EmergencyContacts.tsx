export default function EmergencyContacts() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">
        📞 Emergency Contacts
      </h1>

      <div className="rounded-2xl bg-white p-8 shadow">
        <p className="text-slate-600">
          Emergency contacts will be loaded from Firestore.
        </p>
      </div>
    </div>
  );
}