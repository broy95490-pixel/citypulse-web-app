"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Issue, IssueStatus, UserRole } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { MapPin, Calendar, User, Search, Filter } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface IssueManagementProps {
  issues: Issue[]
  userRole: UserRole
}

export function IssueManagement({ issues: initialIssues, userRole }: IssueManagementProps) {
  const [issues, setIssues] = useState(initialIssues)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleStatusUpdate = async (issueId: string, newStatus: IssueStatus, comment?: string) => {
    setIsUpdating(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("issues").update({ status: newStatus }).eq("id", issueId)

      if (error) throw error

      // If comment provided, add it
      if (comment) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("issue_comments").insert({
            issue_id: issueId,
            user_id: user.id,
            content: comment,
          })
        }
      }

      // Update local state
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? { ...issue, status: newStatus } : issue)))

      setSelectedIssue(null)
    } catch (err) {
      console.error("Failed to update issue:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <Card className="glass">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Issue Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredIssues.length} of {issues.length} issues
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unresolved">Unresolved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <Card
                key={issue.id}
                className="glass hover:bg-accent/10 transition-colors cursor-pointer"
                onClick={() => setSelectedIssue(issue)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground truncate">{issue.title}</h3>
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

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{issue.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {issue.category.replace(/_/g, " ")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(issue.created_at).toLocaleDateString()}
                        </span>
                        {issue.profiles && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {issue.profiles.full_name || issue.profiles.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {(userRole === "admin" || userRole === "moderator") && (
                        <Select
                          value={issue.status}
                          onValueChange={(value) => {
                            handleStatusUpdate(issue.id, value as IssueStatus)
                          }}
                        >
                          <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unresolved">Unresolved</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredIssues.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No issues found matching your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass">
          <DialogHeader>
            <DialogTitle>{selectedIssue?.title}</DialogTitle>
            <DialogDescription>
              {selectedIssue?.category.replace(/_/g, " ")} • Reported on{" "}
              {selectedIssue && new Date(selectedIssue.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={selectedIssue.status}
                  onValueChange={(value) => {
                    handleStatusUpdate(selectedIssue.id, value as IssueStatus)
                  }}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <p className="text-sm text-muted-foreground mt-2">{selectedIssue.description}</p>
              </div>

              {selectedIssue.address && (
                <div>
                  <Label>Location</Label>
                  <p className="text-sm text-muted-foreground mt-2">{selectedIssue.address}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordinates: {selectedIssue.latitude.toFixed(6)}, {selectedIssue.longitude.toFixed(6)}
                  </p>
                </div>
              )}

              {selectedIssue.ward && (
                <div>
                  <Label>Ward</Label>
                  <p className="text-sm text-muted-foreground mt-2">{selectedIssue.ward}</p>
                </div>
              )}

              <div>
                <Label>Upvotes</Label>
                <p className="text-sm text-muted-foreground mt-2">{selectedIssue.upvotes} people support this issue</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
