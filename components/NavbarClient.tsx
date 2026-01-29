'use client'

import React, { useEffect, useState } from 'react'
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, ShoppingCart, User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import SearchFilters, { FilterItem } from '@/components/SearchFilters'

interface NavbarClientProps {
    initialUser: any
    brands: FilterItem[]
    categories: FilterItem[]
}

export default function NavbarClient({ initialUser, brands, categories }: NavbarClientProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Show search bar if NOT on home page OR if on home page with search/view params
    const showSearchBar = pathname !== '/' ||
        searchParams.has('q') ||
        searchParams.has('brand') ||
        searchParams.has('category') ||
        searchParams.get('view') === 'all'

    const supabase = createClient()
    const [user, setUser] = useState<any>(initialUser)
    const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBrand, setSelectedBrand] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')

    // Sync user state if initialUser changes (e.g. after server refresh)
    useEffect(() => {
        setUser(initialUser)
    }, [initialUser])

    // Listen to local auth changes just to trigger refresh
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
                router.refresh()
            }
        })
        return () => subscription.unsubscribe()
    }, [supabase, router])

    // Close menu when route changes
    useEffect(() => {
        setIsSearchMenuOpen(false)
        // Reset local filters on new navigation? maybe not, but close menu yes.
    }, [pathname, searchParams])

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        const params = new URLSearchParams()
        if (searchQuery.trim()) params.set('q', searchQuery)
        if (selectedBrand) params.set('brand', selectedBrand)
        if (selectedCategory) params.set('category', selectedCategory)

        if (params.toString() === '') {
            router.push('/?view=all')
        } else {
            router.push(`/?${params.toString()}`)
        }
        setIsSearchMenuOpen(false)
    }

    const handleSignIn = async () => {
        // Explicitly capture origin to ensure consistency
        const origin = window.location.origin

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        })
        if (error) {
            alert(`로그인 오류: ${error.message}`)
            console.error('Error logging in:', error.message)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setIsUserMenuOpen(false)
        router.refresh() // Switch to server state
    }

    const handleAdminClaim = async () => {
        const password = prompt("관리자 비밀번호를 입력하세요:")
        if (!password) return

        const { data, error } = await supabase.rpc('claim_admin', { password })

        if (error) {
            alert("오류가 발생했습니다: " + error.message)
        } else if (data === true) {
            alert("관리자 권한을 획득했습니다!")
            router.refresh() // Refresh to get updated claims
            setIsUserMenuOpen(false)
        } else {
            alert("비밀번호가 올바르지 않습니다.")
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-4 0-8 5-8 11 0 4.5 3.5 9 8 9s8-4.5 8-9c0-6-4-11-8-11z" /><path d="M12 22V13" /><path d="M12 22c-3 0-5.5-2-5.5-5.5" /><path d="M12 22c3 0 5.5-2 5.5-5.5" /></svg>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">Onion<span className="text-purple-600">Parts</span></span>
                </Link>

                {/* Search Bar */}
                {showSearchBar && (
                    <div className="hidden flex-1 items-center justify-center px-8 sm:flex relative">
                        <div className={cn(
                            "relative w-full max-w-xl transition-all duration-200 z-[70]",
                            isSearchMenuOpen ? "scale-105 transform" : ""
                        )}>
                            <input
                                type="text"
                                placeholder="필요한 부품을 검색해보세요..."
                                className={cn(
                                    "w-full rounded-full border bg-gray-100 py-2.5 pl-5 pr-12 text-sm text-gray-900 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-0",
                                    isSearchMenuOpen
                                        ? "bg-white border-purple-500 shadow-lg"
                                        : "border-gray-200 focus:bg-white focus:border-purple-500"
                                )}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchMenuOpen(true)}
                                onMouseDown={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 top-1/2 p-1.5 -translate-y-1/2 rounded-full text-gray-400 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Search Menu Overlay */}
                        {isSearchMenuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                                    onClick={() => setIsSearchMenuOpen(false)}
                                    aria-hidden="true"
                                />
                                <div className="absolute top-full left-0 right-0 mx-auto mt-4 w-full max-w-xl z-[70] rounded-2xl border border-gray-100 bg-white p-6 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                                    <SearchFilters
                                        brands={brands}
                                        categories={categories}
                                        selectedBrand={selectedBrand}
                                        selectedCategory={selectedCategory}
                                        onBrandChange={setSelectedBrand}
                                        onCategoryChange={setSelectedCategory}
                                    />
                                    <div className="mt-6 flex justify-end border-t border-gray-50 pt-4">
                                        <Button
                                            onClick={handleSearch}
                                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 font-medium shadow-lg shadow-purple-200 hover:shadow-purple-300 transition-all"
                                        >
                                            검색보기
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    <button className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100">
                        <ShoppingCart className="h-5 w-5" />
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3 relative">
                            {user.is_admin && (
                                <Link href="/product/new">
                                    <Button className="hidden sm:inline-flex bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all rounded-full px-5 h-9 text-sm">
                                        + 상품 등록
                                    </Button>
                                </Link>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 rounded-full border border-gray-100 bg-white p-1 pr-3 shadow-sm transition hover:shadow-md ring-1 ring-gray-100"
                                >
                                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-100">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="User" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                                                <User className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                    </span>
                                </button>

                                {isUserMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-30"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-gray-100 bg-white py-1 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {user.user_metadata?.full_name || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                {user.is_admin && (
                                                    <span className="mt-1 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                                        관리자 계정
                                                    </span>
                                                )}
                                            </div>

                                            <div className="py-1">
                                                {!user.is_admin && (
                                                    <button
                                                        onClick={handleAdminClaim}
                                                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                                                    >
                                                        👑 관리자 인증
                                                    </button>
                                                )}
                                                <Link href="/profile" className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    내 프로필
                                                </Link>
                                                <Link href="/my-orders" className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    주문 내역
                                                </Link>
                                                <Link href="/chats" className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    채팅 목록
                                                </Link>
                                            </div>

                                            <div className="border-t border-gray-50 py-1">
                                                <button
                                                    onClick={handleSignOut}
                                                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="mr-2 h-3.5 w-3.5" />
                                                    로그아웃
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Button
                            onClick={handleSignIn}
                            className="rounded-full bg-gray-900 px-6 font-medium text-white shadow-lg shadow-gray-200 transition-all hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5"
                        >
                            로그인
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
