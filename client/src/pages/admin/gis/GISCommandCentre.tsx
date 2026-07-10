import EmergencyMap from "../../../components/maps/EmergencyMap";
import MapLegend from "../../../components/maps/MapLegend";

export default function GISCommandCentre() {
  return (
    <div className="space-y-6">

      <div>

        <h1 className="text-3xl font-extrabold text-slate-950">
          🗺️ GIS Command Centre
        </h1>

        <p className="mt-2 text-slate-600">
          Live emergency operations map for Jamii App.
        </p>

      </div>

      <MapLegend />

      <EmergencyMap />

    </div>
  );
}