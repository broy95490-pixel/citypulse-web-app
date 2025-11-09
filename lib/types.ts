export type IssueStatus = "unresolved" | "in_progress" | "resolved"
export type IssueCategory =
  | "road_maintenance"
  | "street_lighting"
  | "waste_management"
  | "water_supply"
  | "drainage"
  | "public_transport"
  | "parks_recreation"
  | "building_violations"
  | "noise_pollution"
  | "other"

export type UserRole = "citizen" | "moderator" | "admin"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Issue {
  id: string
  user_id: string
  title: string
  description: string
  category: IssueCategory
  status: IssueStatus
  latitude: number
  longitude: number
  address: string | null
  ward: string | null
  photo_url: string | null
  before_photo_url: string | null
  after_photo_url: string | null
  upvotes: number
  created_at: string
  updated_at: string
  resolved_at: string | null
  profiles?: Profile
}

export interface IssueVote {
  id: string
  issue_id: string
  user_id: string
  created_at: string
}

export interface IssueComment {
  id: string
  issue_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface IssueUpdate {
  id: string
  issue_id: string
  user_id: string
  old_status: IssueStatus | null
  new_status: IssueStatus
  comment: string | null
  created_at: string
  profiles?: Profile
}
