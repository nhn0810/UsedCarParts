import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'

// Force dynamic because we check auth and fetch fresh data
export const dynamic = 'force-dynamic'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Chat Room with Product Details via join
    // Note: Supabase complex joins can be tricky. We'll fetch room first, then product details if needed.
    // Actually, we can select related data.
    const { data: room, error } = await supabase
        .from('chat_rooms')
        .select(`
            *,
            products (
                id,
                title,
                price,
                images
            )
        `)
        .eq('id', id)
        .single()

    if (error || !room) {
        console.error("Chat Room Error:", error)
        notFound()
    }

    // Verify User Participation
    if (room.buyer_id !== user.id && room.seller_id !== user.id) {
        notFound() // Or Forbidden
    }

    // Determine Other User ID
    const otherUserId = user.id === room.buyer_id ? room.seller_id : room.buyer_id

    // Fetch Other User Name (from Profiles)
    const { data: otherUserProfile } = await supabase
        .from('profiles')
        .select('username') // Assuming 'username' or 'full_name' field exists
        .eq('id', otherUserId)
        .single()

    // Fallback name if profile fetch fails or empty
    // Actually username in profile creation might be null, let's check auth metadata if possible? 
    // We can't access auth.users directly. We rely on profiles.
    const otherUserName = otherUserProfile?.username || "알 수 없는 사용자"

    // Fetch Messages
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', id)
        .order('created_at', { ascending: true })

    // Prepare Product Image
    const product = room.products
    const productImage = (product?.images && product.images.length > 0) ? product.images[0] : null

    return (
        <ChatInterface
            roomId={id}
            initialMessages={messages || []}
            currentUserId={user.id}
            otherUserName={otherUserName}
            productTitle={product?.title || "알 수 없는 상품"}
            productPrice={product?.price || 0}
            productImage={productImage}
            productId={product?.id}
        />
    )
}
