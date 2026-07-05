import Hero from "../../components/common/Hero";

export default function Home() {
  return (
    <>
      <Hero />

      <section
        style={{
          padding: "70px 40px",
          textAlign: "center"
        }}
      >
        <h2 style={{ fontSize: "40px" }}>
          Emergency Services
        </h2>

        <p style={{ marginTop: "20px" }}>
          Police • Fire • Ambulance • County • Red Cross • Community Alerts
        </p>
      </section>
    </>
  );
}