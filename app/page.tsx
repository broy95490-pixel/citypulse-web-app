import { createClient } from "@/lib/supabase/server"
import { MapView } from "@/components/views/map-view"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, BarChart3, Shield } from "lucide-react"
import Image from "next/image"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all issues
  const { data: issues } = await supabase
    .from("issues")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
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
              <h1 className="text-xl font-bold text-foreground">CityPulse</h1>
              <p className="text-xs text-muted-foreground">Civic Issue Reporting</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Link href="/analytics">
              <Button size="sm" variant="ghost" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
            </Link>
            <Link href="/auth/admin">
              <Button size="sm" variant="ghost" className="gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
            {user ? (
              <>
                <Link href="/report">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Report Issue</span>
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button size="sm" variant="ghost">
                    Profile
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button size="sm" variant="outline">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <MapView issues={issues || []} />
      </main>

      {/* Footer */}
      <footer className="glass border-t border-border/50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CityPulse. Empowering citizens to build better cities.</p>
        </div>
      </footer>
    </div>
  )
}
