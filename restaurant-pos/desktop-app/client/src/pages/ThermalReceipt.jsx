import React from "react";

export default function ThermalReceipt({ order, customer }) {
  return (
    <div
      id="receipt"
      className="w-[300px] mx-auto bg-white text-black font-mono text-[13px] p-3"
    >
      {/* LOGO */}
      <div className="flex justify-center mb-2">
        <img
          src="https://i.ibb.co/H059FHk/download.jpg"
          alt="Restaurant Logo"
          className="w-16 h-16 object-contain"
        />
      </div>

      {/* HEADER */}
      <div className="text-center leading-tight">
        <h2 className="text-[16px] font-bold tracking-wide uppercase">
          Captain's Cafe
        </h2>
        <p className="text-xs">Premium Restaurant & Cafe</p>
        <p className="text-xs">Balapitiya, Sri Lanka</p>
        <p className="text-xs">Tel: 077 823 1121</p>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* ORDER INFO */}
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>Invoice</span>
          <span>{order.invoiceNumber}</span>
        </div>

        <div className="flex justify-between">
          <span>Date</span>
          <span>
            {new Date(order.createdAt).toLocaleString()}
          </span>
        </div>

        {customer && (
          <div className="flex justify-between">
            <span>Customer</span>
            <span>{customer.name}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* ITEMS HEADER */}
      <div className="flex justify-between font-semibold text-xs">
        <span>Item</span>
        <span>Total</span>
      </div>

      <div className="border-t border-dashed border-black my-1"></div>

      {/* ITEMS LIST */}
      {order.items.map((item, index) => (
        <div key={index} className="mb-1">
          <div className="flex justify-between">
            <span className="w-[70%] truncate">
              {item.name}
            </span>
            <span>Rs.{item.total}</span>
          </div>
          <div className="text-[11px] text-gray-700">
            {item.quantity} x Rs.{item.price}
          </div>
        </div>
      ))}

      <div className="border-t border-dashed border-black my-2"></div>

      {/* TOTALS */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Rs.{order.subTotal}</span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <span>- Rs.{order.totalDiscount}</span>
        </div>

        <div className="border-t border-dashed border-black my-1"></div>

        <div className="flex justify-between font-bold text-[15px]">
          <span>GRAND TOTAL</span>
          <span>Rs.{order.grandTotal}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* PAYMENT */}
      <div className="flex justify-between text-xs">
        <span>Payment Method</span>
        <span>{order.paymentMethod}</span>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* FOOTER */}
      <div className="text-center mt-3 text-xs leading-tight">
        <p className="font-semibold">Thank You! Visit Again</p>
        <p>Please keep this receipt for reference</p>
        <p className="mt-2 text-[10px]">
          Powered by Lexient Innovations
        </p>
        <p className="text-[10px]">077 823 1121</p>
      </div>
    </div>
  );
}