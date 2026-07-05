import EmergencyCard from "./EmergencyCard";

function EmergencyGrid() {
  return (
    <section className="max-w-6xl mx-auto px-6 pb-20">
      <h3 className="text-3xl font-bold text-center mb-10">
        Emergency Services
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <EmergencyCard
          icon="🚒"
          title="Fire"
          description="Report fire outbreaks instantly."
        />

        <EmergencyCard
          icon="🚑"
          title="Ambulance"
          description="Request urgent medical assistance."
        />

        <EmergencyCard
          icon="👮"
          title="Police"
          description="Report crime and security incidents."
        />

        <EmergencyCard
          icon="🌊"
          title="Flood"
          description="Report flooding and disasters."
        />

        <EmergencyCard
          icon="🚗"
          title="Accident"
          description="Report road traffic accidents."
        />

        <EmergencyCard
          icon="📢"
          title="Community Alert"
          description="Notify your community about emergencies."
        />
      </div>
    </section>
  );
}

export default EmergencyGrid;