'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import SearchFilters, { FilterItem } from '@/components/SearchFilters'

interface HomeSearchProps {
    brands: FilterItem[]
    categories: FilterItem[]
}

export default function HomeSearch({ brands, categories }: HomeSearchProps) {
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBrand, setSelectedBrand] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const params = new URLSearchParams()
        if (searchQuery.trim()) params.set('q', searchQuery)
        if (selectedBrand) params.set('brand', selectedBrand)
        if (selectedCategory) params.set('category', selectedCategory)

        // If no filters are active, view all products instead of going to landing page
        if (params.toString() === '') {
            router.push('/?view=all')
        } else {
            router.push(`/?${params.toString()}`)
        }
        setIsMenuOpen(false)
    }

    return (
        <div className="w-full max-w-4xl mx-auto relative">
            {/* Input Wrapper */}
            <div className={cn(
                "relative transition-all duration-200",
                isMenuOpen ? "z-[100]" : "z-10"
            )}>
                <form onSubmit={handleSearch} className="relative flex items-center">
                    <Search className="absolute left-6 h-6 w-6 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="부품명, 자동차 모델 검색 (예: 그랜저 헤드라이트)"
                        className={cn(
                            "h-16 w-full rounded-full border-2 bg-white pl-16 pr-32 text-lg shadow-xl shadow-purple-100/50 transition-all placeholder:text-gray-400 focus:outline-none",
                            isMenuOpen
                                ? "border-purple-500 ring-4 ring-purple-100"
                                : "border-gray-100 hover:border-purple-200"
                        )}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsMenuOpen(true)}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 h-12 rounded-full bg-purple-600 px-8 text-base font-bold text-white transition-all hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200 active:scale-95"
                    >
                        검색
                    </button>
                </form>
            </div>

            {/* Smart Search Filter Overlay */}
            {isMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 w-screen h-screen z-[90] bg-black/20 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Filter Menu */}
                    <div
                        className="absolute top-full left-0 right-0 mt-4 z-[100] rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 text-left"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <SearchFilters
                            brands={brands}
                            categories={categories}
                            selectedBrand={selectedBrand}
                            selectedCategory={selectedCategory}
                            onBrandChange={setSelectedBrand}
                            onCategoryChange={setSelectedCategory}
                        />
                        <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                            <Button
                                onClick={handleSearch}
                                className="h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full px-10 text-base font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all"
                            >
                                검색보기
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
