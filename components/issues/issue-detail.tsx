"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { Issue, IssueComment, IssueUpdate } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { ThumbsUp, MessageCircle, MapPin, Calendar, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface IssueDetailProps {
  issue: Issue
}

export function IssueDetail({ issue: initialIssue }: IssueDetailProps) {
  const [issue, setIssue] = useState(initialIssue)
  const [comments, setComments] = useState<IssueComment[]>([])
  const [updates, setUpdates] = useState<IssueUpdate[]>([])
  const [newComment, setNewComment] = useState("")
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUserId(user?.id || null)

    // Load comments
    const { data: commentsData } = await supabase
      .from("issue_comments")
      .select("*, profiles(full_name, email)")
      .eq("issue_id", issue.id)
      .order("created_at", { ascending: true })

    if (commentsData) setComments(commentsData)

    // Load updates
    const { data: updatesData } = await supabase
      .from("issue_updates")
      .select("*, profiles(full_name, email)")
      .eq("issue_id", issue.id)
      .order("created_at", { ascending: false })

    if (updatesData) setUpdates(updatesData)

    // Check if user has voted
    if (user) {
      const { data: voteData } = await supabase
        .from("issue_votes")
        .select("id")
        .eq("issue_id", issue.id)
        .eq("user_id", user.id)
        .single()

      setHasVoted(!!voteData)
    }
  }

  const handleVote = async () => {
    if (!userId) {
      router.push("/auth/login")
      return
    }

    setIsVoting(true)
    const supabase = createClient()

    try {
      if (hasVoted) {
        // Remove vote
        await supabase.from("issue_votes").delete().eq("issue_id", issue.id).eq("user_id", userId)

        setIssue((prev) => ({ ...prev, upvotes: prev.upvotes - 1 }))
        setHasVoted(false)
      } else {
        // Add vote
        await supabase.from("issue_votes").insert({ issue_id: issue.id, user_id: userId })

        setIssue((prev) => ({ ...prev, upvotes: prev.upvotes + 1 }))
        setHasVoted(true)
      }
    } catch (err) {
      console.error("Failed to vote:", err)
    } finally {
      setIsVoting(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !newComment.trim()) return

    setIsCommenting(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("issue_comments")
        .insert({
          issue_id: issue.id,
          user_id: userId,
          content: newComment.trim(),
        })
        .select("*, profiles(full_name, email)")
        .single()

      if (error) throw error

      if (data) {
        setComments((prev) => [...prev, data])
        setNewComment("")
      }
    } catch (err) {
      console.error("Failed to comment:", err)
    } finally {
      setIsCommenting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Issue Header */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{issue.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {issue.category.replace(/_/g, " ")}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(issue.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <Button
              variant={hasVoted ? "default" : "outline"}
              size="sm"
              onClick={handleVote}
              disabled={isVoting}
              className="gap-2"
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ThumbsUp className={`h-4 w-4 ${hasVoted ? "fill-current" : ""}`} />
              )}
              {issue.upvotes}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{issue.description}</p>
          </div>

          {issue.address && (
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Location</h3>
              <p className="text-sm text-muted-foreground">{issue.address}</p>
              {issue.ward && <p className="text-sm text-muted-foreground mt-1">Ward: {issue.ward}</p>}
            </div>
          )}

          {issue.profiles && (
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Reported By</h3>
              <p className="text-sm text-muted-foreground">{issue.profiles.full_name || issue.profiles.email}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Updates */}
      {updates.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Status Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        Status changed to <span className="text-primary">{update.new_status.replace(/_/g, " ")}</span>
                      </span>
                    </div>
                    {update.comment && <p className="text-sm text-muted-foreground">{update.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(update.created_at).toLocaleString()}
                      {update.profiles && ` • ${update.profiles.full_name || update.profiles.email}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          {userId ? (
            <form onSubmit={handleComment} className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <Button type="submit" disabled={isCommenting || !newComment.trim()}>
                {isCommenting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </form>
          ) : (
            <div className="p-4 bg-muted/20 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Please{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/auth/login")}>
                  log in
                </Button>{" "}
                to comment
              </p>
            </div>
          )}

          {/* Comments List */}
          {comments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {comment.profiles?.full_name?.[0] || comment.profiles?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {comment.profiles?.full_name || comment.profiles?.email || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {comments.length === 0 && userId && (
            <div className="text-center py-6 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
