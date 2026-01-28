'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle, Heart, Share2, X, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

// Client Component to handle Image Gallery Logic and Lightbox
function ImageGallery({ images, title }: { images: string[], title: string }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    // Handle initial selection if needed
    const mainImage = images && images.length > 0 ? images[selectedImageIndex] : null

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return
            if (e.key === 'Escape') setIsLightboxOpen(false)
            if (e.key === 'ArrowLeft') navigateImage('prev')
            if (e.key === 'ArrowRight') navigateImage('next')
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isLightboxOpen, selectedImageIndex])

    const navigateImage = (direction: 'prev' | 'next') => {
        if (!images || images.length === 0) return
        if (direction === 'prev') {
            setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
        } else {
            setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
        }
    }

    return (
        <>
            <div className="space-y-4">
                {/* Main Image Stage */}
                <div
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-100 shadow-sm cursor-pointer group"
                    onClick={() => setIsLightboxOpen(true)}
                >
                    {mainImage ? (
                        <>
                            <img
                                src={mainImage}
                                alt={title}
                                className="h-full w-full object-contain bg-gray-50 transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                                    크게 보기
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200">
                            <span className="text-gray-400">이미지 없음</span>
                        </div>
                    )}
                </div>

                {/* Thumbnails Row */}
                {images && images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedImageIndex(idx)}
                                className={cn(
                                    "relative aspect-square h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                                    selectedImageIndex === idx
                                        ? "border-purple-600 ring-2 ring-purple-100"
                                        : "border-gray-200 hover:border-purple-300 opacity-70 hover:opacity-100"
                                )}
                            >
                                <img src={img} alt={`View ${idx + 1}`} className="h-full w-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && images && images.length > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[110]"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    {/* Left Arrow */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                        className="absolute left-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[110]"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>

                    {/* Main Lightbox Image */}
                    <div className="relative w-full h-full max-w-7xl max-h-screen p-4 flex items-center justify-center">
                        <img
                            src={images[selectedImageIndex]}
                            alt={title}
                            className="max-w-full max-h-full object-contain shadow-2xl"
                        />
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                        className="absolute right-4 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-[110]"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                </div>
            )}
        </>
    )
}

export default function ClientProductDetailContent({ product, relatedProducts }: { product: any, relatedProducts: any[] }) {
    // Format helpers
    const formatPrice = (price: number) =>
        new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price || 0)

    const createdDate = new Date(product.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric'
    })

    const formattedPrice = formatPrice(product.price)

    return (
        <main className="min-h-screen bg-[#FDF9F9] pb-20">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        목록으로 돌아가기
                    </Link>
                </div>

                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Mobile Header */}
                        <div className="lg:hidden">
                            <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                            <div className="mt-2 text-xl font-bold text-purple-600">{formattedPrice}</div>
                        </div>

                        {/* Interactive Image Gallery */}
                        <ImageGallery images={product.images || []} title={product.title} />

                        {/* Description */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-gray-900 border-b pb-2">상품 설명</h3>
                            <div className="prose prose-purple max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                                {product.description || "설명 없음"}
                            </div>
                        </div>

                        {/* Details Table */}
                        <div className="rounded-xl bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-gray-900 border-b pb-2">상세 정보</h3>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                    <dt className="text-sm font-medium text-gray-500">브랜드</dt>
                                    <dd className="text-sm font-medium text-gray-900 text-right">{product.brands?.name || '정보 없음'}</dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                    <dt className="text-sm font-medium text-gray-500">카테고리</dt>
                                    <dd className="text-sm font-medium text-gray-900 text-right">{product.categories?.name || '기타'}</dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                    <dt className="text-sm font-medium text-gray-500">연식</dt>
                                    <dd className="text-sm font-medium text-gray-900 text-right">{product.year || '-'}</dd>
                                </div>
                                <div className="flex justify-between border-b border-gray-100 pb-1">
                                    <dt className="text-sm font-medium text-gray-500">등록일</dt>
                                    <dd className="text-sm font-medium text-gray-900 text-right">{createdDate}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Right Sticky Sidebar */}
                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-24 space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-100/50">
                            <div>
                                <div className="mb-3 flex flex-wrap gap-2">
                                    {product.brands?.name && (
                                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 uppercase tracking-wide">
                                            {product.brands.name}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 uppercase tracking-wide">
                                        {product.status || '판매중'}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.title}</h1>
                            </div>

                            <div className="border-t border-b border-gray-100 py-4">
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">총 결제 금액</p>
                                <div className="text-3xl font-extrabold text-purple-600">{formattedPrice}</div>
                            </div>

                            <div className="space-y-3">
                                <Button size="lg" className="w-full bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200 text-base font-semibold h-12">
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    판매자와 채팅하기
                                </Button>
                                <div className="flex gap-2">
                                    <Button size="lg" variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-12">
                                        <Heart className="mr-2 h-5 w-5" />
                                        찜하기
                                    </Button>
                                    <Button size="lg" variant="outline" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-12">
                                        <Share2 className="mr-2 h-5 w-5" />
                                        공유
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-top lg:hidden">
                <div className="flex items-center gap-3 max-w-7xl mx-auto">
                    <div className="flex-1">
                        <span className="text-xs text-gray-500 block">총 금액</span>
                        <span className="text-xl font-bold text-purple-600">{formattedPrice}</span>
                    </div>
                    <Button className="bg-purple-600 text-white shadow-sm flex-1">채팅하기</Button>
                </div>
            </div>

            {/* Related Products */}
            <div className="mx-auto max-w-7xl px-4 mt-8 pb-12 border-t border-gray-100 pt-16">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">관련 상품</h2>
                {relatedProducts && relatedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {relatedProducts.map((item) => (
                            <Link key={item.id} href={`/product/${item.id}`} className="group block rounded-xl bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md ring-1 ring-gray-100">
                                <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
                                    {item.images && item.images.length > 0 ? (
                                        <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gray-200" />
                                    )}
                                </div>
                                <div>
                                    <div className="mb-1 text-xs text-gray-500">{item.categories?.name}</div>
                                    <h3 className="truncate text-sm font-medium text-gray-900">{item.title}</h3>
                                    <div className="mt-2 font-bold text-purple-600">{formatPrice(item.price)}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-500">관련 상품이 없습니다.</div>
                )}
            </div>

        </main>
    )
}
