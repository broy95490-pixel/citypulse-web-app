"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { IssueCategory } from "@/lib/types"
import { MapPin, Loader2 } from "lucide-react"

interface ReportIssueFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const categories: { value: IssueCategory; label: string }[] = [
  { value: "road_maintenance", label: "Road Maintenance" },
  { value: "street_lighting", label: "Street Lighting" },
  { value: "waste_management", label: "Waste Management" },
  { value: "water_supply", label: "Water Supply" },
  { value: "drainage", label: "Drainage" },
  { value: "public_transport", label: "Public Transport" },
  { value: "parks_recreation", label: "Parks & Recreation" },
  { value: "building_violations", label: "Building Violations" },
  { value: "noise_pollution", label: "Noise Pollution" },
  { value: "other", label: "Other" },
]

export function ReportIssueForm({ onSuccess, onCancel }: ReportIssueFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<IssueCategory>("other")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState("")
  const [ward, setWard] = useState("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setIsLoadingLocation(false)

        // Reverse geocoding to get address
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.display_name) {
              setAddress(data.display_name)
            }
          })
          .catch(() => {})
      },
      (error) => {
        setError("Unable to retrieve your location")
        setIsLoadingLocation(false)
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!location) {
      setError("Please enable location access")
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to report an issue")
        setIsSubmitting(false)
        return
      }

      const { error: insertError } = await supabase.from("issues").insert({
        user_id: user.id,
        title,
        description,
        category,
        latitude: location.lat,
        longitude: location.lng,
        address: address || null,
        ward: ward || null,
        status: "unresolved",
      })

      if (insertError) throw insertError

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("other")
      setLocation(null)
      setAddress("")
      setWard("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit issue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Issue Title</Label>
        <Input
          id="title"
          placeholder="Brief description of the issue"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Provide detailed information about the issue"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(value) => setCategory(value as IssueCategory)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Button
          type="button"
          variant="outline"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="w-full bg-transparent"
        >
          {isLoadingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
          {location ? "Update Location" : "Get Current Location"}
        </Button>
        {location && (
          <p className="text-sm text-muted-foreground">
            Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        )}
      </div>

      {address && (
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Auto-detected address"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="ward">Ward (Optional)</Label>
        <Input id="ward" value={ward} onChange={(e) => setWard(e.target.value)} placeholder="e.g., Ward 1" />
      </div>

      {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>}

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Issue"
          )}
        </Button>
      </div>
    </form>
  )
}
