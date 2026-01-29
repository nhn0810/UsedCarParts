'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function DebugPage() {
    const supabase = createClient()
    const [session, setSession] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [envCheck, setEnvCheck] = useState<any>({})
    const [dataCheck, setDataCheck] = useState<any>({})
    const [cookieInfo, setCookieInfo] = useState<string>('')

    useEffect(() => {
        const runDiagnostics = async () => {
            setLoading(true)
            const results: any = {}

            // 1. Env Check
            results.env = {
                url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Defined' : 'Missing',
                key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Defined' : 'Missing',
            }
            setEnvCheck(results.env)
            setCookieInfo(document.cookie)

            // 2. Auth Check
            const { data: { session }, error: authError } = await supabase.auth.getSession()
            setSession(session)
            results.authError = authError ? authError.message : 'None'

            // 3. Data Access Check (Categories)
            const { data: categories, error: catError } = await supabase.from('categories').select('*').limit(5)
            results.categories = {
                success: !catError,
                count: categories?.length || 0,
                error: catError?.message || null
            }

            // 4. Data Access Check (Products)
            const { data: products, error: prodError } = await supabase.from('products').select('*').limit(1)
            results.products = {
                success: !prodError,
                count: products?.length || 0,
                error: prodError?.message || null
            }

            setDataCheck(results)
            setLoading(false)
        }

        runDiagnostics()
    }, [])

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold mb-4">System Diagnostics</h1>

            {/* Environment */}
            <section className="p-4 border rounded bg-gray-50">
                <h2 className="font-bold mb-2">1. Environment Variables</h2>
                <pre className="text-sm">{JSON.stringify(envCheck, null, 2)}</pre>
                <div className="mt-2 text-xs text-gray-500 break-all">
                    Cookies: {cookieInfo || 'None'}
                </div>
            </section>

            {/* Auth State */}
            <section className="p-4 border rounded bg-gray-50">
                <h2 className="font-bold mb-2">2. Authentication State</h2>
                {loading ? <p>Checking...</p> : (
                    <div>
                        <p><strong>Is Logged In:</strong> {session ? '✅ YES' : '❌ NO'}</p>
                        <p><strong>User Email:</strong> {session?.user?.email || 'N/A'}</p>
                        <p><strong>User ID:</strong> {session?.user?.id || 'N/A'}</p>
                        <p><strong>Auth Error:</strong> {dataCheck.authError}</p>
                        {session && (
                            <details className="mt-2">
                                <summary className="cursor-pointer text-blue-500">View Session Details</summary>
                                <pre className="text-xs mt-2 overflow-auto bg-white p-2 border">
                                    {JSON.stringify(session, null, 2)}
                                </pre>
                            </details>
                        )}
                    </div>
                )}
            </section>

            {/* Database Access */}
            <section className="p-4 border rounded bg-gray-50">
                <h2 className="font-bold mb-2">3. Database Connectivity (RLS Check)</h2>
                {loading ? <p>Checking...</p> : (
                    <div className="space-y-4">
                        <div className={dataCheck.categories?.success ? 'text-green-600' : 'text-red-600'}>
                            <strong>Categories Table:</strong> {dataCheck.categories?.success ? '✅ Accessible' : '❌ Failed'}
                            <br />
                            <span className="text-sm text-gray-600">
                                Count: {dataCheck.categories?.count} | Error: {dataCheck.categories?.error || 'None'}
                            </span>
                        </div>
                        <div className={dataCheck.products?.success ? 'text-green-600' : 'text-red-600'}>
                            <strong>Products Table:</strong> {dataCheck.products?.success ? '✅ Accessible' : '❌ Failed'}
                            <br />
                            <span className="text-sm text-gray-600">
                                Count: {dataCheck.products?.count} | Error: {dataCheck.products?.error || 'None'}
                            </span>
                        </div>
                    </div>
                )}
            </section>

            <section className="p-4 border rounded bg-blue-50">
                <h2 className="font-bold mb-2">Troubleshooting Actions</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Refresh Page
                    </button>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            window.location.reload()
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Force Sign Out
                    </button>
                    <button
                        onClick={() => window.location.href = '/auth/login'} // Assuming this route or similar exists, or redirect to initiate login
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Go to Login
                    </button>
                </div>
            </section>
        </div>
    )
}
