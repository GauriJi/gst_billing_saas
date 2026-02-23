"use client"

import { useState, useEffect } from "react"
import { supabase } from "../../../lib/supabase"
import { useRouter } from "next/navigation"

interface Item {
  description: string
  quantity: number
  price: number
  cgst: number
  sgst: number
  igst: number
  total: number
}

export default function InvoicePage() {
  const router = useRouter()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, price: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
  ])
  const [isInterstate, setIsInterstate] = useState(false)

  // Fetch business & customers
  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return router.push("/auth/login")

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id)
        .single()
      if (business) {
        setBusinessId(business.id)
        const { data: custs } = await supabase
          .from("customers")
          .select("*")
          .eq("business_id", business.id)
        if (custs) setCustomers(custs)
      }
    }
    fetchData()
  }, [router])

  // Handle item change
  const handleItemChange = (index: number, field: keyof Item, value: number | string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Calculate GST & total
    const price = Number(newItems[index].price)
    const qty = Number(newItems[index].quantity)
    const subtotal = price * qty
    if (isInterstate) {
      newItems[index].igst = subtotal * 0.18
      newItems[index].cgst = 0
      newItems[index].sgst = 0
      newItems[index].total = subtotal + newItems[index].igst
    } else {
      newItems[index].cgst = subtotal * 0.09
      newItems[index].sgst = subtotal * 0.09
      newItems[index].igst = 0
      newItems[index].total = subtotal + newItems[index].cgst + newItems[index].sgst
    }

    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }])
  }

  const calculateGrandTotal = () => items.reduce((acc, item) => acc + item.total, 0)

  const handleCreateInvoice = async () => {
    if (!businessId || !selectedCustomer || !invoiceNumber) return alert("Fill all fields")
    try {
      // Insert invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert([{ business_id: businessId, customer_id: selectedCustomer, invoice_number: invoiceNumber, total_amount: calculateGrandTotal() }])
        .select()

      if (invoiceError || !invoiceData?.[0]) return alert(invoiceError?.message || "Invoice failed")
      const newInvoice = invoiceData[0]

      // Insert items
      const insertItems = items
        .filter((i) => i.description)
        .map((i) => ({
          invoice_id: newInvoice.id,
          description: i.description,
          quantity: i.quantity,
          price: i.price,
          cgst: i.cgst,
          sgst: i.sgst,
          igst: i.igst,
          total: i.total,
        }))

      if (insertItems.length > 0) {
        const { error: itemError } = await supabase.from("invoice_items").insert(insertItems).select()
        if (itemError) return alert("Failed to insert items: " + itemError.message)
      }

      alert("Invoice created successfully!")
      setInvoiceNumber("")
      setSelectedCustomer("")
      setItems([{ description: "", quantity: 1, price: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }])
      router.push("/dashboard/invoices/list")
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }
  }

  return (
    <div className="p-10 max-w-xl flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Create Invoice</h1>

      <input className="border p-2 rounded" placeholder="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />

      <select className="border p-2 rounded" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
        <option value="">Select Customer</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label className="mt-2">
        <input type="checkbox" checked={isInterstate} onChange={() => setIsInterstate(!isInterstate)} /> Interstate (IGST)
      </label>

      <h2 className="text-xl font-semibold mt-6">Items</h2>

      {items.map((item, index) => (
        <div key={index} className="flex flex-col gap-2 border p-3 mt-2 rounded-lg bg-gray-50">
          <input className="border p-2 rounded" placeholder="Item Description" value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} />
          <input type="number" className="border p-2 rounded" placeholder="Quantity" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} />
          <input type="number" className="border p-2 rounded" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(index, "price", Number(e.target.value))} />
          <div className="flex justify-between text-sm mt-1">
            <span>CGST: ₹{item.cgst.toFixed(2)}</span>
            <span>SGST: ₹{item.sgst.toFixed(2)}</span>
            <span>IGST: ₹{item.igst.toFixed(2)}</span>
          </div>
          <p className="font-semibold mt-2 text-purple-700">Item Total: ₹{item.total.toFixed(2)}</p>
        </div>
      ))}

      <button onClick={addItem} className="bg-gray-600 text-white p-2 rounded mt-3 hover:bg-gray-700">Add Item</button>

      <h2 className="text-xl font-bold mt-6">Grand Total: ₹{calculateGrandTotal().toFixed(2)}</h2>

      <button onClick={handleCreateInvoice} className="bg-purple-600 text-white p-2 rounded mt-4 hover:bg-purple-700">Create Invoice</button>
    </div>
  )
}