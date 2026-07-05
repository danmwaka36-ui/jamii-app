type Props = {
  title: string;
  value: string;
};

export default function StatsCard({ title, value }: Props) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,.1)",
        minWidth: "220px"
      }}
    >
      <h3>{title}</h3>

      <h1>{value}</h1>
    </div>
  );
}