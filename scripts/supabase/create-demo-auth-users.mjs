import fs from "node:fs"
import path from "node:path"

import { createClient } from "@supabase/supabase-js"

const DEMO_USERS = [
  {
    email: "admin.demo@tracking.local",
    password: "Demo@123456",
    fullName: "Tran Minh Admin",
    role: "admin",
  },
  {
    email: "seaport.demo@tracking.local",
    password: "Demo@123456",
    fullName: "Nguyen Hai Operations",
    role: "seaport_staff",
  },
  {
    email: "dryport.demo@tracking.local",
    password: "Demo@123456",
    fullName: "Le Thu Yard",
    role: "dryport_staff",
  },
  {
    email: "customer.demo@tracking.local",
    password: "Demo@123456",
    fullName: "Pham Lan Customer",
    role: "customer",
  },
]

function parseEnvFile(contents) {
  const parsed = {}

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) {
      continue
    }

    const separatorIndex = line.indexOf("=")
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    let value = line.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    parsed[key] = value
  }

  return parsed
}

function loadEnvFromFiles(cwd) {
  const merged = {}

  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(cwd, fileName)

    if (!fs.existsSync(filePath)) {
      continue
    }

    Object.assign(merged, parseEnvFile(fs.readFileSync(filePath, "utf8")))
  }

  return merged
}

async function listAllUsers(adminClient) {
  const users = []
  let page = 1
  const perPage = 200

  while (true) {
    const { data, error } = await adminClient.listUsers({ page, perPage })
    if (error) {
      throw error
    }

    users.push(...data.users)

    if (data.users.length < perPage) {
      return users
    }

    page += 1
  }
}

async function ensureDemoUser(adminClient, existingUsers, demoUser) {
  const existingUser = existingUsers.find(
    (candidate) => candidate.email?.toLowerCase() === demoUser.email.toLowerCase(),
  )

  const attributes = {
    email: demoUser.email,
    password: demoUser.password,
    email_confirm: true,
    user_metadata: {
      full_name: demoUser.fullName,
      role: demoUser.role,
      demo_user: true,
    },
    app_metadata: {
      role: demoUser.role,
      demo_user: true,
    },
  }

  if (!existingUser) {
    const { data, error } = await adminClient.createUser(attributes)
    if (error) {
      throw error
    }

    return {
      action: "created",
      email: demoUser.email,
      id: data.user?.id ?? "unknown",
      password: demoUser.password,
    }
  }

  const { error } = await adminClient.updateUserById(existingUser.id, attributes)
  if (error) {
    throw error
  }

  return {
    action: "updated",
    email: demoUser.email,
    id: existingUser.id,
    password: demoUser.password,
  }
}

async function main() {
  const cwd = process.cwd()
  const fileEnv = loadEnvFromFiles(cwd)
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    fileEnv.NEXT_PUBLIC_SUPABASE_URL ??
    fileEnv.SUPABASE_URL
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? fileEnv.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL. Add it to your environment or .env.local.",
    )
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to your environment or .env.local.",
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const existingUsers = await listAllUsers(supabase.auth.admin)
  const results = []

  for (const demoUser of DEMO_USERS) {
    results.push(await ensureDemoUser(supabase.auth.admin, existingUsers, demoUser))
  }

  console.log("Demo auth users ready:")
  for (const result of results) {
    console.log(
      `- ${result.action.toUpperCase()}: ${result.email} | password: ${result.password} | id: ${result.id}`,
    )
  }

  console.log("")
  console.log("Next step: run supabase/seed-tracking-demo.sql in the Supabase SQL editor.")
}

main().catch((error) => {
  console.error("Failed to create demo auth users.")
  console.error(error.message)
  process.exitCode = 1
})
