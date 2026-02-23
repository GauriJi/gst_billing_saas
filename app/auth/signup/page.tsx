"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabase"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Signup successful! Check your email.")
    }
  }

  return (
    <div className="flex flex-col gap-4 p-10 max-w-md">
      <h1 className="text-2xl font-bold">Signup</h1>

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
        className="bg-blue-500 text-white p-2 rounded"
        onClick={handleSignup}
      >
        Sign Up
      </button>
    </div>
  )
}