"use client"
import { useEffect } from "react"
import { supabase } from "../../lib/supabase"

export default function TestSupabase() {
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("businesses").select("*")
      console.log("Data:", data)
      console.log("Error:", error)
    }
    fetchData()
  }, [])

  return <div>Check console for Supabase test results</div>
}