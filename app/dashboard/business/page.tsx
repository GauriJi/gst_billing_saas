"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

export default function BusinessPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [gst, setGst] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")

  const handleSave = async () => {
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      alert("User not logged in")
      return
    }

    const { error } = await supabase.from("businesses").insert([
      {
        name,
        gst_number: gst,
        address,
        phone,
        email,
        user_id: userData.user.id,
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      alert("Business saved successfully!")
      router.push("/dashboard")
    }
  }

  return (
    <div className="p-10 max-w-lg flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Create Business Profile</h1>

      <input
        className="border p-2"
        placeholder="Business Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="GST Number"
        onChange={(e) => setGst(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Address"
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Phone"
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white p-2 rounded"
      >
        Save Business
      </button>
    </div>
  )
}