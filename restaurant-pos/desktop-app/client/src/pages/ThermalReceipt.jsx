import React from "react";

export default function ThermalReceipt({ order, customer }) {
  return (
    <div
      id="receipt"
      className="p-4 text-sm font-mono w-[300px] mx-auto bg-white text-black"
    >
      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-lg font-bold">
          Captain's Cafe
        </h2>
        <p>Restaurant</p>
        <p>Phone: 0778231121</p>
        <p>www.website.com</p>
      </div>

      <div className="border-t border-dashed my-2"></div>

      {/* ORDER INFO */}
      <p>Invoice: {order.invoiceNumber}</p>
      <p>
        Date:{" "}
        {new Date(order.createdAt).toLocaleString()}
      </p>

      {customer && (
        <p>Customer: {customer.name}</p>
      )}

      <div className="border-t border-dashed my-2"></div>

      {/* ITEMS */}
      {order.items.map((item, index) => (
        <div key={index} className="flex justify-between">
          <span>
            {item.name} x{item.quantity}
          </span>
          <span>Rs.{item.total}</span>
        </div>
      ))}

      <div className="border-t border-dashed my-2"></div>

      {/* TOTALS */}
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>Rs.{order.subTotal}</span>
      </div>

      <div className="flex justify-between">
        <span>Discount</span>
        <span>- Rs.{order.totalDiscount}</span>
      </div>

      <div className="flex justify-between font-bold text-base">
        <span>Total</span>
        <span>Rs.{order.grandTotal}</span>
      </div>

      <div className="border-t border-dashed my-2"></div>

      <p>Payment: {order.paymentMethod}</p>

      <div className="text-center mt-4">
        <p>Thank you for your order!</p>
        <p className="mt-2 text-xs">
          POS System by Lexient Innovations
        </p>
        <p className="text-xs">0778231121</p>
      </div>
    </div>
  );
}