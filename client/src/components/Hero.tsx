export default function Hero() {
  return (
    <section
      style={{
        background: "#2563eb",
        color: "white",
        padding: "100px 40px",
        textAlign: "center"
      }}
    >
      <h1
        style={{
          fontSize: "58px",
          marginBottom: "20px"
        }}
      >
        Community Emergency Response System
      </h1>

      <p
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          fontSize: "22px",
          lineHeight: 1.7
        }}
      >
        Report emergencies instantly, share GPS location,
        upload photos and connect directly with Police,
        Fire, Ambulance and County emergency teams.
      </p>

      <button
        style={{
          marginTop: "35px",
          padding: "15px 35px",
          border: "none",
          borderRadius: "10px",
          fontSize: "18px",
          cursor: "pointer",
          background: "white",
          color: "#2563eb",
          fontWeight: "700"
        }}
      >
        Report Emergency
      </button>
    </section>
  );
}