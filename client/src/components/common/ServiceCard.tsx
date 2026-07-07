import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function ServiceCard({
  icon,
  title,
  description,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 p-6 text-center border border-slate-100 hover:-translate-y-1">
      <div className="text-5xl text-blue-600 flex justify-center mb-4">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-slate-800">
        {title}
      </h3>

      <p className="text-slate-500 mt-3">
        {description}
      </p>
    </div>
  );
}