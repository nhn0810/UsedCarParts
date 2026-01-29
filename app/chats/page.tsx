'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ChatListPage() {
    const supabase = createClient()
    const router = useRouter()
    const [rooms, setRooms] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchChats = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.replace('/login')
                return
            }

            // Fetch rooms where active (not left)
            // Left logic (buyer_left / seller_left) needs to be checked.
            // But complex filtering might be easier in JS for now or with a smart view.
            // Let's fetch all and filter in JS or add basic filters.

            const { data, error } = await supabase
                .from('chat_rooms')
                .select(`
                    id,
                    buyer_id,
                    seller_id,
                    buyer_left,
                    seller_left,
                    products (
                        id,
                        title,
                        images,
                        price
                    )
                `)
                .order('created_at', { ascending: false })

            if (data) {
                // Filter out rooms I left
                const activeRooms = data.filter(room => {
                    if (room.buyer_id === user.id) return !room.buyer_left
                    if (room.seller_id === user.id) return !room.seller_left
                    return false
                })
                setRooms(activeRooms)
            }
            setLoading(false)
        }

        fetchChats()
    }, [router, supabase])

    if (loading) return <div className="text-center py-20">Loading...</div>

    return (
        <div className="max-w-3xl mx-auto p-4 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">채팅 목록</h1>
            <div className="space-y-4">
                {rooms.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                        <p className="text-gray-500">참여 중인 채팅방이 없습니다.</p>
                    </div>
                ) : (
                    rooms.map((room) => {
                        const product = room.products
                        const image = product?.images?.[0] || null
                        return (
                            <Link href={`/chat/${room.id}`} key={room.id} className="block">
                                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
                                    <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        {image && <img src={image} alt={product.title} className="h-full w-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                                        <p className="text-sm font-bold text-purple-600">
                                            {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(product.price)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}
