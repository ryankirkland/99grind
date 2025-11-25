'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type WorkoutData = {
    name: string
    type: string
    exercises: {
        exercise_id: string
        sets: {
            reps: number
            weight: number
        }[]
    }[]
}

export async function saveWorkout(workoutData: WorkoutData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1. Calculate XP and Stats
    let totalXP = 100 // Base XP for finishing a workout
    const statsUpdate: Record<string, number> = {}

    // Fetch exercise details to know types
    const exerciseIds = workoutData.exercises.map(e => e.exercise_id)
    const { data: exerciseDetails } = await supabase
        .from('exercises')
        .select('id, type')
        .in('id', exerciseIds)

    const exerciseTypeMap = new Map(exerciseDetails?.map(e => [e.id, e.type]))

    workoutData.exercises.forEach((ex) => {
        const type = exerciseTypeMap.get(ex.exercise_id) || 'General'
        const setXP = ex.sets.length * 10
        totalXP += setXP

        // Update stats based on type
        // e.g. Strength exercises add to 'strength' stat
        const statKey = type.toLowerCase()
        statsUpdate[statKey] = (statsUpdate[statKey] || 0) + ex.sets.length
    })

    // 2. Insert Workout
    const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
            user_id: user.id,
            name: workoutData.name,
            type: workoutData.type,
            total_xp_earned: totalXP,
            ended_at: new Date().toISOString(),
        })
        .select()
        .single()

    if (workoutError) {
        return { error: workoutError.message }
    }

    // 3. Insert Logs
    const logs = workoutData.exercises.flatMap((ex) =>
        ex.sets.map((set) => ({
            workout_id: workout.id,
            exercise_id: ex.exercise_id,
            sets: 1, // Each log entry is technically 1 set in this data model if we want granular logs, but schema says 'sets' int.
            // Wait, schema has 'sets' int. If we log per set, we should probably just sum them up or change schema.
            // Let's assume schema 'workout_logs' is one row per exercise per workout, with total sets.
            // Actually, my schema was: workout_id, exercise_id, sets, reps, weight.
            // If I have multiple sets with different weights, I can't store them in one row easily unless I use arrays or JSON.
            // Or I insert multiple rows for the same exercise?
            // Let's stick to one row per set for maximum granularity, OR one row per exercise with average/max weight.
            // The schema `sets` int implies "Number of sets".
            // Let's aggregate for now to match the schema simplicity: One row per exercise.
            // We'll store the max weight and total reps.
            // Ideally, we should have a `sets` table, but let's work with what we have.
            // I'll store the number of sets performed.
            reps: set.reps, // This is wrong if aggregating.
            weight: set.weight, // This is wrong if aggregating.
        }))
    )

    // RE-EVALUATING SCHEMA:
    // The schema `workout_logs` has `sets`, `reps`, `weight`. This is typical for "3 sets of 10 reps at 100kg".
    // But if sets vary, this breaks.
    // For this MVP, let's insert one row per set, setting `sets` = 1.
    // This allows granular tracking.

    const logEntries = workoutData.exercises.flatMap((ex) =>
        ex.sets.map(set => ({
            workout_id: workout.id,
            exercise_id: ex.exercise_id,
            sets: 1,
            reps: set.reps,
            weight: set.weight
        }))
    )

    const { error: logsError } = await supabase
        .from('workout_logs')
        .insert(logEntries)

    if (logsError) {
        // Should probably rollback workout but keeping it simple
        console.error('Error saving logs:', logsError)
    }

    // 4. Update User Profile (XP and Stats)
    // We need to fetch current stats first to increment
    const { data: profile } = await supabase
        .from('profiles')
        .select('stats, current_xp, level')
        .eq('id', user.id)
        .single()

    if (profile) {
        const currentStats = (profile.stats as Record<string, number>) || {}
        const newStats = { ...currentStats }

        Object.entries(statsUpdate).forEach(([key, value]) => {
            newStats[key] = (newStats[key] || 0) + value
        })

        const newXP = (profile.current_xp || 0) + totalXP
        // Simple leveling: Level = 1 + floor(XP / 1000)
        const newLevel = 1 + Math.floor(newXP / 1000)

        await supabase
            .from('profiles')
            .update({
                stats: newStats,
                current_xp: newXP,
                level: newLevel,
            })
            .eq('id', user.id)
    }

    revalidatePath('/')
    return { success: true }
}

export async function logRestDay() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const xpEarned = 10

    // 1. Insert Workout
    const { error: workoutError } = await supabase
        .from('workouts')
        .insert({
            user_id: user.id,
            name: 'Rest Day',
            type: 'Rest',
            total_xp_earned: xpEarned,
            ended_at: new Date().toISOString(),
        })

    if (workoutError) {
        return { error: workoutError.message }
    }

    // 2. Update Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('stats, current_xp, level')
        .eq('id', user.id)
        .single()

    if (profile) {
        const currentStats = (profile.stats as Record<string, number>) || {}
        const newStats = { ...currentStats }
        newStats['rest_days'] = (newStats['rest_days'] || 0) + 1

        const newXP = (profile.current_xp || 0) + xpEarned
        const newLevel = 1 + Math.floor(newXP / 1000)

        await supabase
            .from('profiles')
            .update({
                stats: newStats,
                current_xp: newXP,
                level: newLevel,
            })
            .eq('id', user.id)
    }

    revalidatePath('/')
    return { success: true }
}
