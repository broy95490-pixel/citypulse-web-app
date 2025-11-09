"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MapPin, Calendar, User, MessageSquare, CheckCircle2, Clock, XCircle } from "lucide-react"
import { format } from "date-fns"

interface IssueListProps {
  issues: any[]
}

export function IssueList({ issues: initialIssues }: IssueListProps) {
  const [issues, setIssues] = useState(initialIssues)
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [newStatus, setNewStatus] = useState("")
  const [updateComment, setUpdateComment] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdateStatus = async (issueId: string) => {
    if (!newStatus) return
    setLoading(true)

    try {
      const supabase = createClient()

      // Update issue status
      const { error: updateError } = await supabase
        .from("issues")
        .update({
          status: newStatus,
          resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", issueId)

      if (updateError) throw updateError

      // Create update record
      const {
        data: { user },
      } = await supabase.auth.getUser()

      await supabase.from("issue_updates").insert({
        issue_id: issueId,
        user_id: user?.id,
        old_status: selectedIssue.status,
        new_status: newStatus,
        comment: updateComment || null,
      })

      // Update local state
      setIssues(issues.map((issue) => (issue.id === issueId ? { ...issue, status: newStatus } : issue)))

      setSelectedIssue(null)
      setUpdateComment("")
      router.refresh()
    } catch (error) {
      console.error("Error updating issue:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    }
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <Card key={issue.id} className="glass">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{issue.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {issue.profiles?.full_name || "Anonymous"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(issue.created_at), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {issue.ward || "Unknown Ward"}
                  </span>
                </CardDescription>
              </div>
              <Badge variant="outline" className={getStatusColor(issue.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(issue.status)}
                  {issue.status.replace("_", " ")}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{issue.description}</p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Badge variant="secondary">{issue.category}</Badge>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {issue.upvotes || 0} upvotes
              </span>
            </div>

            {selectedIssue?.id === issue.id ? (
              <div className="space-y-3 p-4 border border-border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment (optional)</label>
                  <Textarea
                    placeholder="Add a note about this status change..."
                    value={updateComment}
                    onChange={(e) => setUpdateComment(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => handleUpdateStatus(issue.id)} disabled={!newStatus || loading} size="sm">
                    {loading ? "Updating..." : "Update Status"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedIssue(null)
                      setNewStatus("")
                      setUpdateComment("")
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedIssue(issue)
                  setNewStatus(issue.status)
                }}
              >
                Manage Issue
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
