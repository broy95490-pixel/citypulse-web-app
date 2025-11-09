import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReportIssueForm } from "@/components/forms/report-issue-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ReportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        </Link>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-2xl">Report an Issue</CardTitle>
            <CardDescription>Help improve your city by reporting civic issues in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportIssueForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
