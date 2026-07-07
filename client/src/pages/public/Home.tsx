import Navbar from "../../components/common/Navbar";
import Hero from "../../components/common/Hero";
import Footer from "../../components/common/Footer";

import ServiceCard from "../../components/common/ServiceCard";
import StatCard from "../../components/common/StatCard";
import FeatureCard from "../../components/common/FeatureCard";

import {
  FaShieldAlt,
  FaFireExtinguisher,
  FaAmbulance,
  FaWater,
  FaHandsHelping,
  FaUsers,
  FaMapMarkedAlt,
  FaBell,
  FaMobileAlt,
  FaClock,
} from "react-icons/fa";

export default function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      {/* ================= SERVICES ================= */}

      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-8">

          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold">
              Emergency Services
            </h2>

            <p className="text-slate-500 mt-4">
              Jamii App connects citizens with every emergency response team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            <ServiceCard
              icon={<FaShieldAlt />}
              title="Police"
              description="Crime reporting, security emergencies and law enforcement."
            />

            <ServiceCard
              icon={<FaFireExtinguisher />}
              title="Fire Rescue"
              description="Fire outbreaks, rescue operations and hazardous incidents."
            />

            <ServiceCard
              icon={<FaAmbulance />}
              title="Ambulance"
              description="Medical emergencies with rapid dispatch."
            />

            <ServiceCard
              icon={<FaWater />}
              title="Flood Response"
              description="Flood monitoring and evacuation support."
            />

            <ServiceCard
              icon={<FaHandsHelping />}
              title="Red Cross"
              description="Humanitarian relief and first aid services."
            />

            <ServiceCard
              icon={<FaUsers />}
              title="Nyumba Kumi"
              description="Community safety and neighbourhood coordination."
            />

          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}

      <section className="py-20 bg-white">

        <div className="max-w-7xl mx-auto px-8">

          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold">
              Platform Statistics
            </h2>

            <p className="text-slate-500 mt-4">
              Real-time emergency response network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

            <StatCard
              value="15,000+"
              label="Registered Citizens"
            />

            <StatCard
              value="2,350"
              label="Emergency Reports"
            />

            <StatCard
              value="350"
              label="Emergency Responders"
            />

            <StatCard
              value="24/7"
              label="Emergency Monitoring"
            />

          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}

      <section className="bg-slate-100 py-20">

        <div className="max-w-7xl mx-auto px-8">

          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold">
              Why Choose Jamii App?
            </h2>

            <p className="text-slate-500 mt-4">
              Modern technology helping communities stay safe.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            <FeatureCard
              icon={<FaMapMarkedAlt />}
              title="Live GPS Tracking"
              description="Automatically share your location with emergency responders."
            />

            <FeatureCard
              icon={<FaBell />}
              title="Community Alerts"
              description="Receive important emergency notifications instantly."
            />

            <FeatureCard
              icon={<FaMobileAlt />}
              title="Mobile Reporting"
              description="Report emergencies directly from your smartphone."
            />

            <FeatureCard
              icon={<FaClock />}
              title="24/7 Response"
              description="Emergency services available around the clock."
            />

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}

      <section className="bg-blue-700 text-white py-20">

        <div className="max-w-5xl mx-auto text-center px-8">

          <h2 className="text-5xl font-bold">
            Together We Save Lives
          </h2>

          <p className="mt-6 text-xl text-blue-100">
            Join Jamii App and become part of Kenya's next-generation emergency response network.
          </p>

          <button className="mt-10 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-slate-100 transition">
            Get Started Today
          </button>

        </div>

      </section>

      <Footer />
    </>
  );
}