import {
  FaBookOpen,
  FaEnvelope,
  FaLifeRing,
  FaQuestionCircle,
  FaShieldAlt,
} from "react-icons/fa";

const faqs = [
  {
    question: "How do I report an emergency?",
    answer:
      "Go to Report Emergency, choose the emergency type, add details, capture GPS location, and submit.",
  },
  {
    question: "Can I track my report?",
    answer:
      "Yes. Open My Reports to view the status of all reports submitted from your account.",
  },
  {
    question: "Who receives my emergency report?",
    answer:
      "Reports are routed based on type: Police, Fire, Ambulance, County, or Nyumba Kumi.",
  },
];

export default function HelpSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">
          ❓ Help & Support
        </h1>
        <p className="mt-2 text-slate-600">
          Get help using Jamii App and learn how emergency reporting works.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="space-y-5">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
                  <FaQuestionCircle />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    {item.question}
                  </h2>
                  <p className="mt-2 text-slate-600">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <FaShieldAlt className="text-3xl text-red-600" />
            <h2 className="mt-4 text-lg font-bold text-red-700">
              Emergency Reminder
            </h2>
            <p className="mt-3 text-sm leading-6 text-red-700">
              If you are in immediate danger, call emergency services directly
              and submit a report in Jamii App.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <FaLifeRing className="text-3xl text-blue-600" />
            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Support Desk
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              support@jamiiapp.ke
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <FaBookOpen className="text-3xl text-emerald-600" />
            <h2 className="mt-4 text-lg font-bold text-slate-950">
              User Guide
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Full user manual and emergency reporting guide will be added here.
            </p>
          </div>

          <a
            href="mailto:support@jamiiapp.ke"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-bold text-white hover:bg-blue-700"
          >
            <FaEnvelope />
            Contact Support
          </a>
        </aside>
      </div>
    </div>
  );
}