import { createClient } from '@/utils/supabase/server'
import { Avatar } from '@/components/avatar'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { updateProfile } from '@/app/profile/actions'
import { cn } from '@/lib/utils'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const stats = (profile?.stats as Record<string, number>) || {}

    return (
        <div className="min-h-screen bg-black p-4 pb-20 sm:p-8">
            <div className="mx-auto max-w-2xl space-y-8">
                <header className="flex items-center gap-4">
                    <Link href="/" className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tighter text-white">
                        Your Avatar
                    </h1>
                </header>

                <div className="flex flex-col items-center gap-8 rounded-3xl bg-zinc-900/30 p-8 border border-zinc-800">
                    <div className="relative h-64 w-64">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                        <Avatar stats={stats} level={profile?.level || 1} className="relative z-10 h-full w-full" />
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">{profile?.username}</h2>
                        <p className="text-emerald-400 font-medium">Level {profile?.level || 1}</p>
                        <p className="text-zinc-500 text-sm mt-1">{profile?.current_xp || 0} XP</p>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key} className="rounded-xl bg-black/50 p-4 text-center border border-zinc-800">
                                <p className="text-xs font-medium uppercase text-zinc-500 mb-1">{key}</p>
                                <p className="text-xl font-bold text-white">{value}</p>
                            </div>
                        ))}
                        {Object.keys(stats).length === 0 && (
                            <div className="col-span-full text-center text-zinc-500 text-sm">
                                Complete workouts to earn stats!
                            </div>
                        )}
                    </div>

                    <form action={updateProfile} className="w-full rounded-xl bg-zinc-900/50 p-4 border border-zinc-800">
                        <h3 className="text-sm font-medium text-white mb-4">Settings</h3>
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-zinc-400">Weight Unit</label>
                            <div className="flex items-center gap-2 rounded-lg bg-black p-1">
                                <button
                                    name="weight_unit"
                                    value="kg"
                                    className={cn(
                                        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                                        profile?.weight_unit === 'kg' || !profile?.weight_unit ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    KG
                                </button>
                                <button
                                    name="weight_unit"
                                    value="lbs"
                                    className={cn(
                                        "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                                        profile?.weight_unit === 'lbs' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    LBS
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
