import Image from 'next/image'
import { updatePassword } from '@/app/auth/actions'

export default async function UpdatePasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const params = await searchParams
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white selection:bg-emerald-500/30">
            <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
                <div className="flex justify-center mb-8">
                    <div className="relative h-16 w-64">
                        <Image
                            src="/99grindlogo.png"
                            alt="99Grind Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <form className="group relative z-0 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl transition-all hover:border-zinc-700">
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-bold text-white">Set New Password</h2>
                        <p className="text-sm text-zinc-400 mt-1">Enter your new password below</p>
                    </div>

                    <div className="space-y-2">
                        <label
                            className="text-xs font-medium uppercase tracking-wider text-zinc-500 group-focus-within:text-emerald-400 transition-colors"
                            htmlFor="password"
                        >
                            New Password
                        </label>
                        <input
                            className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            formAction={updatePassword}
                            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
                        >
                            Update Password
                        </button>
                    </div>

                    {params?.message && (
                        <p className="mt-4 text-center text-sm text-red-400">
                            {params.message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
