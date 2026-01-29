'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, User, Image as ImageIcon, LogOut, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Message = {
    id: string
    content: string
    sender_id: string
    created_at: string
    message_type?: 'text' | 'image'
    image_url?: string
}

type ChatInterfaceProps = {
    roomId: string
    initialMessages: Message[]
    currentUserId: string
    otherUserName: string
    productTitle: string
    productPrice: number
    productImage: string | null
    productId: string
}

export default function ChatInterface({
    roomId,
    initialMessages,
    currentUserId,
    otherUserName,
    productTitle,
    productPrice,
    productImage,
    productId,
}: ChatInterfaceProps) {
    const supabase = createClient()
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    // Image Upload State
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Smooth scroll only on NEW messages
    useEffect(() => {
        if (!isInitialLoad && messages.length > initialMessages.length) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isInitialLoad, initialMessages.length])

    // Mount effect
    useEffect(() => {
        setIsInitialLoad(false)
    }, [])

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages((prev) => {
                        // Prevent duplicates
                        if (prev.some(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId, supabase])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const content = newMessage.trim()
        setNewMessage('') // Optimistic clear

        const { data, error } = await supabase
            .from('messages')
            .insert({
                room_id: roomId,
                sender_id: currentUserId,
                content: content,
                message_type: 'text'
            })
            .select() // Fetch the inserted row immediately
            .single()

        if (data) {
            setMessages((prev) => {
                if (prev.some(m => m.id === data.id)) return prev
                return [...prev, data as Message]
            })
        }

        if (error) {
            console.error('Error sending message:', error)
            alert('메시지 전송 실패')
            setNewMessage(content) // Restore on error
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            alert("5MB 이하의 이미지만 업로드 가능합니다.")
            return
        }

        setIsUploading(true)
        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${roomId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('chat-images')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-images')
                .getPublicUrl(fileName)

            // 3. Send Message
            const { data, error: msgError } = await supabase
                .from('messages')
                .insert({
                    room_id: roomId,
                    sender_id: currentUserId,
                    content: '사진을 보냈습니다.',
                    message_type: 'image',
                    image_url: publicUrl
                })
                .select()
                .single()

            if (msgError) throw msgError

            if (data) {
                setMessages((prev) => {
                    if (prev.some(m => m.id === data.id)) return prev
                    return [...prev, data as Message]
                })
            }

        } catch (error: any) {
            console.error('Upload failed:', error)
            alert('이미지 업로드 실패: ' + (error.message || '알 수 없는 오류'))
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleLeaveRoom = async () => {
        if (!confirm("채팅방을 나가시겠습니까? 상대방도 나가면 대화 내용이 삭제됩니다.")) return

        // We use an RPC call for atomic 'leave' logic
        const { error } = await supabase.rpc('leave_chat_room', { room_id: roomId })

        if (error) {
            console.error(error)
            // Fallback if RPC not exists yet: Try to navigate away
            // But user expects deletion logic.
            alert("나가기 처리 중 오류가 발생했습니다. (잠시 후 다시 시도해주세요)")
        } else {
            router.push('/chats')
        }
    }

    // Format helpers
    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price)

    return (
        <div className="flex min-h-[calc(100vh-64px)] w-full items-start justify-center bg-[#FDF9F9] pt-4">
            <div className="flex h-[calc(100vh-100px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200">
                {/* Product Info Header */}
                <div className="flex items-center gap-4 bg-white px-5 py-3 shadow-sm border-b border-gray-100 z-10 transition-colors">
                    <Link href="/chats" className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100 border border-gray-100 shrink-0">
                        {productImage ? (
                            <img src={productImage} alt={productTitle} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-400">
                                <User className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="truncate text-sm font-bold text-gray-900">{productTitle}</h2>
                        <p className="text-xs font-bold text-purple-600">{formatPrice(productPrice)}</p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-3">
                        <div className="flex items-center justify-end gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-xs font-bold text-gray-600">{otherUserName}</p>
                        </div>
                        <button onClick={handleLeaveRoom} title="나가기" className="text-gray-400 hover:text-red-500 transition-colors">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-[#F2F3F5] p-4 space-y-4 scrollbar-hide relative">
                    {messages.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
                            <div className="mb-4 rounded-full bg-white p-4 shadow-sm opacity-80">
                                <Send className="h-8 w-8 text-purple-300 ml-1" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">대화를 시작해보세요!</p>
                            <p className="text-xs mt-1 text-gray-400">판매자에게 궁금한 점을 물어보세요.</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                >
                                    <div
                                        className={`max-w-[80%] px-4 py-2.5 shadow-sm text-sm leading-relaxed ${isMe
                                            ? 'rounded-2xl rounded-tr-none bg-purple-600 text-white'
                                            : 'rounded-2xl rounded-tl-none bg-white text-gray-800 border border-gray-50'
                                            }`}
                                    >
                                        {msg.message_type === 'image' && msg.image_url ? (
                                            <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                                                <img src={msg.image_url} alt="Sent" className="max-w-[200px] rounded-lg mb-1 object-cover hover:opacity-90 transition-opacity" />
                                            </a>
                                        ) : (
                                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                        )}
                                        <p
                                            className={`mt-1 text-[10px] text-right ${isMe ? 'text-purple-200' : 'text-gray-400'
                                                }`}
                                        >
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="bg-white p-3 border-t border-gray-100">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="flex gap-2 items-end">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center justify-center h-[44px] w-[44px] rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-purple-600 transition-all active:scale-95"
                        >
                            <ImageIcon className="h-5 w-5" />
                        </button>
                        <div className="relative flex-1">
                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage(e)
                                    }
                                }}
                                placeholder="메시지를 입력하세요... (Enter)"
                                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 min-h-[44px] max-h-[120px]"
                                rows={1}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || isUploading}
                            className="flex items-center justify-center h-[44px] w-[44px] rounded-xl bg-purple-600 text-white shadow-md transition-all hover:bg-purple-700 hover:shadow-lg disabled:bg-gray-200 disabled:shadow-none active:scale-95"
                        >
                            <Send className="h-5 w-5 ml-0.5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
