'use client'

import { useMemo } from 'react'

type Stats = {
    strength?: number
    cardio?: number
    flexibility?: number
    [key: string]: number | undefined
}

export function Avatar({
    stats,
    level = 1,
    className,
}: {
    stats: Stats
    level?: number
    className?: string
}) {
    // Determine body shape based on stats
    const strength = stats.strength || 0
    const cardio = stats.cardio || 0

    // Shoulder width increases with strength
    const shoulderWidth = 40 + Math.min(strength * 2, 40)

    // Waist width decreases with cardio (leanness), but increases slightly with strength (core)
    const waistWidth = 30 - Math.min(cardio, 10) + Math.min(strength * 0.5, 10)

    // Color changes with level
    const colors = [
        '#94a3b8', // Lvl 1: Slate
        '#22c55e', // Lvl 2: Green
        '#3b82f6', // Lvl 3: Blue
        '#a855f7', // Lvl 4: Purple
        '#eab308', // Lvl 5: Gold
        '#ef4444', // Lvl 6: Red
    ]
    const color = colors[Math.min(level - 1, colors.length - 1)]

    return (
        <div className={className}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full drop-shadow-2xl"
            >
                {/* Head */}
                <circle cx="50" cy="20" r="15" fill={color} />

                {/* Body */}
                <path
                    d={`
            M ${50 - shoulderWidth / 2} 40 
            L ${50 + shoulderWidth / 2} 40 
            L ${50 + waistWidth / 2} 70 
            L ${50 - waistWidth / 2} 70 
            Z
          `}
                    fill={color}
                    opacity="0.8"
                />

                {/* Arms (Simple lines for now, could be shapes) */}
                <line
                    x1={50 - shoulderWidth / 2} y1="40"
                    x2={50 - shoulderWidth / 2 - 10} y2="70"
                    stroke={color}
                    strokeWidth={5 + Math.min(strength * 0.5, 10)}
                    strokeLinecap="round"
                />
                <line
                    x1={50 + shoulderWidth / 2} y1="40"
                    x2={50 + shoulderWidth / 2 + 10} y2="70"
                    stroke={color}
                    strokeWidth={5 + Math.min(strength * 0.5, 10)}
                    strokeLinecap="round"
                />

                {/* Legs */}
                <line
                    x1={50 - waistWidth / 4} y1="70"
                    x2={50 - waistWidth / 2} y2="100"
                    stroke={color}
                    strokeWidth={6 + Math.min(strength * 0.5, 10)}
                    strokeLinecap="round"
                />
                <line
                    x1={50 + waistWidth / 4} y1="70"
                    x2={50 + waistWidth / 2} y2="100"
                    stroke={color}
                    strokeWidth={6 + Math.min(strength * 0.5, 10)}
                    strokeLinecap="round"
                />

                {/* Aura for high levels */}
                {level >= 5 && (
                    <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="2" strokeDasharray="4 4" opacity="0.5">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="10s" repeatCount="indefinite" />
                    </circle>
                )}
            </svg>
        </div>
    )
}
