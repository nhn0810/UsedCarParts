import { createClient } from "@/lib/supabase/server"
import NavbarClient from "./NavbarClient"

export default async function Navbar() {
    const supabase = await createClient()

    // 1. Get User Session
    const { data: { session } } = await supabase.auth.getSession()
    let user = session?.user || null

    // 2. If user exists, check Admin status
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (profile) {
            user = { ...user, is_admin: profile.is_admin }
        }
    }

    // 3. Fetch Filter Data (Server-side = Fast & Secure)
    // We use Promise.all to fetch brands and categories in parallel
    const [brandsResult, categoriesResult] = await Promise.all([
        supabase.from('brands').select('id, name').order('name'),
        supabase.from('categories').select('id, name').order('name')
    ])

    const brands = brandsResult.data || []
    const categories = categoriesResult.data || []

    // 4. Fallback data if DB is empty (Development convenience)
    const finalBrands = brands.length > 0 ? brands : [
        { id: '1', name: 'Hyundai' }, { id: '2', name: 'Kia' }, { id: '3', name: 'BMW' }
    ]
    const finalCategories = categories.length > 0 ? categories : [
        { id: '1', name: 'Engine' }, { id: '2', name: 'Transmission' }, { id: '3', name: 'Suspension' }
    ]

    return (
        <NavbarClient
            initialUser={user}
            brands={finalBrands}
            categories={finalCategories}
        />
    )
}
