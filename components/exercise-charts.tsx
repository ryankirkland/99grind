'use client'

import { useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, Repeat, Trophy, Scale } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type Log = {
    id: string
    sets: number
    reps: number
    weight: number
    date: Date
}

type ChartDataPoint = {
    date: string
    timestamp: number
    value: number
}

export function ExerciseCharts({ logs, unit = 'kg' }: { logs: Log[], unit?: string }) {
    const [selectedMetric, setSelectedMetric] = useState<'sets' | 'reps' | 'maxWeight' | 'avgWeight'>('maxWeight')

    const toDisplay = (weight: number) => {
        if (unit === 'lbs') {
            return Math.round(weight * 2.20462)
        }
        return Math.round(weight)
    }

    // Process logs into daily stats
    const dailyStats = useMemo(() => {
        const statsByDay = new Map<string, {
            sets: number
            reps: number
            maxWeight: number // Daily max
            totalWeight: number
            weightCount: number
            date: Date
        }>()

        // Sort logs by date ascending for processing
        const sortedLogs = [...logs].sort((a, b) => a.date.getTime() - b.date.getTime())

        sortedLogs.forEach(log => {
            const dateKey = format(log.date, 'yyyy-MM-dd')

            if (!statsByDay.has(dateKey)) {
                statsByDay.set(dateKey, {
                    sets: 0,
                    reps: 0,
                    maxWeight: 0,
                    totalWeight: 0,
                    weightCount: 0,
                    date: log.date
                })
            }

            const dayStats = statsByDay.get(dateKey)!
            dayStats.sets += log.sets
            dayStats.reps += log.reps
            dayStats.maxWeight = Math.max(dayStats.maxWeight, log.weight)
            if (log.weight > 0) {
                dayStats.totalWeight += log.weight
                dayStats.weightCount++
            }
        })

        return Array.from(statsByDay.values())
    }, [logs])

    // Calculate totals for summary cards
    const totals = useMemo(() => {
        let totalSets = 0
        let totalReps = 0
        let maxWeight = 0
        let totalWeight = 0
        let weightCount = 0

        logs.forEach(log => {
            totalSets += log.sets
            totalReps += log.reps
            if (log.weight > maxWeight) maxWeight = log.weight
            if (log.weight > 0) {
                totalWeight += log.weight
                weightCount++
            }
        })

        return {
            totalSets,
            totalReps,
            totalReps,
            maxWeight: toDisplay(maxWeight),
            avgWeight: weightCount > 0 ? toDisplay(totalWeight / weightCount) : 0
        }
    }, [logs])

    // Generate chart data based on selected metric
    const chartData = useMemo(() => {
        let cumulativeMaxWeight = 0
        let cumulativeTotalWeight = 0
        let cumulativeWeightCount = 0

        return dailyStats.map(day => {
            let value = 0

            if (selectedMetric === 'sets') {
                value = day.sets
            } else if (selectedMetric === 'reps') {
                value = day.reps
            } else if (selectedMetric === 'maxWeight') {
                // Cumulative Max Weight (PR)
                cumulativeMaxWeight = Math.max(cumulativeMaxWeight, day.maxWeight)
                value = toDisplay(cumulativeMaxWeight)
            } else if (selectedMetric === 'avgWeight') {
                // Rolling Average
                cumulativeTotalWeight += day.totalWeight
                cumulativeWeightCount += day.weightCount
                value = cumulativeWeightCount > 0 ? toDisplay(cumulativeTotalWeight / cumulativeWeightCount) : 0
            }

            return {
                date: format(day.date, 'MMM d'),
                timestamp: day.date.getTime(),
                value
            }
        })
    }, [dailyStats, selectedMetric])

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-xl">
                    <p className="mb-1 text-sm font-medium text-zinc-400">{label}</p>
                    <p className="text-lg font-bold text-white">
                        {payload[0].value}
                        {selectedMetric.includes('Weight') ? unit : ''}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <button
                    onClick={() => setSelectedMetric('sets')}
                    className={cn(
                        "rounded-xl p-4 border text-left transition-all",
                        selectedMetric === 'sets'
                            ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/50"
                            : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900"
                    )}
                >
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                        <Activity className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-zinc-500 uppercase font-medium">Total Sets</p>
                    <p className="text-2xl font-bold text-white">{totals.totalSets}</p>
                </button>

                <button
                    onClick={() => setSelectedMetric('reps')}
                    className={cn(
                        "rounded-xl p-4 border text-left transition-all",
                        selectedMetric === 'reps'
                            ? "bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/50"
                            : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900"
                    )}
                >
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <Repeat className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-zinc-500 uppercase font-medium">Total Reps</p>
                    <p className="text-2xl font-bold text-white">{totals.totalReps}</p>
                </button>

                <button
                    onClick={() => setSelectedMetric('maxWeight')}
                    className={cn(
                        "rounded-xl p-4 border text-left transition-all",
                        selectedMetric === 'maxWeight'
                            ? "bg-yellow-500/10 border-yellow-500/50 ring-1 ring-yellow-500/50"
                            : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900"
                    )}
                >
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                        <Trophy className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-zinc-500 uppercase font-medium">Max Weight</p>
                    <p className="text-2xl font-bold text-white">{totals.maxWeight}{unit}</p>
                </button>

                <button
                    onClick={() => setSelectedMetric('avgWeight')}
                    className={cn(
                        "rounded-xl p-4 border text-left transition-all",
                        selectedMetric === 'avgWeight'
                            ? "bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/50"
                            : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900"
                    )}
                >
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                        <Scale className="h-4 w-4" />
                    </div>
                    <p className="text-xs text-zinc-500 uppercase font-medium">Avg Weight</p>
                    <p className="text-2xl font-bold text-white">{totals.avgWeight}{unit}</p>
                </button>
            </div>

            <div className="h-[300px] w-full rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis
                                dataKey="date"
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#52525b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#52525b', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={
                                    selectedMetric === 'sets' ? '#10b981' :
                                        selectedMetric === 'reps' ? '#3b82f6' :
                                            selectedMetric === 'maxWeight' ? '#eab308' :
                                                '#a855f7'
                                }
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#18181b', strokeWidth: 2 }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-zinc-500">
                        Not enough data to display chart
                    </div>
                )}
            </div>
        </div>
    )
}
