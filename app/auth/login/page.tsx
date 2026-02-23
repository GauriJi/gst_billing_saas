"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="flex flex-col gap-4 p-10 max-w-md">
      <h1 className="text-2xl font-bold">Login</h1>

      <input
        className="border p-2"
        type="email"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2"
        type="password"
        placeholder="Enter Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-green-500 text-white p-2 rounded"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  )
}