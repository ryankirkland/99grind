import { createClient } from '@/utils/supabase/server'

export default async function DebugPage() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    let templates = null
    let templateError = null

    if (user) {
        const result = await supabase
            .from('workout_templates')
            .select('*')
        templates = result.data
        templateError = result.error
    }

    return (
        <div className="p-8 text-white bg-black min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Debug Info</h1>

            <div className="space-y-4">
                <div className="p-4 border border-zinc-800 rounded">
                    <h2 className="font-bold text-emerald-500">Auth Status</h2>
                    <pre>{JSON.stringify({ user: user?.id, authError }, null, 2)}</pre>
                </div>

                <div className="p-4 border border-zinc-800 rounded">
                    <h2 className="font-bold text-emerald-500">Templates Query</h2>
                    <pre>{JSON.stringify({ templates, templateError }, null, 2)}</pre>
                </div>
            </div>
        </div>
    )
}
