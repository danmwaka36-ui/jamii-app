import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FaShieldAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menu = (
    <>
      <Link to="/" className="hover:text-blue-400 transition">
        Home
      </Link>

      <Link to="/about" className="hover:text-blue-400 transition">
        About
      </Link>

      <Link to="/services" className="hover:text-blue-400 transition">
        Services
      </Link>

      <Link to="/login" className="hover:text-blue-400 transition">
        Login
      </Link>

      <Link
        to="/register"
        className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Register
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        <Link to="/" className="flex items-center gap-3">
          <FaShieldAlt className="text-3xl text-blue-500" />

          <div>
            <h1 className="text-2xl font-bold">
              Jamii App
            </h1>

            <p className="text-xs text-slate-400">
              Community Emergency Response
            </p>
          </div>
        </Link>

        {/* Desktop Menu */}

        <div className="hidden md:flex items-center gap-8">
          {menu}
        </div>

        {/* Mobile Button */}

        <button
          className="md:hidden text-2xl"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-slate-800 px-6 pb-6 flex flex-col gap-5">
          {menu}
        </div>
      )}
    </nav>
  );
} 