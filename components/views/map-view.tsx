"use client"

import { useState } from "react"
import { IssueMap } from "@/components/map/issue-map"
import { IssueList } from "@/components/lists/issue-list"
import type { Issue } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapIcon, List } from "lucide-react"
import Link from "next/link"

interface MapViewProps {
  issues: Issue[]
}

export function MapView({ issues }: MapViewProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [viewMode, setViewMode] = useState<"map" | "list">("map")

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reported Issues</h2>
          <p className="text-sm text-muted-foreground">{issues.length} issues reported across the city</p>
        </div>

        <div className="flex gap-2">
          <Button variant={viewMode === "map" ? "default" : "outline"} size="sm" onClick={() => setViewMode("map")}>
            <MapIcon className="h-4 w-4 mr-2" />
            Map
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className={viewMode === "map" ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card className="glass p-4">
            {viewMode === "map" ? (
              <IssueMap issues={issues} onIssueSelect={setSelectedIssue} height="600px" />
            ) : (
              <IssueList issues={issues} onIssueSelect={setSelectedIssue} />
            )}
          </Card>
        </div>

        {viewMode === "map" && (
          <div className="lg:col-span-1">
            <Card className="glass p-4 sticky top-24">
              {selectedIssue ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedIssue.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedIssue.category.replace(/_/g, " ")}</p>
                  </div>

                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        selectedIssue.status === "resolved"
                          ? "bg-green-500/20 text-green-400"
                          : selectedIssue.status === "in_progress"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {selectedIssue.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <p className="text-sm text-card-foreground">{selectedIssue.description}</p>

                  {selectedIssue.address && (
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Address: </span>
                      <span className="text-muted-foreground">{selectedIssue.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{selectedIssue.upvotes}</span> upvotes
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Reported {new Date(selectedIssue.created_at).toLocaleDateString()}
                  </div>

                  <Link href={`/issues/${selectedIssue.id}`}>
                    <Button size="sm" className="w-full">
                      View Details & Comments
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <MapIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select an issue on the map to view details</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
