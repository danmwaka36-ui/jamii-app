export default function Topbar() {
  return (
    <header
      style={{
        background: "white",
        padding: "18px 30px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <h2>Community Emergency Response System</h2>

      <div>
        🔔 Notifications &nbsp;&nbsp; 👤 Citizen
      </div>
    </header>
  );
}