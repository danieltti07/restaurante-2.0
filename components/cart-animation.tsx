"use client"

import { createContext, useContext, useState, useRef, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart } from "lucide-react"

interface CartAnimationContextType {
  animateToCart: (startX: number, startY: number) => void
}

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined)

export function CartAnimationProvider({ children }: { children: ReactNode }) {
  const [animations, setAnimations] = useState<{ id: string; x: number; y: number }[]>([])
  const cartRef = useRef<HTMLDivElement>(null)

  const animateToCart = (startX: number, startY: number) => {
    // Obter a posição do ícone do carrinho
    if (!cartRef.current) return

    const cartRect = cartRef.current.getBoundingClientRect()
    const endX = cartRect.left + cartRect.width / 2
    const endY = cartRect.top + cartRect.height / 2

    // Adicionar nova animação
    const newAnimation = {
      id: `anim_${Date.now()}`,
      x: startX,
      y: startY,
    }

    setAnimations((prev) => [...prev, newAnimation])

    // Remover a animação após completar
    setTimeout(() => {
      setAnimations((prev) => prev.filter((anim) => anim.id !== newAnimation.id))
    }, 1000)
  }

  return (
    <CartAnimationContext.Provider value={{ animateToCart }}>
      {children}
      <div ref={cartRef} className="cart-icon-ref fixed top-0 right-0 pointer-events-none opacity-0" />

      <AnimatePresence>
        {animations.map((anim) => (
          <motion.div
            key={anim.id}
            className="fixed z-50 pointer-events-none"
            initial={{
              x: anim.x,
              y: anim.y,
              scale: 1,
              opacity: 0.8,
            }}
            animate={{
              x: window.innerWidth - 80, // Posição aproximada do ícone do carrinho
              y: 40, // Posição aproximada do ícone do carrinho
              scale: 0.5,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              duration: 0.8,
              bounce: 0.3,
            }}
          >
            <div className="bg-primary text-white p-2 rounded-full">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </CartAnimationContext.Provider>
  )
}

export function useCartAnimation() {
  const context = useContext(CartAnimationContext)
  if (context === undefined) {
    throw new Error("useCartAnimation must be used within a CartAnimationProvider")
  }
  return context
}
