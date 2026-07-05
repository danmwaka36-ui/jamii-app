import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header
      style={{
        background: "#0f172a",
        color: "white",
        padding: "18px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}
    >
      <Link
        to="/"
        style={{
          color: "white",
          textDecoration: "none",
          fontSize: "26px",
          fontWeight: "700"
        }}
      >
        🚨 Jamii App
      </Link>

      <nav
        style={{
          display: "flex",
          gap: "28px",
          alignItems: "center"
        }}
      >
        <Link style={linkStyle} to="/">Home</Link>

        <Link style={linkStyle} to="/about">About</Link>

        <Link style={linkStyle} to="/services">Services</Link>

        <Link style={linkStyle} to="/login">Login</Link>

        <Link
          to="/register"
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          Register
        </Link>
      </nav>
    </header>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontWeight: "500"
};