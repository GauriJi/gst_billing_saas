"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabase"
import { useRouter } from "next/navigation"

export default function InvoiceListPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push("/auth/login")
        return
      }

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id)
        .single()

      if (!business) return

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          total_amount,
          created_at,
          customers(name)
        `)
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })

      if (!error) {
        setInvoices(data || [])
      }

      setLoading(false)
    }

    fetchInvoices()
  }, [router])

  if (loading) {
    return (
      <div className="p-10 min-h-screen bg-gray-100 text-gray-700">
        Loading...
      </div>
    )
  }

  return (
    <div className="p-10 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        All Invoices
      </h1>

      {invoices.length === 0 ? (
        <p className="text-gray-600">No invoices found.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              onClick={() =>
                router.push(`/dashboard/invoices/${inv.id}`)
              }
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {inv.invoice_number}
                </h2>

                <span className="text-purple-600 font-bold text-lg">
                  ₹ {Number(inv.total_amount).toFixed(2)}
                </span>
              </div>

              <p className="text-gray-600 mt-2">
                Customer: {inv.customers?.name}
              </p>

              <p className="text-sm text-gray-400 mt-3">
                {new Date(inv.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}