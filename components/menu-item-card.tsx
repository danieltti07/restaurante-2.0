"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Plus, Minus } from "lucide-react"
import { type MenuItem, useCart } from "@/context/cart-context"
import { useCartAnimation } from "./cart-animation"

interface MenuItemCardProps {
  item: MenuItem
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [observations, setObservations] = useState("")
  const [showObservations, setShowObservations] = useState(false)
  const { addItem } = useCart()
  const { animateToCart } = useCartAnimation()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleAddToCart = () => {
    // Iniciar a animação
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const startX = rect.left + rect.width / 2
      const startY = rect.top + rect.height / 2
      animateToCart(startX, startY)
    }

    // Adicionar ao carrinho após um pequeno delay para a animação ser visível
    setTimeout(() => {
      addItem(item, quantity, observations)
      setQuantity(1)
      setObservations("")
      setShowObservations(false)
    }, 100)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold">{item.name}</h3>
        <p className="text-gray-600 text-sm mt-1 h-12 overflow-hidden">{item.description}</p>
        <p className="text-primary font-bold text-xl mt-2">R$ {item.price.toFixed(2).replace(".", ",")}</p>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="px-2 py-1 text-gray-600 hover:text-primary"
                aria-label="Diminuir quantidade"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-1">{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-2 py-1 text-gray-600 hover:text-primary"
                aria-label="Aumentar quantidade"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowObservations(!showObservations)}
              className="text-sm text-gray-600 hover:text-primary"
            >
              {showObservations ? "Ocultar observações" : "Adicionar observações"}
            </button>
          </div>

          {showObservations && (
            <div className="mb-4">
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: Sem cebola, molho à parte..."
                className="w-full p-2 border rounded-md text-sm"
                rows={2}
              />
            </div>
          )}

          <button
            ref={buttonRef}
            onClick={handleAddToCart}
            className="btn-primary w-full relative overflow-hidden group"
          >
            <span className="relative z-10">Adicionar ao Pedido</span>
            <span className="absolute inset-0 bg-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
          </button>
        </div>
      </div>
    </div>
  )
}
