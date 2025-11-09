import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { IssueManagement } from "@/components/dashboard/issue-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, ClipboardList } from "lucide-react"
import Image from "next/image"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role === "citizen") {
    redirect("/")
  }

  // Fetch dashboard data
  const { data: issues } = await supabase
    .from("issues")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })

  const { data: metrics } = await supabase
    .from("issue_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(30)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Image
                  src="/citypulse-logo.png"
                  alt="CityPulse Logo"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    Role: <span className="capitalize">{profile.role}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="issues" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Manage Issues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardStats issues={issues || []} metrics={metrics || []} />
          </TabsContent>

          <TabsContent value="issues">
            <IssueManagement issues={issues || []} userRole={profile.role} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
