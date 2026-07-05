import StatsCard from "../../components/dashboard/StatsCard";

export default function Dashboard() {
  return (
    <div>
      <h1 style={{ marginBottom: "30px" }}>
        🚨 Citizen Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px"
        }}
      >
        <StatsCard
          title="Active Emergencies"
          value="12"
        />

        <StatsCard
          title="Fire Incidents"
          value="4"
        />

        <StatsCard
          title="Police Reports"
          value="18"
        />

        <StatsCard
          title="Ambulances Dispatched"
          value="9"
        />

        <StatsCard
          title="Flood Alerts"
          value="3"
        />

        <StatsCard
          title="Community Notices"
          value="7"
        />
      </div>

      <div
        style={{
          marginTop: "40px",
          background: "#fff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,.08)"
        }}
      >
        <h2>Latest Activity</h2>

        <hr />

        <p>🚒 Fire reported at Bamburi.</p>

        <p>🚑 Ambulance dispatched to Nyali.</p>

        <p>🚔 Police responding to robbery alert.</p>

        <p>🌊 Heavy rainfall warning issued.</p>

        <p>📢 County emergency bulletin updated.</p>
      </div>
    </div>
  );
}