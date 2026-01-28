'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Image as ImageIcon, Loader2, X } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
    const router = useRouter()
    const supabase = createClient()

    // Form States
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')

    // Category & Brand States (Selection or Custom)
    const [categoryId, setCategoryId] = useState('')
    const [brandId, setBrandId] = useState('')
    const [isCustomCategory, setIsCustomCategory] = useState(false)
    const [isCustomBrand, setIsCustomBrand] = useState(false)
    const [customCategoryName, setCustomCategoryName] = useState('')
    const [customBrandName, setCustomBrandName] = useState('')

    const [year, setYear] = useState('')
    const [images, setImages] = useState<string[]>([])

    // Data States
    const [categories, setCategories] = useState<any[]>([])
    const [brands, setBrands] = useState<any[]>([])
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Check Admin & Fetch Data
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/')
                return
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single()

            if (!profile?.is_admin) {
                alert('관리자만 접근할 수 있습니다.')
                router.push('/')
                return
            }
            setIsAdmin(true)
        }

        const fetchData = async () => {
            const { data: catData } = await supabase.from('categories').select('*').order('name')
            const { data: brandData } = await supabase.from('brands').select('*').order('name')
            if (catData) setCategories(catData)
            if (brandData) setBrands(brandData)
        }

        checkAuth()
        fetchData()
    }, [router, supabase])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        const files = Array.from(e.target.files)
        const newImages: string[] = []

        for (const file of files) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `products/${fileName}`

            try {
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath)

                newImages.push(publicUrl)
            } catch (error: any) {
                alert(`이미지 업로드 실패: ${error.message}`)
            }
        }

        setImages(prev => [...prev, ...newImages])
        setUploading(false)
    }

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!title || !price) {
            alert('필수 정보를 입력해주세요.')
            return
        }
        if (!isCustomCategory && !categoryId) {
            alert('카테고리를 선택해주세요.')
            return
        }
        if (!isCustomBrand && !brandId) {
            alert('브랜드를 선택해주세요.')
            return
        }
        if (isCustomCategory && !customCategoryName.trim()) {
            alert('새 카테고리 이름을 입력해주세요.')
            return
        }
        if (isCustomBrand && !customBrandName.trim()) {
            alert('새 브랜드 이름을 입력해주세요.')
            return
        }

        console.log("Submitting product...")
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('로그인이 필요합니다.')

            // 1. Handle Custom Category
            let finalCategoryId = categoryId
            if (isCustomCategory) {
                console.log("Creating category:", customCategoryName)
                const { data: newCat, error: catError } = await supabase
                    .from('categories')
                    .insert({ name: customCategoryName })
                    .select()
                    .single()

                if (catError) {
                    console.error("Category Error:", catError)
                    throw new Error('카테고리 생성 실패: ' + catError.message + ' (권한 문제일 수 있습니다)')
                }
                finalCategoryId = newCat.id
            }

            // 2. Handle Custom Brand
            let finalBrandId = brandId
            if (isCustomBrand) {
                console.log("Creating brand:", customBrandName)
                const { data: newBrand, error: brandError } = await supabase
                    .from('brands')
                    .insert({ name: customBrandName })
                    .select()
                    .single()

                if (brandError) {
                    console.error("Brand Error:", brandError)
                    throw new Error('브랜드 생성 실패: ' + brandError.message + ' (권한 문제일 수 있습니다)')
                }
                finalBrandId = newBrand.id
            }

            const productData = {
                title,
                price: parseInt(price.replace(/[^0-9]/g, '')),
                description,
                category_id: parseInt(String(finalCategoryId)),
                brand_id: parseInt(String(finalBrandId)),
                year: year ? parseInt(year) : null,
                images,
                user_id: user.id,
                status: 'available'
            }

            console.log("Inserting product:", productData)
            const { error, data } = await supabase
                .from('products')
                .insert(productData)
                .select()
                .single()

            if (error) {
                console.error("Product Insert Error:", error)
                throw new Error('상품 등록 실패: ' + error.message)
            }

            console.log("Product created:", data)
            alert('상품이 성공적으로 등록되었습니다.')
            router.push(`/product/${data.id}`)

        } catch (error: any) {
            console.error("Submit Error:", error)
            alert(`오류가 발생했습니다: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    if (isAdmin === null) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-20 pt-8">
            <div className="mx-auto max-w-3xl px-4">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/" className="rounded-full bg-white p-2 text-gray-500 shadow-sm hover:bg-gray-100">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">상품 등록</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload Section */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-base font-semibold text-gray-900">상품 이미지 ({images.length}/10)</h2>
                        <div className="flex flex-wrap gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200">
                                    <img src={img} alt="Product" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
                                        className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-red-500 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading || images.length >= 10}
                                className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-purple-500 hover:text-purple-600 transition-all disabled:opacity-50"
                            >
                                {uploading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        <ImageIcon className="mb-1 h-6 w-6" />
                                        <span className="text-xs font-medium">이미지 추가</span>
                                    </>
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-base font-semibold text-gray-900">기본 정보</h2>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">제목 *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="예: 2018 그랜저 IG LED 헤드라이트 (좌측)"
                                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Category Selection */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">카테고리 *</label>
                                <select
                                    value={isCustomCategory ? 'custom' : categoryId}
                                    onChange={(e) => {
                                        if (e.target.value === 'custom') {
                                            setIsCustomCategory(true)
                                            setCategoryId('')
                                        } else {
                                            setIsCustomCategory(false)
                                            setCategoryId(e.target.value)
                                        }
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                >
                                    <option value="">선택하세요</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                    <option value="custom" className="font-bold text-purple-600">+ 직접 입력</option>
                                </select>
                                {isCustomCategory && (
                                    <input
                                        type="text"
                                        value={customCategoryName}
                                        onChange={(e) => setCustomCategoryName(e.target.value)}
                                        placeholder="새 카테고리 입력"
                                        className="mt-2 w-full rounded-md border border-purple-200 bg-purple-50 px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                                        autoFocus
                                    />
                                )}
                            </div>

                            {/* Brand Selection */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">브랜드 *</label>
                                <select
                                    value={isCustomBrand ? 'custom' : brandId}
                                    onChange={(e) => {
                                        if (e.target.value === 'custom') {
                                            setIsCustomBrand(true)
                                            setBrandId('')
                                        } else {
                                            setIsCustomBrand(false)
                                            setBrandId(e.target.value)
                                        }
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                >
                                    <option value="">선택하세요</option>
                                    {brands.map((brand) => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                    <option value="custom" className="font-bold text-purple-600">+ 직접 입력</option>
                                </select>
                                {isCustomBrand && (
                                    <input
                                        type="text"
                                        value={customBrandName}
                                        onChange={(e) => setCustomBrandName(e.target.value)}
                                        placeholder="새 브랜드 입력"
                                        className="mt-2 w-full rounded-md border border-purple-200 bg-purple-50 px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                                        autoFocus
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">가격 (원) *</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="예: 150000"
                                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">연식 (선택)</label>
                                <input
                                    type="string"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    placeholder="예: 2018"
                                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <label className="mb-1 block text-base font-semibold text-gray-900">상세 설명</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="h-40 w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-gray-400"
                            placeholder="상품의 상태, 특징, 하자 여부 등을 자세히 적어주세요."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Link href="/">
                            <Button type="button" variant="outline" className="px-6 text-gray-700">취소</Button>
                        </Link>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 px-8" disabled={loading || uploading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            등록완료
                        </Button>
                    </div>

                </form>
            </div>
        </main>
    )
}
