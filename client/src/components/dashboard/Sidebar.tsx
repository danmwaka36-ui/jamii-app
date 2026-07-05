import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside
      style={{
        width: "260px",
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "25px"
      }}
    >
      <h2 style={{ marginBottom: "30px" }}>
        🚨 Jamii App
      </h2>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        }}
      >
        <Link to="/" style={linkStyle}>🏠 Home</Link>

        <Link to="/dashboard" style={linkStyle}>
          📊 Dashboard
        </Link>

        <Link to="/report" style={linkStyle}>
          🚨 Report Emergency
        </Link>

        <Link to="/map" style={linkStyle}>
          📍 Live Map
        </Link>

        <Link to="/alerts" style={linkStyle}>
          📢 Community Alerts
        </Link>

        <Link to="/nyumbakumi" style={linkStyle}>
          👥 Nyumba Kumi
        </Link>

        <Link to="/profile" style={linkStyle}>
          👤 Profile
        </Link>

        <Link to="/settings" style={linkStyle}>
          ⚙️ Settings
        </Link>

        <Link to="/logout" style={linkStyle}>
          🚪 Logout
        </Link>
      </nav>
    </aside>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "16px"
};