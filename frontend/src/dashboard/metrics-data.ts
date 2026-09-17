/**
 * Mock quality/delivery metrics.
 *
 * In a real setup this would be populated by a small script that
 * parses Playwright's JSON reporter output after each CI run and
 * appends a row here (or writes to a proper store). Wiring that up
 * is a good "next step" to mention in your case study - it's the
 * difference between a dashboard and a REAL dashboard.
 */
export interface RunMetric {
  date: string;
  passRate: number; // 0-100
  flakyTests: number;
  durationSeconds: number;
  deployments: number;
}

export const runHistory: RunMetric[] = [
  { date: "Mon", passRate: 92, flakyTests: 3, durationSeconds: 210, deployments: 1 },
  { date: "Tue", passRate: 95, flakyTests: 2, durationSeconds: 198, deployments: 2 },
  { date: "Wed", passRate: 88, flakyTests: 5, durationSeconds: 240, deployments: 0 },
  { date: "Thu", passRate: 97, flakyTests: 1, durationSeconds: 185, deployments: 3 },
  { date: "Fri", passRate: 100, flakyTests: 0, durationSeconds: 176, deployments: 2 },
];
