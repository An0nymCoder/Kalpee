import React from 'react'
import { Shirt, Laptop, Watch, Wrench, ShoppingBag } from 'lucide-react'

export default function CategoryIcon({ categorie, className = 'w-5 h-5' }) {
  switch (categorie) {
    case 'VETEMENTS':
      return <Shirt className={className} />
    case 'ELECTRONIQUE':
      return <Laptop className={className} />
    case 'ACCESSOIRES':
      return <Watch className={className} />
    case 'EQUIPEMENT':
      return <Wrench className={className} />
    case 'AUTRE':
    default:
      return <ShoppingBag className={className} />
  }
}
