import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HomeSearch from '@/components/HomeSearch'

export const dynamic = 'force-dynamic'

export default async function Home(props: {
  searchParams: Promise<{ q?: string; brand?: string; category?: string; view?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // Check if any search is active (keyword, brand, category, or explicit view mode)
  const isSearchActive = searchParams.q || searchParams.brand || searchParams.category || searchParams.view === 'all'

  // Fetch Filters Logic (Brands/Categories) - Server Side
  const [brandsResult, categoriesResult] = await Promise.all([
    supabase.from('brands').select('id, name').order('name'),
    supabase.from('categories').select('id, name').order('name')
  ])

  const brands = brandsResult.data || []
  const categories = categoriesResult.data || []

  // Fallback data if DB is empty (Development convenience)
  const finalBrands = brands.length > 0 ? brands : [
    { id: '1', name: 'Hyundai' }, { id: '2', name: 'Kia' }, { id: '3', name: 'BMW' }
  ]
  const finalCategories = categories.length > 0 ? categories : [
    { id: '1', name: 'Engine' }, { id: '2', name: 'Transmission' }, { id: '3', name: 'Suspension' }
  ]

  // Build Query for Products
  let query = supabase
    .from('products')
    .select('*, brands(name), categories(name)')
    .order('created_at', { ascending: false })

  // Only apply filters if search is active
  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.brand) {
    query = query.eq('brand_id', searchParams.brand)
  }
  if (searchParams.category) {
    query = query.eq('category_id', searchParams.category)
  }

  let products = null
  if (isSearchActive) {
    const { data, error } = await query
    if (error) console.error('Error fetching products:', error)
    products = data
  }

  return (
    <main className="min-h-screen bg-[#FDF9F9]">

      {/* CASE 1: LANDING HERO (No Search Active) */}
      {!isSearchActive ? (
        <div className="flex flex-col items-center justify-center pt-32 pb-32 px-4 text-center">

          {/* Hero Text */}
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
            Onion<span className="text-purple-600">Parts</span>
          </h1>
          <p className="max-w-xl text-lg text-gray-600 mb-12">
            내 차에 딱 맞는 중고 부품을 찾아보세요.<br />
            믿을 수 있는 품질, 합리적인 가격.
          </p>

          {/* Central Search Component */}
          <HomeSearch brands={finalBrands} categories={finalCategories} />

          {/* Quick Categories */}
          <div className="space-y-4 mb-20">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">인기 카테고리</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['엔진', '브레이크', '헤드라이트', '사이드미러', '범퍼', '휠/타이어'].map((cat) => (
                <Link
                  key={cat}
                  href={`/?q=${cat}`}
                  className="rounded-full bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-0.5 hover:ring-purple-200 hover:text-purple-600"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* View All Button */}
          <div>
            <Link href="/?view=all">
              <Button size="lg" className="h-12 rounded-full px-8 text-base font-semibold bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:border-purple-200 shadow-sm transition-all group">
                전체 매물 조회하기
                <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Button>
            </Link>
          </div>

        </div>
      ) : (
        /* CASE 2: SEARCH RESULTS (Search Active) */
        <div className="mx-auto max-w-7xl px-4 py-8">
          <section className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {searchParams.view === 'all' ? '전체 매물' : (searchParams.q || (searchParams.brand ? '브랜드' : '카테고리') + ' 검색 결과')}
              </h1>
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                {products?.length || 0}
              </span>
            </div>
            {/* Back to Home if needed */}
            <Link href="/" className="text-sm text-gray-500 hover:text-purple-600">
              홈으로 가기
            </Link>
          </section>

          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Improved Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-20 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">검색 결과가 없습니다</h3>
              <p className="mt-2 max-w-sm text-sm text-gray-500">
                검색어를 변경하거나 필터를 초기화해보세요.<br />
                오타가 없는지 확인해 주세요.
              </p>
              <Link href="/" className="mt-6">
                <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
                  필터 초기화
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
