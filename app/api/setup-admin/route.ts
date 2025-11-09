import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get request body with admin credentials
    const body = await request.json()
    const { adminEmail, adminPassword, moderatorEmail, moderatorPassword } = body

    if (!adminEmail || !adminPassword || !moderatorEmail || !moderatorPassword) {
      return Response.json(
        { error: "All credentials are required (adminEmail, adminPassword, moderatorEmail, moderatorPassword)" },
        { status: 400 },
      )
    }

    // Create admin user
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })

    if (adminError && !adminError.message.includes("already registered")) {
      return Response.json({ error: `Failed to create admin: ${adminError.message}` }, { status: 500 })
    }

    // Create moderator user
    const { data: modData, error: modError } = await supabase.auth.admin.createUser({
      email: moderatorEmail,
      password: moderatorPassword,
      email_confirm: true,
    })

    if (modError && !modError.message.includes("already registered")) {
      return Response.json({ error: `Failed to create moderator: ${modError.message}` }, { status: 500 })
    }

    // Set admin role
    if (adminData?.user) {
      await supabase.from("profiles").upsert({
        id: adminData.user.id,
        email: adminEmail,
        full_name: "System Administrator",
        role: "admin",
        updated_at: new Date().toISOString(),
      })
    }

    // Set moderator role
    if (modData?.user) {
      await supabase.from("profiles").upsert({
        id: modData.user.id,
        email: moderatorEmail,
        full_name: "Municipal Authority",
        role: "moderator",
        updated_at: new Date().toISOString(),
      })
    }

    return Response.json({
      success: true,
      message: "Admin users created successfully",
    })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
