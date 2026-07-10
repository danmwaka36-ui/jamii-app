export default function MapLegend() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">
        Map Legend
      </h2>

      <div className="mt-5 space-y-3 text-sm">

        <div>🚒 Fire Incident</div>

        <div>🚑 Medical Emergency</div>

        <div>🚔 Police Incident</div>

        <div>🌊 Flood Alert</div>

        <div>📢 Community Alert</div>

        <div>🏥 Hospital</div>

      </div>
    </div>
  );
}