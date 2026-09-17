import {
  Line,
  LineChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { runHistory } from "./metrics-data";

export function Dashboard() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Quality &amp; Delivery Metrics</h1>
      <p style={{ color: "#666", fontSize: 14 }}>
        Backed by mock data for now (<code>src/dashboard/metrics-data.ts</code>) - swap in
        real numbers by parsing Playwright's JSON reporter output after each CI run.
      </p>

      <section style={{ marginTop: 32 }}>
        <h2>Pass rate &amp; flaky tests</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={runHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" domain={[0, 100]} label={{ value: "%", angle: -90, position: "insideLeft" }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: "flaky", angle: 90, position: "insideRight" }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="passRate" name="Pass rate (%)" stroke="#2563eb" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="flakyTests" name="Flaky tests" stroke="#dc2626" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Build duration &amp; deployment frequency</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={runHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" label={{ value: "sec", angle: -90, position: "insideLeft" }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: "deploys", angle: 90, position: "insideRight" }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="durationSeconds" name="Suite duration (s)" fill="#2563eb" />
            <Bar yAxisId="right" dataKey="deployments" name="Deployments" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </main>
  );
}
