"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IssueList } from "@/components/admin/issue-list"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"
import { BarChart3, List, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

interface AdminDashboardProps {
  issues: any[]
  metrics: any[]
  userRole: string
}

export function AdminDashboard({ issues, metrics, userRole }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const stats = {
    total: issues.length,
    unresolved: issues.filter((i) => i.status === "unresolved").length,
    inProgress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/citypulse-logo.png"
              alt="CityPulse Logo"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                {userRole === "admin" ? "System Administrator" : "Municipal Authority"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">
              {userRole === "admin" ? "Admin" : "Moderator"}
            </Badge>
            <Link href="/">
              <Button size="sm" variant="ghost">
                Public View
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardDescription>Total Issues</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardDescription>Unresolved</CardDescription>
              <CardTitle className="text-3xl text-yellow-500">{stats.unresolved}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl text-blue-500">{stats.inProgress}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardDescription>Resolved</CardDescription>
              <CardTitle className="text-3xl text-green-500">{stats.resolved}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="glass">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-2">
              <List className="h-4 w-4" />
              Issues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AnalyticsDashboard issues={issues} metrics={metrics} />
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <IssueList issues={issues} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
