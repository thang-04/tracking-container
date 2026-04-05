import { getUserDirectory } from "@/lib/users/get-user-directory"

import { UsersPageClient } from "./users-page-client"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const users = await getUserDirectory()

  return <UsersPageClient users={users} />
}
