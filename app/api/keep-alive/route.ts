import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Simple query to "wake up" the database
        // We select 1 row from 'profiles' or just check health if possible.
        // Selecting count is lightweight.
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        if (error) {
            throw error
        }

        return NextResponse.json({
            status: 'alive',
            timestamp: new Date().toISOString(),
            db_response: 'ok'
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message
        }, { status: 500 })
    }
}
