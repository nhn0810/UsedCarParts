import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ClientProductDetailContent from '@/components/ClientProductDetailContent'

// Force dynamic rendering since we don't have static params generation yet
export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch product details with related brand and category
    const { data: product, error } = await supabase
        .from('products')
        .select(`
      *,
      brands (name),
      categories (name)
    `)
        .eq('id', id)
        .single()

    if (error) {
        console.error("Error fetching product details:", error)
    }

    if (error || !product) {
        notFound()
    }

    // Fetch Related Products (Priority: Same Category -> Fallback: Latest Items)
    let { data: relatedProducts } = await supabase
        .from('products')
        .select('*, brands(name), categories(name)')
        .eq('category_id', product.category_id)
        .neq('id', id) // Exclude current product
        .limit(4)

    // Step 2: If no related products loaded (or less than 4), load latest items instead.
    if (!relatedProducts || relatedProducts.length === 0) {
        const { data: latestProducts } = await supabase
            .from('products')
            .select('*, brands(name), categories(name)')
            .neq('id', id)
            .order('created_at', { ascending: false })
            .limit(4)

        relatedProducts = latestProducts || []
    }

    return <ClientProductDetailContent product={product} relatedProducts={relatedProducts || []} />
}
