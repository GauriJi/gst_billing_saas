"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "../../../../lib/supabase"
import jsPDF from "jspdf"

const domtoimage: any = require("dom-to-image-more")


// --- TypeScript interfaces ---
interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
  cgst: number
  sgst: number
  igst: number
  total: number
}

interface Customer {
  name: string
  email: string
  address: string
}

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  created_at: string
  customers?: Customer | null
  invoice_items?: InvoiceItem[]
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const invoiceId = pathname.split("/").pop()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!invoiceId) return

    const fetchInvoice = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return router.push("/auth/login")

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          total_amount,
          created_at,
          customers (
            name,
            email,
            address
          ),
          invoice_items (
            id,
            description,
            quantity,
            price,
            cgst,
            sgst,
            igst,
            total
          )
        `)
        .eq("id", invoiceId)
        .single()

      if (error) {
        console.error(error)
        setInvoice(null)
      } else {
        setInvoice(data as Invoice)
      }
      setLoading(false)
    }

    fetchInvoice()
  }, [invoiceId, router])

  const generatePDF = async () => {
    if (!invoiceRef.current || !invoice) return
    try {
      const imgData = await domtoimage.toPng(invoiceRef.current, {
        bgcolor: "white",
        style: {
          color: "black",
          backgroundColor: "white",
        },
      })

      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight =
        (invoiceRef.current.offsetHeight * pdfWidth) / invoiceRef.current.offsetWidth

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Invoice_${invoice.invoice_number}.pdf`)
    } catch (err) {
      console.error("PDF generation error:", err)
    }
  }

  if (loading) return <div className="p-10">Loading...</div>
  if (!invoice) return <div className="p-10">Invoice not found.</div>

  return (
    <div className="p-10 min-h-screen bg-gray-100">
      <div
        ref={invoiceRef}
        className="bg-white text-black p-6 rounded-xl shadow-md w-full"
        style={{ color: "black", backgroundColor: "white" }}
      >
        <h1 className="text-3xl font-bold mb-4">Invoice {invoice.invoice_number}</h1>

        <div className="mb-6">
          <h2 className="font-semibold text-xl">Customer Details</h2>
          <p>Name: {invoice.customers?.name ?? "-"}</p>
          <p>Email: {invoice.customers?.email ?? "-"}</p>
          <p>Address: {invoice.customers?.address ?? "-"}</p>
          <p className="text-sm text-gray-400 mt-2">
            Created At: {new Date(invoice.created_at).toLocaleString()}
          </p>
        </div>

        {invoice.invoice_items && invoice.invoice_items.length > 0 ? (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="border-b">
                <th className="p-2">#</th>
                <th className="p-2">Description</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Price</th>
                <th className="p-2">CGST</th>
                <th className="p-2">SGST</th>
                <th className="p-2">IGST</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_items.map((item, idx) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{item.description}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">₹{item.price.toFixed(2)}</td>
                  <td className="p-2">₹{item.cgst.toFixed(2)}</td>
                  <td className="p-2">₹{item.sgst.toFixed(2)}</td>
                  <td className="p-2">₹{item.igst.toFixed(2)}</td>
                  <td className="p-2 font-bold text-purple-600">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items found.</p>
        )}

        <div className="flex justify-end mt-4 text-lg font-bold">
          Grand Total: ₹{invoice.total_amount.toFixed(2)}
        </div>
      </div>

      <button
        onClick={generatePDF}
        className="mt-6 bg-purple-600 text-white p-2 rounded"
      >
        Download PDF
      </button>
    </div>
  )
}