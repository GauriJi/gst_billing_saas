"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/auth/login")
      } else {
        setUserEmail(data.user.email ?? "")
      }
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome: {userEmail}</p>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  )
}