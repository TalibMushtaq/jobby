"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendPoint = {
  date: string;
  ats: number;
  interview: number;
  scam: number;
  ghost: number;
};

type BreakdownPoint = {
  metric: string;
  score: number;
};

type SkillRadarPoint = {
  skill: string;
  matched: number;
};

type DashboardChartsProps = {
  trendData: TrendPoint[];
  skillTrendData: Array<{
    date: string;
    skills: number;
    keywords: number;
    success: number;
  }>;
  atsBreakdownData: BreakdownPoint[];
  skillRadarData: SkillRadarPoint[];
};

export function DashboardCharts({
  trendData,
  skillTrendData,
  atsBreakdownData,
  skillRadarData,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 xl:col-span-2">
        <h3 className="mb-3 text-sm font-semibold">ATS & Risk Progression</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ats"
                stroke="#0284c7"
                strokeWidth={2}
                dot={false}
                name="ATS"
              />
              <Line
                type="monotone"
                dataKey="interview"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                name="Interview %"
              />
              <Line
                type="monotone"
                dataKey="scam"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
                name="Scam Risk"
              />
              <Line
                type="monotone"
                dataKey="ghost"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Ghost Risk"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h3 className="mb-3 text-sm font-semibold">Resume Strength Radar</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={skillRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <Radar
                dataKey="matched"
                fill="#0ea5e9"
                fillOpacity={0.4}
                stroke="#0284c7"
                name="Skill fit"
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 xl:col-span-3">
        <h3 className="mb-3 text-sm font-semibold">
          Skill Improvement & Application Success Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={skillTrendData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="skills"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
                name="Skill Match"
              />
              <Line
                type="monotone"
                dataKey="keywords"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                name="Keyword Coverage"
              />
              <Line
                type="monotone"
                dataKey="success"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
                name="Application Success Trend"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60 xl:col-span-3">
        <h3 className="mb-3 text-sm font-semibold">ATS Score Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={atsBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" name="Score" fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
