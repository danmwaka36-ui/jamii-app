import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: Props) {
  return (
    <div className="flex gap-4 p-6 rounded-xl bg-white shadow-md">
      <div className="text-4xl text-green-600">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-lg">
          {title}
        </h3>

        <p className="text-slate-500 mt-2">
          {description}
        </p>
      </div>
    </div>
  );
}