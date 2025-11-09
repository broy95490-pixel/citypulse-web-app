"use client"

import { useEffect, useRef, useState } from "react"
import type { Issue } from "@/lib/types"

interface IssueMapProps {
  issues: Issue[]
  onIssueSelect?: (issue: Issue) => void
  center?: [number, number]
  zoom?: number
  height?: string
}

export function IssueMap({
  issues,
  onIssueSelect,
  center = [28.6139, 77.209], // Default to Delhi
  zoom = 12,
  height = "600px",
}: IssueMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return

    const loadLeaflet = async () => {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        link.crossOrigin = ""
        document.head.appendChild(link)
      }

      // Dynamically import Leaflet
      const L = await import("leaflet")

      if (!mapRef.current || mapInstance) return

      // Fix for default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const map = L.map(mapRef.current).setView(center, zoom)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map)

      setMapInstance(map)
    }

    loadLeaflet()

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstance || typeof window === "undefined") return

    const updateMarkers = async () => {
      const L = await import("leaflet")

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Get status color
      const getStatusColor = (status: string) => {
        switch (status) {
          case "unresolved":
            return "#EF4444" // Red
          case "in_progress":
            return "#3B82F6" // Blue
          case "resolved":
            return "#10B981" // Green
          default:
            return "#6B7280" // Gray
        }
      }

      // Add markers for each issue
      issues.forEach((issue) => {
        const color = getStatusColor(issue.status)

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              background-color: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50% 50% 50% 0;
              border: 2px solid white;
              transform: rotate(-45deg);
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              <div style="
                transform: rotate(45deg);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: white;
              ">●</div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        })

        const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon })
          .addTo(mapInstance)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h3 style="font-weight: 600; margin-bottom: 4px; color: #1e293b;">${issue.title}</h3>
              <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${issue.category.replace(/_/g, " ")}</p>
              <span style="
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                color: white;
                background-color: ${color};
              ">${issue.status.replace(/_/g, " ")}</span>
            </div>
          `)

        marker.on("click", () => {
          if (onIssueSelect) {
            onIssueSelect(issue)
          }
        })

        markersRef.current.push(marker)
      })
    }

    updateMarkers()
  }, [mapInstance, issues, onIssueSelect])

  return <div ref={mapRef} style={{ height, width: "100%", borderRadius: "12px" }} className="z-0" />
}
