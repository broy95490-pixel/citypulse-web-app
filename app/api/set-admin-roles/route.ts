import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Setting admin roles...")

    // Create admin client with service role
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Update admin role
    const { data: adminData, error: adminError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("email", "admin@citypulse.com")
      .select()

    if (adminError) {
      console.error("[v0] Admin role update error:", adminError)
      return NextResponse.json({ error: "Failed to update admin role", details: adminError }, { status: 500 })
    }

    console.log("[v0] Admin role updated:", adminData)

    // Update moderator role
    const { data: modData, error: modError } = await supabase
      .from("profiles")
      .update({ role: "moderator" })
      .eq("email", "moderator@citypulse.com")
      .select()

    if (modError) {
      console.error("[v0] Moderator role update error:", modError)
      return NextResponse.json({ error: "Failed to update moderator role", details: modError }, { status: 500 })
    }

    console.log("[v0] Moderator role updated:", modData)

    return NextResponse.json({
      success: true,
      message: "Admin roles set successfully",
      admin: adminData,
      moderator: modData,
    })
  } catch (error) {
    console.error("[v0] Set admin roles error:", error)
    return NextResponse.json({ error: "Failed to set admin roles", details: String(error) }, { status: 500 })
  }
}
