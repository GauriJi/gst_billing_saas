export function calculateGST(
  price: number,
  quantity: number,
  gstRate: number
) {
  const subtotal = price * quantity
  const gstAmount = (subtotal * gstRate) / 100
  const total = subtotal + gstAmount

  return {
    subtotal,
    gstAmount,
    total,
  }
}