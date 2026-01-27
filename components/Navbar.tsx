'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button' // We'll create this next or use standard HTML
import { Search, Menu, User, LogOut } from 'lucide-react'

export default function Navbar() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        // Check active session
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user || null)
        }
        getUser()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold text-orange-600">CarrotParts</span>
                </Link>

                {/* Search Bar (Desktop) - Hidden on mobile for now or collapsed */}
                <form onSubmit={handleSearch} className="hidden flex-1 mx-8 sm:block">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search parts, brands..."
                            className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-4 pr-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </form>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Mobile Search Icon (To toggle search bar - simplification for now) */}
                    <button className="sm:hidden p-2 text-gray-600">
                        <Search className="h-5 w-5" />
                    </button>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="Avatar"
                                            className="h-8 w-8 rounded-full border border-gray-200"
                                        />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={handleGoogleLogin}
                            className="bg-gray-900 text-white hover:bg-gray-800"
                        >
                            Sign In
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}
