"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useOrders } from "@/context/order-context"
import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react"

export default function MyOrdersPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const { getUserOrders } = useOrders()
  const router = useRouter()

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  const orders = getUserOrders()

  if (isLoading) {
    return (
      <div className="section-padding">
        <div className="container-custom max-w-4xl mx-auto text-center">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Função para renderizar o ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "preparing":
        return <Package className="w-5 h-5 text-blue-500" />
      case "delivering":
        return <Truck className="w-5 h-5 text-purple-500" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  // Função para obter o texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "preparing":
        return "Preparando"
      case "delivering":
        return "Em entrega"
      case "completed":
        return "Concluído"
      case "cancelled":
        return "Cancelado"
      default:
        return "Desconhecido"
    }
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="section-padding bg-gray-50">
      <div className="container-custom max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="mb-4">Você ainda não fez nenhum pedido.</p>
            <Link href="/cardapio" className="btn-primary inline-block">
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Pedido #{order.id.split("_")[1]}</p>
                    <p className="text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-2 font-medium">{getStatusText(order.status)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Itens do Pedido</h3>
                    <ul className="space-y-2">
                      {order.items.map((item, index) => (
                        <li key={index} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.name}
                            {item.observations && (
                              <span className="text-sm text-gray-500 block">Obs: {item.observations}</span>
                            )}
                          </span>
                          <span>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Informações de Entrega</h3>
                      <p>{order.deliveryInfo.name}</p>
                      <p>{order.deliveryInfo.phone}</p>
                      {order.deliveryType === "delivery" && order.deliveryInfo.address && (
                        <p>{order.deliveryInfo.address}</p>
                      )}
                      <p>Tipo: {order.deliveryType === "delivery" ? "Entrega" : "Retirada"}</p>
                      <p>Horário: {order.deliveryInfo.time}</p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Status do Pedido</h3>
                      {order.status === "pending" && <p>Seu pedido foi recebido e está sendo processado.</p>}
                      {order.status === "preparing" && <p>Seu pedido está sendo preparado na cozinha.</p>}
                      {order.status === "delivering" && (
                        <p>
                          Seu pedido está a caminho! Tempo estimado de entrega:{" "}
                          {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : "Em breve"}
                        </p>
                      )}
                      {order.status === "completed" && (
                        <p>Seu pedido foi {order.deliveryType === "delivery" ? "entregue" : "retirado"}. Obrigado!</p>
                      )}
                      {order.status === "cancelled" && <p>Este pedido foi cancelado.</p>}

                      {["pending", "preparing"].includes(order.status) && (
                        <Link href={`/acompanhar/${order.id}`} className="btn-primary mt-2 inline-block">
                          Acompanhar Pedido
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
