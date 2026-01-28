'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Product {
    id: string
    title: string
    price: number
    images: string[]
    year: number | null
    brands?: { name: string } | null
    created_at: string
}

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    // Format price to KRW
    const formattedPrice = new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
    }).format(product.price)

    // Use simple relative time for "created_at"
    const getTimeAgo = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return `${Math.floor(diffInSeconds / 86400)}d ago`
    }

    return (
        <Link href={`/product/${product.id}`} className="group block">
            <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">

                {/* Image Display */}
                <div className="relative aspect-[4/3] w-full bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                            <div className="relative h-12 w-12 opacity-30">
                                <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 rotate-45 bg-red-500"></div>
                                <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 -rotate-45 bg-red-500"></div>
                            </div>
                        </div>
                    )}

                    {/* Heart Button (Visual only for now) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                            e.preventDefault()
                            // TODO: Implement toggle like
                        }}
                    >
                        <Heart className="h-4 w-4 text-gray-600" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                        {product.title}
                    </h3>

                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <span>{product.brands?.name || 'Unknown'}</span>
                            {product.year && (
                                <>
                                    <span>•</span>
                                    <span>{product.year}</span>
                                </>
                            )}
                        </div>
                        <span>{getTimeAgo(product.created_at)}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
