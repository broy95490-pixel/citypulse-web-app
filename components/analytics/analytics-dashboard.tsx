"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Issue } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, Clock, MapPin, Award } from "lucide-react"

interface AnalyticsDashboardProps {
  issues: Issue[]
  metrics: any[]
}

export function AnalyticsDashboard({ issues, metrics }: AnalyticsDashboardProps) {
  // Overall stats
  const totalIssues = issues.length
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

  // Ward-wise performance
  const wardStats: Record<string, any> = {}
  issues.forEach((issue) => {
    const ward = issue.ward || "Unknown"
    if (!wardStats[ward]) {
      wardStats[ward] = { total: 0, resolved: 0, avgTime: 0, times: [] }
    }
    wardStats[ward].total++
    if (issue.status === "resolved") {
      wardStats[ward].resolved++
      if (issue.resolved_at) {
        const time = (new Date(issue.resolved_at).getTime() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60)
        wardStats[ward].times.push(time)
      }
    }
  })

  const wardData = Object.entries(wardStats)
    .map(([ward, stats]: [string, any]) => ({
      ward,
      total: stats.total,
      resolved: stats.resolved,
      resolutionRate: stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0,
      avgTime:
        stats.times.length > 0
          ? (stats.times.reduce((a: number, b: number) => a + b, 0) / stats.times.length).toFixed(1)
          : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Monthly trends (last 6 months)
  const monthlyData: any[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthStr = date.toISOString().slice(0, 7)

    const monthIssues = issues.filter((issue) => issue.created_at.startsWith(monthStr))

    monthlyData.push({
      month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      reported: monthIssues.length,
      resolved: monthIssues.filter((i) => i.status === "resolved").length,
      inProgress: monthIssues.filter((i) => i.status === "in_progress").length,
      unresolved: monthIssues.filter((i) => i.status === "unresolved").length,
    })
  }

  // Category performance
  const categoryStats: Record<string, any> = {}
  issues.forEach((issue) => {
    if (!categoryStats[issue.category]) {
      categoryStats[issue.category] = { total: 0, resolved: 0, avgTime: 0, times: [] }
    }
    categoryStats[issue.category].total++
    if (issue.status === "resolved") {
      categoryStats[issue.category].resolved++
      if (issue.resolved_at) {
        const time = (new Date(issue.resolved_at).getTime() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60)
        categoryStats[issue.category].times.push(time)
      }
    }
  })

  const categoryData = Object.entries(categoryStats)
    .map(([category, stats]: [string, any]) => ({
      name: category.replace(/_/g, " "),
      total: stats.total,
      resolved: stats.resolved,
      resolutionRate: Number.parseFloat(stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0),
      avgTime:
        stats.times.length > 0
          ? Number.parseFloat((stats.times.reduce((a: number, b: number) => a + b, 0) / stats.times.length).toFixed(1))
          : 0,
    }))
    .sort((a, b) => b.total - a.total)

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
            <p className="text-xs text-muted-foreground mt-1">All time reported</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
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
            <p className="text-xs text-muted-foreground mt-1">Average hours to resolve</p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Wards</CardTitle>
            <MapPin className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{wardData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Reporting areas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="wards">Ward Performance</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>6-Month Trend</CardTitle>
              <CardDescription>Issue reporting and resolution trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="reported"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorReported)"
                    name="Reported"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                    name="Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Status Distribution Over Time</CardTitle>
              <CardDescription>Breakdown of issue statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="unresolved" stackId="a" fill="#EF4444" name="Unresolved" />
                  <Bar dataKey="inProgress" stackId="a" fill="#3B82F6" name="In Progress" />
                  <Bar dataKey="resolved" stackId="a" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Total reports per category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" width={150} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="total" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Category Resolution Rate</CardTitle>
                <CardDescription>Percentage of resolved issues</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" stroke="#888" width={150} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => `${value}%`}
                    />
                    <Bar dataKey="resolutionRate" fill="#10B981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass lg:col-span-2">
              <CardHeader>
                <CardTitle>Average Resolution Time by Category</CardTitle>
                <CardDescription>Hours to resolve by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => `${value}h`}
                    />
                    <Bar dataKey="avgTime" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Wards Tab */}
        <TabsContent value="wards" className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Ward Performance Comparison</CardTitle>
              <CardDescription>Top 10 wards by issue count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={wardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="ward" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#3B82F6" name="Total Issues" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Ward Resolution Rates</CardTitle>
                <CardDescription>Success rate by ward</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={wardData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" domain={[0, 100]} />
                    <YAxis dataKey="ward" type="category" stroke="#888" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => `${value}%`}
                    />
                    <Bar dataKey="resolutionRate" fill="#10B981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Ward Efficiency</CardTitle>
                <CardDescription>Average resolution time (hours)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={wardData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="ward" type="category" stroke="#888" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => `${value}h`}
                    />
                    <Bar dataKey="avgTime" fill="#F59E0B" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
