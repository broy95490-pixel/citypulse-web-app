"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  Legend,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface AnalyticsDashboardProps {
  issues: any[]
  metrics: any[]
}

export function AnalyticsDashboard({ issues, metrics }: AnalyticsDashboardProps) {
  // Category distribution
  const categoryData = issues.reduce(
    (acc, issue) => {
      const category = issue.category || "other"
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value,
  }))

  // Status distribution
  const statusCounts = {
    unresolved: issues.filter((i) => i.status === "unresolved").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  }

  const statusData = [
    { name: "Unresolved", value: statusCounts.unresolved, fill: "hsl(0, 84%, 60%)" },
    { name: "In Progress", value: statusCounts.in_progress, fill: "hsl(217, 91%, 60%)" },
    { name: "Resolved", value: statusCounts.resolved, fill: "hsl(142, 76%, 36%)" },
  ].filter((item) => item.value > 0)

  // Issues by ward (hotspots)
  const wardData = issues.reduce(
    (acc, issue) => {
      const ward = issue.ward || "Unknown"
      acc[ward] = (acc[ward] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topWards = Object.entries(wardData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ward, count]) => ({ ward, count }))

  // Resolution rate
  const resolvedCount = issues.filter((i) => i.status === "resolved").length
  const resolutionRate = issues.length > 0 ? ((resolvedCount / issues.length) * 100).toFixed(1) : "0"

  // Average resolution time
  const resolvedIssues = issues.filter((i) => i.status === "resolved" && i.resolved_at)
  const avgResolutionTime =
    resolvedIssues.length > 0
      ? resolvedIssues.reduce((sum, issue) => {
          const created = new Date(issue.created_at).getTime()
          const resolved = new Date(issue.resolved_at).getTime()
          return sum + (resolved - created)
        }, 0) /
        resolvedIssues.length /
        (1000 * 60 * 60 * 24) // Convert to days
      : 0

  const categoryColors = [
    "hsl(217, 91%, 60%)", // Blue
    "hsl(142, 76%, 36%)", // Green
    "hsl(271, 91%, 65%)", // Purple
    "hsl(24, 95%, 53%)", // Orange
    "hsl(339, 82%, 52%)", // Pink
    "hsl(173, 80%, 40%)", // Teal
    "hsl(45, 93%, 47%)", // Yellow
  ]

  const hotspotColors = [
    "hsl(0, 84%, 60%)", // Red
    "hsl(14, 90%, 55%)", // Orange-red
    "hsl(24, 95%, 53%)", // Orange
    "hsl(45, 93%, 47%)", // Yellow
    "hsl(173, 80%, 40%)", // Teal
    "hsl(217, 91%, 60%)", // Blue
    "hsl(271, 91%, 65%)", // Purple
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Resolution Rate</CardTitle>
            <CardDescription>Percentage of issues resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">{resolutionRate}%</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Avg. Resolution Time</CardTitle>
            <CardDescription>Days to resolve an issue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-500">{avgResolutionTime.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>Distribution of issue types</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Issues", color: "hsl(var(--chart-1))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    className="text-muted-foreground"
                  />
                  <YAxis fontSize={12} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current issue statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: "Issues" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Issue Hotspots</CardTitle>
          <CardDescription>Top 10 wards by issue count</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: { label: "Issues", color: "hsl(var(--chart-2))" },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topWards} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" fontSize={12} className="text-muted-foreground" />
                <YAxis dataKey="ward" type="category" fontSize={12} width={100} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {topWards.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={hotspotColors[index % hotspotColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
