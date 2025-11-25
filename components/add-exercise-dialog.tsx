'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { addExercise } from '@/app/exercises/actions'

type Exercise = {
    id: string
    name: string
    target_muscle: string
    type: string
    is_verified: boolean | null
}

export function AddExerciseDialog({
    onClose,
    onAdd,
    userId,
    initialName = '',
}: {
    onClose: () => void
    onAdd: (exercise: Exercise) => void
    userId: string
    initialName?: string
}) {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = await addExercise(formData)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else if (result.data) {
            onAdd(result.data)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Add New Exercise</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Name
                        </label>
                        <input
                            name="name"
                            defaultValue={initialName}
                            required
                            className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                            placeholder="e.g. Bulgarian Split Squat"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                                Target Muscle
                            </label>
                            <select
                                name="target_muscle"
                                required
                                className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                            >
                                <option value="Chest">Chest</option>
                                <option value="Back">Back</option>
                                <option value="Legs">Legs</option>
                                <option value="Shoulders">Shoulders</option>
                                <option value="Arms">Arms</option>
                                <option value="Core">Core</option>
                                <option value="Full Body">Full Body</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                                Type
                            </label>
                            <select
                                name="type"
                                required
                                className="w-full rounded-lg border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                            >
                                <option value="Strength">Strength</option>
                                <option value="Cardio">Cardio</option>
                                <option value="Flexibility">Flexibility</option>
                                <option value="Mindfulness">Mindfulness</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Adding...' : 'Add Exercise'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
