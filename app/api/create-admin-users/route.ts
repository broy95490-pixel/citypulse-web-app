import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Starting admin user creation...")
    console.log("[v0] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("[v0] Service role key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const adminEmail = "admin@citypulse.com"
    const adminPassword = "Ssj@6900fu"
    const modEmail = "moderator@citypulse.com"
    const modPassword = "Moderator123!"

    console.log("[v0] Creating admin user...")

    let adminUserId: string | null = null
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "System Administrator",
      },
    })

    if (adminError) {
      console.log("[v0] Admin creation error:", adminError.message)
      if (adminError.message.includes("already registered") || adminError.message.includes("already exists")) {
        // User exists, fetch them
        const { data: users } = await supabaseAdmin.auth.admin.listUsers()
        const existingAdmin = users.users?.find((u) => u.email === adminEmail)
        if (existingAdmin) {
          adminUserId = existingAdmin.id
          console.log("[v0] Found existing admin user:", adminUserId)
        }
      } else {
        throw adminError
      }
    } else {
      adminUserId = adminData.user?.id || null
      console.log("[v0] Admin user created:", adminUserId)
    }

    console.log("[v0] Creating moderator user...")

    let modUserId: string | null = null
    const { data: modData, error: modError } = await supabaseAdmin.auth.admin.createUser({
      email: modEmail,
      password: modPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Municipal Moderator",
      },
    })

    if (modError) {
      console.log("[v0] Moderator creation error:", modError.message)
      if (modError.message.includes("already registered") || modError.message.includes("already exists")) {
        // User exists, fetch them
        const { data: users } = await supabaseAdmin.auth.admin.listUsers()
        const existingMod = users.users?.find((u) => u.email === modEmail)
        if (existingMod) {
          modUserId = existingMod.id
          console.log("[v0] Found existing moderator user:", modUserId)
        }
      } else {
        throw modError
      }
    } else {
      modUserId = modData.user?.id || null
      console.log("[v0] Moderator user created:", modUserId)
    }

    if (adminUserId) {
      console.log("[v0] Creating admin profile...")
      const { error: adminProfileError } = await supabaseAdmin.from("profiles").upsert(
        {
          id: adminUserId,
          email: adminEmail,
          full_name: "System Administrator",
          role: "admin",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (adminProfileError) {
        console.log("[v0] Admin profile error:", adminProfileError)
        throw adminProfileError
      } else {
        console.log("[v0] Admin profile created/updated")
      }
    }

    if (modUserId) {
      console.log("[v0] Creating moderator profile...")
      const { error: modProfileError } = await supabaseAdmin.from("profiles").upsert(
        {
          id: modUserId,
          email: modEmail,
          full_name: "Municipal Moderator",
          role: "moderator",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      if (modProfileError) {
        console.log("[v0] Moderator profile error:", modProfileError)
        throw modProfileError
      } else {
        console.log("[v0] Moderator profile created/updated")
      }
    }

    console.log("[v0] Admin setup complete!")

    return NextResponse.json({
      success: true,
      message: `Admin users ready! Login with:\n• Admin: ${adminEmail} / ${adminPassword}\n• Moderator: ${modEmail} / ${modPassword}`,
      adminUserId,
      modUserId,
    })
  } catch (error) {
    console.error("[v0] Error creating admin users:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 },
    )
  }
}
