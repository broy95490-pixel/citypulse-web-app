"use client"

import type { Issue } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, MapPin } from "lucide-react"
import Link from "next/link"

interface IssueListProps {
  issues: Issue[]
  onIssueSelect?: (issue: Issue) => void
}

export function IssueList({ issues, onIssueSelect }: IssueListProps) {
  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {issues.map((issue) => (
        <Link key={issue.id} href={`/issues/${issue.id}`}>
          <Card
            className="glass p-4 hover:bg-accent/10 transition-colors cursor-pointer"
            onClick={() => onIssueSelect?.(issue)}
          >
            <div className="flex items-start justify-between gap-3">
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
                    className="shrink-0"
                  >
                    {issue.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{issue.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {issue.category.replace(/_/g, " ")}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {issue.upvotes}
                  </span>
                  <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
