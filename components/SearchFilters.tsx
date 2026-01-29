'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface FilterItem {
    id: number | string
    name: string
}

interface SearchFiltersProps {
    brands: FilterItem[]
    categories: FilterItem[]
    selectedBrand: string
    selectedCategory: string
    onBrandChange: (brandId: string) => void
    onCategoryChange: (categoryId: string) => void
}

export default function SearchFilters({
    brands = [],
    categories = [],
    selectedBrand,
    selectedCategory,
    onBrandChange,
    onCategoryChange
}: SearchFiltersProps) {
    return (
        <div className="space-y-4">
            {/* Brands Filter */}
            <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Brands</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onBrandChange('')}
                        className={cn(
                            "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                            !selectedBrand
                                ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
                        )}
                    >
                        All
                    </button>
                    {brands.map((brand) => (
                        <button
                            key={brand.id}
                            onClick={() => onBrandChange(String(brand.id))}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                                selectedBrand === String(brand.id)
                                    ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
                            )}
                        >
                            {brand.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories Filter */}
            <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Categories</h3>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onCategoryChange('')}
                        className={cn(
                            "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                            !selectedCategory
                                ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
                        )}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(String(cat.id))}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                                selectedCategory === String(cat.id)
                                    ? "bg-purple-600 text-white shadow-sm shadow-purple-200"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
