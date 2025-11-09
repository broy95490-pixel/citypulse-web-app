"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Profile, Issue } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { User, LogOut, ClipboardList, ThumbsUp, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ProfileViewProps {
  profile: Profile | null
  userIssues: Issue[]
  userVotes: any[]
}

export function ProfileView({ profile, userIssues, userVotes }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
        })
        .eq("id", profile?.id)

      if (error) throw error

      setIsEditing(false)
      router.refresh()
    } catch (err) {
      console.error("Failed to update profile:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.full_name || "User"}</CardTitle>
                <CardDescription>{profile.email}</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                    {profile.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                    {profile.role}
                  </Badge>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.phone && (
                <div>
                  <span className="text-sm font-medium text-foreground">Phone: </span>
                  <span className="text-sm text-muted-foreground">{profile.phone}</span>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-foreground">Member since: </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>

              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issues Reported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{userIssues.length}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issues Supported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{userVotes.length}</div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issues Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {userIssues.filter((i) => i.status === "resolved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Tabs */}
      <Tabs defaultValue="reported" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="reported" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Reported Issues
          </TabsTrigger>
          <TabsTrigger value="voted" className="gap-2">
            <ThumbsUp className="h-4 w-4" />
            Supported Issues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reported">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Your Reported Issues</CardTitle>
              <CardDescription>Issues you have reported to the city</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userIssues.map((issue) => (
                  <Link key={issue.id} href={`/issues/${issue.id}`}>
                    <Card className="glass hover:bg-accent/10 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{issue.title}</h3>
                              <Badge
                                variant={
                                  issue.status === "resolved"
                                    ? "default"
                                    : issue.status === "in_progress"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {issue.status.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{issue.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{issue.category.replace(/_/g, " ")}</span>
                              <span>{issue.upvotes} upvotes</span>
                              <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

                {userIssues.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>You haven&apos;t reported any issues yet</p>
                    <Link href="/report">
                      <Button className="mt-4">Report Your First Issue</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voted">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Issues You Support</CardTitle>
              <CardDescription>Issues you have upvoted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userVotes.map(
                  (vote) =>
                    vote.issues && (
                      <Link key={vote.id} href={`/issues/${vote.issues.id}`}>
                        <Card className="glass hover:bg-accent/10 transition-colors cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-foreground">{vote.issues.title}</h3>
                                  <Badge
                                    variant={
                                      vote.issues.status === "resolved"
                                        ? "default"
                                        : vote.issues.status === "in_progress"
                                          ? "secondary"
                                          : "destructive"
                                    }
                                  >
                                    {vote.issues.status.replace(/_/g, " ")}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {vote.issues.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{vote.issues.category.replace(/_/g, " ")}</span>
                                  <span>{vote.issues.upvotes} upvotes</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ),
                )}

                {userVotes.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ThumbsUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>You haven&apos;t supported any issues yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
