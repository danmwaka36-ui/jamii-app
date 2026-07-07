import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShieldAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-8 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Logo & About */}
        <div>
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-3xl text-blue-500" />

            <div>
              <h2 className="text-2xl font-bold text-white">
                Jamii App
              </h2>

              <p className="text-sm text-slate-400">
                Community Emergency Response
              </p>
            </div>
          </div>

          <p className="mt-5 leading-7 text-sm">
            Jamii App is a smart emergency response platform that connects
            citizens directly with Police, Firefighters, Ambulance,
            County Emergency Teams, Red Cross and Nyumba Kumi leaders
            across Kenya.
          </p>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-5">
            Emergency Services
          </h3>

          <ul className="space-y-3 text-sm">
            <li>🚓 Police Response</li>
            <li>🚒 Fire & Rescue</li>
            <li>🚑 Ambulance Services</li>
            <li>🌊 Flood Response</li>
            <li>⛑️ Red Cross</li>
            <li>👥 Nyumba Kumi</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-5">
            Contact
          </h3>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <FaPhoneAlt className="text-blue-500" />
              <span>+254 705 141 152</span>
            </div>

            <div className="flex items-center gap-3">
              <FaEnvelope className="text-blue-500" />
              <span>support@jamiiapp.ke</span>
            </div>

            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-blue-500" />
              <span>Mombasa, Kenya</span>
            </div>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-5">
            Follow Us
          </h3>

          <p className="text-sm mb-5">
            Stay updated with emergency alerts,
            community safety news and platform updates.
          </p>

          <div className="flex gap-5 text-2xl">
            <a href="#" className="hover:text-blue-500 transition">
              <FaFacebook />
            </a>

            <a href="#" className="hover:text-pink-500 transition">
              <FaInstagram />
            </a>

            <a href="#" className="hover:text-blue-400 transition">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-400">
        © 2026 <span className="font-semibold text-white">Jamii App</span> •
        Developed by <span className="text-blue-400">Imarisha Jamii</span>. All
        Rights Reserved.
      </div>
    </footer>
  );
}