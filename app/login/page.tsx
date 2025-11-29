import Image from 'next/image'
import { login, signup } from '@/app/auth/actions'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string }
}) {
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
                    <div className="space-y-2">
                        <label
                            className="text-xs font-medium uppercase tracking-wider text-zinc-500 group-focus-within:text-emerald-400 transition-colors"
                            htmlFor="username"
                        >
                            Username
                        </label>
                        <input
                            className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                            name="username"
                            placeholder="warrior99"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            className="text-xs font-medium uppercase tracking-wider text-zinc-500 group-focus-within:text-emerald-400 transition-colors"
                            htmlFor="email"
                        >
                            Email (Signup only)
                        </label>
                        <input
                            className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                            name="email"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            className="text-xs font-medium uppercase tracking-wider text-zinc-500 group-focus-within:text-emerald-400 transition-colors"
                            htmlFor="password"
                        >
                            Password
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
                            formAction={login}
                            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            formAction={signup}
                            className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-900 transition-colors"
                        >
                            Sign Up
                        </button>
                    </div>

                    {searchParams?.message && (
                        <p className="mt-4 text-center text-sm text-red-400">
                            {searchParams.message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
