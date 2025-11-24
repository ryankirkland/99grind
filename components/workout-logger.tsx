'use client'

import { useState } from 'react'
import { Plus, Save, Trash2, ChevronLeft, Search, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { saveWorkout } from '@/app/workouts/actions'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Exercise = {
    id: string
    name: string
    target_muscle: string
    type: string
}

type WorkoutSet = {
    id: string
    reps: number
    weight: number
    completed: boolean
}

type WorkoutExercise = {
    id: string // unique id for this instance in the workout
    exerciseId: string
    name: string
    sets: WorkoutSet[]
}

export function WorkoutLogger({
    exercises,
    userId,
}: {
    exercises: Exercise[]
    userId: string
}) {
    const router = useRouter()
    const [workoutName, setWorkoutName] = useState('')
    const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([])
    const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const filteredExercises = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    )

    const addExerciseToWorkout = (exercise: Exercise) => {
        const newExercise: WorkoutExercise = {
            id: crypto.randomUUID(),
            exerciseId: exercise.id,
            name: exercise.name,
            sets: [
                { id: crypto.randomUUID(), reps: 0, weight: 0, completed: false },
            ],
        }
        setActiveExercises([...activeExercises, newExercise])
        setIsExercisePickerOpen(false)
        setSearch('')
    }

    const addSet = (exerciseIndex: number) => {
        const updatedExercises = [...activeExercises]
        const previousSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1]
        updatedExercises[exerciseIndex].sets.push({
            id: crypto.randomUUID(),
            reps: previousSet ? previousSet.reps : 0,
            weight: previousSet ? previousSet.weight : 0,
            completed: false,
        })
        setActiveExercises(updatedExercises)
    }

    const updateSet = (
        exerciseIndex: number,
        setIndex: number,
        field: 'reps' | 'weight',
        value: number
    ) => {
        const updatedExercises = [...activeExercises]
        updatedExercises[exerciseIndex].sets[setIndex][field] = value
        setActiveExercises(updatedExercises)
    }

    const toggleSetCompletion = (exerciseIndex: number, setIndex: number) => {
        const updatedExercises = [...activeExercises]
        updatedExercises[exerciseIndex].sets[setIndex].completed = !updatedExercises[exerciseIndex].sets[setIndex].completed
        setActiveExercises(updatedExercises)
    }

    const removeSet = (exerciseIndex: number, setIndex: number) => {
        const updatedExercises = [...activeExercises]
        updatedExercises[exerciseIndex].sets.splice(setIndex, 1)
        setActiveExercises(updatedExercises)
    }

    const removeExercise = (index: number) => {
        const updatedExercises = [...activeExercises]
        updatedExercises.splice(index, 1)
        setActiveExercises(updatedExercises)
    }

    const handleFinishWorkout = async () => {
        if (activeExercises.length === 0) return
        setIsSaving(true)

        const workoutData = {
            name: workoutName || 'Untitled Workout',
            exercises: activeExercises.map((ex) => ({
                exercise_id: ex.exerciseId,
                sets: ex.sets.filter(s => s.completed).map((s) => ({
                    reps: s.reps,
                    weight: s.weight,
                })),
            })).filter(ex => ex.sets.length > 0),
        }

        await saveWorkout(workoutData)
        router.push('/')
    }

    if (isExercisePickerOpen) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsExercisePickerOpen(false)}
                        className="rounded-full bg-zinc-900 p-2 text-white hover:bg-zinc-800"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Select Exercise</h1>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="grid gap-2">
                    {filteredExercises.map((exercise) => (
                        <button
                            key={exercise.id}
                            onClick={() => addExerciseToWorkout(exercise)}
                            className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-left hover:border-emerald-500/50 hover:bg-zinc-900/50 transition-all"
                        >
                            <span className="font-medium text-white">{exercise.name}</span>
                            <span className="text-xs text-zinc-500">{exercise.target_muscle}</span>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                    <input
                        value={workoutName}
                        onChange={(e) => setWorkoutName(e.target.value)}
                        placeholder="Workout Name"
                        className="bg-transparent text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none"
                    />
                </div>
                <button
                    onClick={handleFinishWorkout}
                    disabled={isSaving || activeExercises.length === 0}
                    className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                >
                    <Save className="h-4 w-4" />
                    <span>{isSaving ? 'Saving...' : 'Finish'}</span>
                </button>
            </header>

            <div className="space-y-6">
                {activeExercises.map((exercise, exerciseIndex) => (
                    <div key={exercise.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">{exercise.name}</h3>
                            <button
                                onClick={() => removeExercise(exerciseIndex)}
                                className="text-zinc-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-10 gap-2 text-xs font-medium uppercase text-zinc-500 mb-2">
                                <div className="col-span-1 text-center">Set</div>
                                <div className="col-span-3 text-center">kg</div>
                                <div className="col-span-3 text-center">Reps</div>
                                <div className="col-span-3 text-center">Done</div>
                            </div>

                            {exercise.sets.map((set, setIndex) => (
                                <div key={set.id} className={cn(
                                    "grid grid-cols-10 gap-2 items-center",
                                    set.completed && "opacity-50"
                                )}>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400">
                                            {setIndex + 1}
                                        </span>
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            value={set.weight || ''}
                                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value))}
                                            className="w-full rounded-lg bg-black/50 px-2 py-2 text-center text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="number"
                                            value={set.reps || ''}
                                            onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseFloat(e.target.value))}
                                            className="w-full rounded-lg bg-black/50 px-2 py-2 text-center text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="col-span-3 flex justify-center gap-2">
                                        <button
                                            onClick={() => toggleSetCompletion(exerciseIndex, setIndex)}
                                            className={cn(
                                                "flex h-8 w-full items-center justify-center rounded-lg transition-colors",
                                                set.completed ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                            )}
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => addSet(exerciseIndex)}
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Add Set
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => setIsExercisePickerOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 py-6 text-emerald-500 hover:bg-zinc-900 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    <span className="font-semibold">Add Exercise</span>
                </button>
            </div>
        </div>
    )
}
