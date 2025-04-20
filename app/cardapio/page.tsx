"use client"

import { useState } from "react"
import { getAllItems, getItemsByCategory } from "@/data/menu-items"
import MenuItemCard from "@/components/menu-item-card"
import CategoryTabs from "@/components/category-tabs"

export default function CardapioPage() {
  const [activeCategory, setActiveCategory] = useState("Todos")

  const displayedItems = activeCategory === "Todos" ? getAllItems() : getItemsByCategory(activeCategory)

  return (
    <div className="section-padding">
      <div className="container-custom">
        <h1 className="section-title">Nosso Cardápio</h1>

        <CategoryTabs activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
