interface Props {
  value: string;
  label: string;
}

export default function StatCard({
  value,
  label,
}: Props) {
  return (
    <div className="bg-blue-600 text-white rounded-2xl p-8 text-center shadow-xl">
      <h2 className="text-4xl font-bold">
        {value}
      </h2>

      <p className="mt-2 text-blue-100">
        {label}
      </p>
    </div>
  );
}