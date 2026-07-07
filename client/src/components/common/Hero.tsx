import { Link } from "react-router-dom";
import { FaArrowRight, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-blue-700 text-white">

      <div className="max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Side */}

        <div>

          <span className="bg-red-600 px-4 py-2 rounded-full text-sm font-semibold">
            🚨 Community Emergency Platform
          </span>

          <h1 className="text-5xl lg:text-6xl font-extrabold mt-8 leading-tight">
            Report Emergencies
            <br />
            <span className="text-blue-300">
              In Seconds
            </span>
          </h1>

          <p className="mt-8 text-lg text-slate-300 leading-8">

            Jamii App connects citizens directly with Police,
            Firefighters, Ambulance Services,
            County Emergency Teams,
            Red Cross and Nyumba Kumi leaders.

            Report incidents instantly using your phone,
            GPS location and photos.

          </p>

          <div className="flex flex-wrap gap-5 mt-10">

            <Link
              to="/register"
              className="bg-red-600 hover:bg-red-700 px-7 py-4 rounded-xl font-semibold flex items-center gap-3 transition"
            >
              Report Emergency
              <FaArrowRight />
            </Link>

            <Link
              to="/services"
              className="border border-white hover:bg-white hover:text-slate-900 px-7 py-4 rounded-xl transition"
            >
              Explore Services
            </Link>

          </div>

        </div>

        {/* Right Side */}

        <div className="grid grid-cols-2 gap-6">

          <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-8">

            <FaPhoneAlt className="text-red-600 text-5xl" />

            <h3 className="font-bold text-2xl mt-6">
              Emergency Call
            </h3>

            <p className="mt-3 text-slate-500">
              One tap connects you to emergency responders.
            </p>

          </div>

          <div className="bg-white text-slate-900 rounded-2xl shadow-xl p-8">

            <FaMapMarkerAlt className="text-blue-600 text-5xl" />

            <h3 className="font-bold text-2xl mt-6">
              Live GPS
            </h3>

            <p className="mt-3 text-slate-500">
              Automatically share your location with responders.
            </p>

          </div>

          <div className="col-span-2 bg-white text-slate-900 rounded-2xl shadow-xl p-8">

            <h2 className="text-3xl font-bold">
              Fast • Reliable • Secure
            </h2>

            <p className="mt-5 text-slate-500 leading-8">

              Designed for communities,
              emergency services,
              county governments
              and disaster response organizations
              across Kenya.

            </p>

          </div>

        </div>

      </div>

    </section>
  );
}