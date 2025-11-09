import { createClient } from "@/lib/supabase/server"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch all issues
  const { data: issues } = await supabase.from("issues").select("*").order("created_at", { ascending: false })

  // Fetch metrics
  const { data: metrics } = await supabase
    .from("issue_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(90)

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
              <div>
                <h1 className="text-2xl font-bold text-foreground">City Analytics</h1>
                <p className="text-sm text-muted-foreground">Transparent reporting on civic issues and resolution</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <AnalyticsDashboard issues={issues || []} metrics={metrics || []} />
      </main>
    </div>
  )
}
