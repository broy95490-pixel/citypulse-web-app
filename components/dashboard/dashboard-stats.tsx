"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Issue } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"
import { AlertCircle, CheckCircle2, Clock, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  issues: Issue[]
  metrics: any[]
}

export function DashboardStats({ issues, metrics }: DashboardStatsProps) {
  // Calculate stats
  const totalIssues = issues.length
  const unresolvedIssues = issues.filter((i) => i.status === "unresolved").length
  const inProgressIssues = issues.filter((i) => i.status === "in_progress").length
  const resolvedIssues = issues.filter((i) => i.status === "resolved").length
  const resolutionRate = totalIssues > 0 ? ((resolvedIssues / totalIssues) * 100).toFixed(1) : 0

  // Calculate average resolution time
  const resolvedWithTime = issues.filter((i) => i.status === "resolved" && i.resolved_at)
  const avgResolutionTime =
    resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((acc, issue) => {
          const created = new Date(issue.created_at).getTime()
          const resolved = new Date(issue.resolved_at!).getTime()
          return acc + (resolved - created) / (1000 * 60 * 60) // hours
        }, 0) / resolvedWithTime.length
      : 0

  // Status distribution
  const statusData = [
    { name: "Unresolved", value: unresolvedIssues, color: "#EF4444" },
    { name: "In Progress", value: inProgressIssues, color: "#3B82F6" },
    { name: "Resolved", value: resolvedIssues, color: "#10B981" },
  ]

  // Category distribution
  const categoryCount: Record<string, number> = {}
  issues.forEach((issue) => {
    categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryCount)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  // Trend data (last 7 days)
  const trendData: any[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const dayIssues = issues.filter((issue) => issue.created_at.startsWith(dateStr))

    trendData.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      issues: dayIssues.length,
      resolved: dayIssues.filter((i) => i.status === "resolved").length,
    })
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalIssues}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unresolved</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{unresolvedIssues}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{resolvedIssues} resolved</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{avgResolutionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">Average time to resolve</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current issue status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
            <CardDescription>Top issue categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" fontSize={11} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend */}
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle>7-Day Trend</CardTitle>
            <CardDescription>Issues reported vs resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="issues" stroke="#3B82F6" strokeWidth={2} name="Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
