const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function getSupabaseEnv() {
  if (!SUPABASE_URL) {
    throw new Error("Cần có NEXT_PUBLIC_SUPABASE_URL để dùng Supabase Auth.")
  }

  if (!SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Cần có NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY để dùng Supabase Auth.",
    )
  }

  return {
    url: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY,
  }
}
