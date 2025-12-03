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

type WorkoutTemplateData = {
    name: string
    type: string
    exercises: {
        exercise_id: string
        sets: number
        reps: number
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
        console.error('Error saving logs:', logsError)
    }

    // 4. Update User Profile (XP and Stats)
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

    // Check if user already worked out today
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const { data: existingWorkouts } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .gte('started_at', startOfDay.toISOString())
        .lte('started_at', endOfDay.toISOString())

    if (existingWorkouts && existingWorkouts.length > 0) {
        return { error: "You've already worked hard today!" }
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

export async function updateWorkout(workoutId: string, workoutData: WorkoutData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1. Fetch Old Data & Revert Stats
    const { data: oldWorkout } = await supabase
        .from('workouts')
        .select('*, workout_logs(*, exercises(type))')
        .eq('id', workoutId)
        .single()

    if (!oldWorkout) return { error: 'Workout not found' }

    // Calculate old stats to subtract
    let oldXP = oldWorkout.total_xp_earned
    const oldStats: Record<string, number> = {}

    // We need to reconstruct how stats were calculated. 
    // Previously we just counted sets per type.
    // We can iterate over the logs.
    oldWorkout.workout_logs.forEach((log: any) => {
        const type = log.exercises?.type || 'Strength'
        const statKey = type.toLowerCase()
        // In saveWorkout we did: statsUpdate[statKey] += sets.length
        // Here log.sets is the number of sets (int).
        oldStats[statKey] = (oldStats[statKey] || 0) + log.sets
    })

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('stats, current_xp, level')
        .eq('id', user.id)
        .single()

    if (profile) {
        const currentStats = (profile.stats as Record<string, number>) || {}
        const revertedStats = { ...currentStats }

        // Revert
        Object.entries(oldStats).forEach(([key, value]) => {
            revertedStats[key] = Math.max(0, (revertedStats[key] || 0) - value)
        })
        const revertedXP = Math.max(0, (profile.current_xp || 0) - oldXP)

        // 2. Calculate New Stats
        let newXP = 100 // Base XP
        const newStatsUpdate: Record<string, number> = {}

        // Fetch exercise details for new data
        const exerciseIds = workoutData.exercises.map(e => e.exercise_id)
        const { data: exerciseDetails } = await supabase
            .from('exercises')
            .select('id, type')
            .in('id', exerciseIds)

        const exerciseTypeMap = new Map(exerciseDetails?.map(e => [e.id, e.type]))

        workoutData.exercises.forEach((ex) => {
            const type = exerciseTypeMap.get(ex.exercise_id) || 'General'
            const setXP = ex.sets.length * 10
            newXP += setXP

            const statKey = type.toLowerCase()
            newStatsUpdate[statKey] = (newStatsUpdate[statKey] || 0) + ex.sets.length
        })

        // Apply New Stats
        const finalStats = { ...revertedStats }
        Object.entries(newStatsUpdate).forEach(([key, value]) => {
            finalStats[key] = (finalStats[key] || 0) + value
        })
        const finalXP = revertedXP + newXP
        const finalLevel = 1 + Math.floor(finalXP / 1000)

        // Update Profile
        await supabase
            .from('profiles')
            .update({
                stats: finalStats,
                current_xp: finalXP,
                level: finalLevel,
            })
            .eq('id', user.id)

        // 3. Update Workout Data
        // Update Workout
        await supabase
            .from('workouts')
            .update({
                name: workoutData.name,
                type: workoutData.type,
                total_xp_earned: newXP,
            })
            .eq('id', workoutId)

        // Replace Logs
        const { error: deleteError } = await supabase
            .from('workout_logs')
            .delete()
            .eq('workout_id', workoutId)

        if (deleteError) {
            console.error('Error deleting old logs:', deleteError)
            return { error: 'Failed to update workout logs' }
        }

        const logEntries = workoutData.exercises.flatMap((ex) =>
            ex.sets.map(set => ({
                workout_id: workoutId,
                exercise_id: ex.exercise_id,
                sets: 1,
                reps: set.reps,
                weight: set.weight
            }))
        )

        await supabase
            .from('workout_logs')
            .insert(logEntries)
    }

    revalidatePath('/')
    revalidatePath(`/workouts/${workoutId}`)
    return { success: true }
}

export async function updateWorkoutTemplate(templateId: string, templateData: WorkoutTemplateData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1. Update Template Details
    const { error: updateError } = await supabase
        .from('workout_templates')
        .update({
            name: templateData.name,
            type: templateData.type,
        })
        .eq('id', templateId)
        .eq('user_id', user.id)

    if (updateError) {
        return { error: updateError.message }
    }

    // 2. Replace Template Exercises
    // First delete existing exercises
    const { error: deleteError } = await supabase
        .from('workout_template_exercises')
        .delete()
        .eq('template_id', templateId)

    if (deleteError) {
        return { error: 'Failed to update template exercises (delete failed)' }
    }

    // Then insert new ones
    const exerciseEntries = templateData.exercises.map((ex, index) => ({
        template_id: templateId,
        exercise_id: ex.exercise_id,
        order_index: index,
        sets: ex.sets,
        reps: ex.reps,
    }))

    const { error: insertError } = await supabase
        .from('workout_template_exercises')
        .insert(exerciseEntries)

    if (insertError) {
        console.error('Error updating template exercises:', insertError)
        return { error: 'Failed to update template exercises (insert failed)' }
    }

    revalidatePath('/workouts/new')
    return { success: true }
}

export async function saveWorkoutTemplate(templateData: WorkoutTemplateData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // 1. Insert Template
    const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .insert({
            user_id: user.id,
            name: templateData.name,
            type: templateData.type,
        })
        .select()
        .single()

    if (templateError) {
        return { error: templateError.message }
    }

    // 2. Insert Template Exercises
    const exerciseEntries = templateData.exercises.map((ex, index) => ({
        template_id: template.id,
        exercise_id: ex.exercise_id,
        order_index: index,
        sets: ex.sets,
        reps: ex.reps,
    }))

    const { error: exercisesError } = await supabase
        .from('workout_template_exercises')
        .insert(exerciseEntries)

    if (exercisesError) {
        console.error('Error saving template exercises:', exercisesError)
        // Ideally we should rollback here, but for now we'll just return error
        return { error: 'Failed to save template exercises' }
    }

    revalidatePath('/workouts/new')
    return { success: true }
}

export async function getWorkoutTemplates() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data: templates } = await supabase
        .from('workout_templates')
        .select(`
            *,
            workout_template_exercises (
                *,
                exercises (
                    name,
                    target_muscle,
                    type
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Sort exercises by order_index
    templates?.forEach(t => {
        t.workout_template_exercises.sort((a: any, b: any) => a.order_index - b.order_index)
    })

    return templates || []
}

export async function deleteWorkoutTemplate(templateId: string) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/workouts/new')
    return { success: true }
}
