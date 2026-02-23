"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

export default function CustomersPage() {
  const router = useRouter()

  const [businessId, setBusinessId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  // 🔹 Get logged-in user's business
  useEffect(() => {
    const fetchBusiness = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push("/auth/login")
        return
      }

      const { data } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id)
        .single()

      if (data) {
        setBusinessId(data.id)
      }
    }

    fetchBusiness()
  }, [router])

  const handleSave = async () => {
    if (!businessId) {
      alert("Business not found")
      return
    }

    const { error } = await supabase.from("customers").insert([
      {
        name,
        email,
        phone,
        address,
        business_id: businessId,
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      alert("Customer added successfully!")
      setName("")
      setEmail("")
      setPhone("")
      setAddress("")
    }
  }

  return (
    <div className="p-10 max-w-lg flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Add Customer</h1>

      <input
        className="border p-2"
        placeholder="Customer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Customer Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Customer Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Customer Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="bg-green-600 text-white p-2 rounded"
      >
        Save Customer
      </button>
    </div>
  )
}