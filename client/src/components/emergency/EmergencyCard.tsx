type EmergencyCardProps = {
  icon: string;
  title: string;
  description: string;
};

function EmergencyCard({
  icon,
  title,
  description,
}: EmergencyCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
      <div className="text-5xl">{icon}</div>

      <h4 className="text-xl font-bold mt-4">
        {title}
      </h4>

      <p className="text-gray-600 mt-2">
        {description}
      </p>
    </div>
  );
}

export default EmergencyCard;