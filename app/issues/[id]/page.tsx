import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { IssueDetail } from "@/components/issues/issue-detail"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: issue } = await supabase.from("issues").select("*, profiles(full_name, email)").eq("id", id).single()

  if (!issue) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Map
            </Button>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <IssueDetail issue={issue} />
      </main>
    </div>
  )
}
