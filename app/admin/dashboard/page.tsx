import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/admin")
  }

  // Check if user has admin or moderator role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    redirect("/")
  }

  // Fetch all issues with related data
  const { data: issues } = await supabase
    .from("issues")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })

  // Fetch metrics
  const { data: metrics } = await supabase
    .from("issue_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(30)

  return <AdminDashboard issues={issues || []} metrics={metrics || []} userRole={profile?.role || "moderator"} />
}
