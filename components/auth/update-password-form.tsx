'use client'

import { updatePassword } from '@/app/auth/actions'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function UpdatePasswordForm({ message }: { message?: string }) {
    const [error, setError] = useState<string | null>(message || null)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (formData: FormData) => {
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setError(null)
        await updatePassword(formData)
    }

    return (
        <form action={handleSubmit} className="group relative z-0 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 backdrop-blur-xl transition-all hover:border-zinc-700">
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
                <div className="relative">
                    <input
                        className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all pr-10"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label
                    className="text-xs font-medium uppercase tracking-wider text-zinc-500 group-focus-within:text-emerald-400 transition-colors"
                    htmlFor="confirmPassword"
                >
                    Confirm Password
                </label>
                <input
                    className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                />
            </div>

            <div className="flex flex-col gap-3 pt-4">
                <button
                    type="submit"
                    className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
                >
                    Update Password
                </button>
            </div>

            {error && (
                <p className="mt-4 text-center text-sm text-red-400">
                    {error}
                </p>
            )}
        </form>
    )
}
