import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ConfidenceGraph({ data }) {
  if (!data || data.length === 0) {
    return <p className="mt-5">No data available</p>;
  }

  return (
    <div className="mt-5 w-full bg-white p-4 rounded-xl border">
      <h2 className="font-bold mb-3">Confidence Over Time</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="second" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ConfidenceGraph;