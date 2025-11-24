'use client'

import { useState } from 'react'
import { Search, Plus, Dumbbell, Activity } from 'lucide-react'
import { AddExerciseDialog } from '@/components/add-exercise-dialog'
import { cn } from '@/lib/utils'

type Exercise = {
    id: string
    name: string
    target_muscle: string
    type: string
    is_verified: boolean | null
}

export function ExerciseList({
    initialExercises,
    userId,
}: {
    initialExercises: Exercise[]
    userId: string
}) {
    const [exercises, setExercises] = useState(initialExercises)
    const [search, setSearch] = useState('')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

    const filteredExercises = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleAddExercise = (newExercise: Exercise) => {
        setExercises([...exercises, newExercise].sort((a, b) => a.name.localeCompare(b.name)))
        setIsAddDialogOpen(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                        placeholder="Search exercises..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add New</span>
                </button>
            </div>

            <div className="grid gap-3">
                {filteredExercises.map((exercise) => (
                    <div
                        key={exercise.id}
                        className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                exercise.type === 'Strength' ? "bg-emerald-500/10 text-emerald-500" : "bg-cyan-500/10 text-cyan-500"
                            )}>
                                {exercise.type === 'Strength' ? (
                                    <Dumbbell className="h-5 w-5" />
                                ) : (
                                    <Activity className="h-5 w-5" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-white">{exercise.name}</h3>
                                <p className="text-xs text-zinc-500">{exercise.target_muscle}</p>
                            </div>
                        </div>
                        {exercise.is_verified && (
                            <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] font-medium text-zinc-400">
                                Verified
                            </span>
                        )}
                    </div>
                ))}

                {filteredExercises.length === 0 && (
                    <div className="py-12 text-center">
                        <p className="text-zinc-500">No exercises found.</p>
                        <button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="mt-2 text-sm text-emerald-500 hover:underline"
                        >
                            Create "{search}"?
                        </button>
                    </div>
                )}
            </div>

            {isAddDialogOpen && (
                <AddExerciseDialog
                    onClose={() => setIsAddDialogOpen(false)}
                    onAdd={handleAddExercise}
                    userId={userId}
                    initialName={search}
                />
            )}
        </div>
    )
}
