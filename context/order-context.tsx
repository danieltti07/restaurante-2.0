"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "./auth-context"
import type { CartItem } from "./cart-context"

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "preparing" | "delivering" | "completed" | "cancelled"
  deliveryType: "delivery" | "pickup"
  deliveryInfo: {
    name: string
    phone: string
    address?: string
    complement?: string
    time: string
  }
  paymentMethod: string
  createdAt: string
  estimatedDelivery?: string
  currentLocation?: string
}

interface OrderContextType {
  orders: Order[]
  activeOrder: Order | null
  createOrder: (
    orderData: Omit<Order, "id" | "createdAt" | "status" | "estimatedDelivery" | "currentLocation">,
  ) => Promise<string>
  getOrderById: (orderId: string) => Order | null
  getUserOrders: () => Order[]
  cancelOrder: (orderId: string) => Promise<boolean>
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)

  // Carregar pedidos do localStorage
  useEffect(() => {
    if (user) {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      setOrders(storedOrders)

      // Definir o pedido ativo (o mais recente que não está completo ou cancelado)
      const active =
        storedOrders
          .filter(
            (order: Order) => order.userId === user.id && ["pending", "preparing", "delivering"].includes(order.status),
          )
          .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null

      setActiveOrder(active)
    } else {
      setOrders([])
      setActiveOrder(null)
    }
  }, [user])

  // Simular a criação de um pedido
  const createOrder = async (
    orderData: Omit<Order, "id" | "createdAt" | "status" | "estimatedDelivery" | "currentLocation">,
  ): Promise<string> => {
    if (!user) throw new Error("Usuário não autenticado")

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Gerar dados do pedido
    const orderId = `order_${Date.now()}`
    const now = new Date()
    const estimatedTime = new Date(now.getTime() + 40 * 60000) // 40 minutos depois

    const newOrder: Order = {
      id: orderId,
      status: "pending",
      createdAt: now.toISOString(),
      estimatedDelivery: estimatedTime.toISOString(),
      currentLocation: "Restaurante",
      ...orderData,
    }

    // Salvar no "banco de dados" (localStorage)
    const allOrders = [...orders, newOrder]
    localStorage.setItem("orders", JSON.stringify(allOrders))
    setOrders(allOrders)
    setActiveOrder(newOrder)

    // Simular mudanças de status ao longo do tempo (apenas para demonstração)
    simulateOrderProgress(newOrder, allOrders)

    return orderId
  }

  // Simular o progresso do pedido ao longo do tempo
  const simulateOrderProgress = (order: Order, allOrders: Order[]) => {
    // Após 1 minuto, mudar para "preparing"
    setTimeout(() => {
      updateOrderStatus(order.id, "preparing", "Cozinha", allOrders)
    }, 60000)

    // Após 3 minutos, mudar para "delivering" se for delivery
    if (order.deliveryType === "delivery") {
      setTimeout(() => {
        updateOrderStatus(order.id, "delivering", "A caminho", allOrders)
      }, 180000)

      // Após 5 minutos, mudar para "completed"
      setTimeout(() => {
        updateOrderStatus(order.id, "completed", "Entregue", allOrders)
      }, 300000)
    } else {
      // Se for pickup, após 3 minutos mudar para "completed"
      setTimeout(() => {
        updateOrderStatus(order.id, "completed", "Pronto para retirada", allOrders)
      }, 180000)
    }
  }

  // Atualizar o status de um pedido
  const updateOrderStatus = (orderId: string, status: Order["status"], location: string, allOrders: Order[]) => {
    const updatedOrders = allOrders.map((o) => {
      if (o.id === orderId) {
        return { ...o, status, currentLocation: location }
      }
      return o
    })

    localStorage.setItem("orders", JSON.stringify(updatedOrders))
    setOrders(updatedOrders)

    // Atualizar o pedido ativo se necessário
    if (activeOrder?.id === orderId) {
      const updatedActiveOrder = { ...activeOrder, status, currentLocation: location }
      setActiveOrder(status === "completed" || status === "cancelled" ? null : updatedActiveOrder)
    }
  }

  // Obter um pedido pelo ID
  const getOrderById = (orderId: string): Order | null => {
    return orders.find((order) => order.id === orderId) || null
  }

  // Obter todos os pedidos do usuário atual
  const getUserOrders = (): Order[] => {
    if (!user) return []
    return orders
      .filter((order) => order.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Cancelar um pedido
  const cancelOrder = async (orderId: string): Promise<boolean> => {
    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const orderToCancel = orders.find((order) => order.id === orderId)
    if (!orderToCancel || !["pending", "preparing"].includes(orderToCancel.status)) {
      return false
    }

    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: "cancelled" as const }
      }
      return order
    })

    localStorage.setItem("orders", JSON.stringify(updatedOrders))
    setOrders(updatedOrders)

    // Atualizar o pedido ativo se necessário
    if (activeOrder?.id === orderId) {
      setActiveOrder(null)
    }

    return true
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        createOrder,
        getOrderById,
        getUserOrders,
        cancelOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
