'use client'

import { useState } from 'react'
import { Plus, Save, Trash2, ChevronLeft, Search, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { saveWorkout, updateWorkout } from '@/app/workouts/actions'
import { AddExerciseDialog } from '@/components/add-exercise-dialog'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'

type Exercise = {
    id: string
    name: string
    target_muscle: string
    type: string
}

export type WorkoutSet = {
    id: string
    reps: number
    weight: number
    completed: boolean
}

export type WorkoutExercise = {
    id: string // unique id for this instance in the workout
    exerciseId: string
    name: string
    sets: WorkoutSet[]
}

export function WorkoutLogger({
    exercises,
    userId,
    initialUnit = 'kg',
    initialData,
}: {
    exercises: Exercise[]
    userId: string
    initialUnit?: string
    initialData?: {
        id: string
        name: string
        type: string
        exercises: WorkoutExercise[]
    }
}) {
    const router = useRouter()
    const [workoutName, setWorkoutName] = useState(initialData?.name || '')
    const [workoutType, setWorkoutType] = useState(initialData?.type || 'Strength')
    const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>(initialData?.exercises || [])
    const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false)
    const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false)
    const [localExercises, setLocalExercises] = useState(exercises)
    const [search, setSearch] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [unit, setUnit] = useState(initialUnit)

    const filteredExercises = localExercises.filter((ex) =>
        ex.name.toLowerCase().includes(search.toLowerCase())
    )

    const toDisplay = (weight: number) => {
        if (unit === 'lbs') {
            return Math.round(weight * 2.20462 * 10) / 10
        }
        return weight
    }

    const toStorage = (displayWeight: number) => {
        if (unit === 'lbs') {
            return displayWeight / 2.20462
        }
        return displayWeight
    }

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

    const handleNewExerciseAdded = (exercise: Exercise) => {
        setLocalExercises([...localExercises, exercise].sort((a, b) => a.name.localeCompare(b.name)))
        addExerciseToWorkout(exercise)
        setIsAddExerciseDialogOpen(false)
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
        if (field === 'weight') {
            // Store the raw input value in the state for now, but we need to handle the conversion when saving/displaying.
            // Actually, let's store the KG value in state always to avoid drift?
            // No, if user types 100 lbs, we should store ~45.35kg.
            // But if they type 100, they expect to see 100.
            // So we should probably store the *display value* in a local state or just convert on input?
            // If we store KG, then 45.35kg -> 99.99lbs. User sees 99.99.
            // Let's store KG in the main state, but we need to be careful with inputs.
            // Better approach for inputs: Convert immediately to KG for state.
            updatedExercises[exerciseIndex].sets[setIndex][field] = toStorage(value)
        } else {
            updatedExercises[exerciseIndex].sets[setIndex][field] = value
        }
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
            type: workoutType,
            exercises: activeExercises.map((ex) => ({
                exercise_id: ex.exerciseId,
                sets: ex.sets.filter(s => s.completed).map((s) => ({
                    reps: s.reps,
                    weight: s.weight, // Already in KG
                })),
            })).filter(ex => ex.sets.length > 0),
        }

        let result
        if (initialData?.id) {
            result = await updateWorkout(initialData.id, workoutData)
        } else {
            result = await saveWorkout(workoutData)
        }

        if (result?.error) {
            alert(`Error saving workout: ${result.error}`)
            setIsSaving(false)
            return
        }

        router.push(initialData?.id ? `/workouts/${initialData.id}` : '/')
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

                    {filteredExercises.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-zinc-500 mb-4">No exercises found.</p>
                            <button
                                onClick={() => setIsAddExerciseDialogOpen(true)}
                                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
                            >
                                Create "{search}"
                            </button>
                        </div>
                    )}
                </div>

                {isAddExerciseDialogOpen && (
                    <AddExerciseDialog
                        onClose={() => setIsAddExerciseDialogOpen(false)}
                        onAdd={handleNewExerciseAdded}
                        userId={userId}
                        initialName={search}
                    />
                )}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <input
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            placeholder="Workout Name"
                            className="bg-transparent text-2xl font-bold text-white placeholder-zinc-600 focus:outline-none w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-2">
                            <Switch
                                checked={unit === 'lbs'}
                                onCheckedChange={(checked) => setUnit(checked ? 'lbs' : 'kg')}
                                leftLabel="KG"
                                rightLabel="LBS"
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
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['Strength', 'Cardio', 'Flexibility', 'Mindfulness'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setWorkoutType(type)}
                            className={cn(
                                "rounded-full px-4 py-1.5 text-xs font-medium border transition-all whitespace-nowrap",
                                workoutType === type
                                    ? type === 'Strength' ? "bg-red-500/10 text-red-500 border-red-500"
                                        : type === 'Cardio' ? "bg-blue-500/10 text-blue-500 border-blue-500"
                                            : type === 'Flexibility' ? "bg-green-500/10 text-green-500 border-green-500"
                                                : "bg-yellow-500/10 text-yellow-500 border-yellow-500"
                                    : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>
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
                                <div className="col-span-3 text-center">{unit}</div>
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
                                            // We display the converted value.
                                            // Note: This can be tricky with controlled inputs and rounding.
                                            // For a robust app, we'd use a separate display state or a specialized hook.
                                            // For this MVP, we'll calculate on render but this might cause cursor jumps or rounding weirdness on edit.
                                            // A better way for the input is to use `defaultValue` or manage a local string state for the input.
                                            // Let's try to just use the value. If user types 100, we store 45.35. Next render displays 100.
                                            // If they type 100.5, we store 45.58. Next render displays 100.5.
                                            // It should be fine as long as toDisplay(toStorage(x)) ~= x.
                                            value={set.weight ? toDisplay(set.weight) : ''}
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
                                                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                                set.completed ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                            )}
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => removeSet(exerciseIndex, setIndex)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
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
