"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    label?: string
    leftLabel?: string
    rightLabel?: string
}

export function Switch({ checked, onCheckedChange, label, leftLabel, rightLabel }: SwitchProps) {
    return (
        <div className="flex items-center gap-2">
            {leftLabel && (
                <span className={cn("text-xs font-medium transition-colors", !checked ? "text-white" : "text-zinc-500")}>
                    {leftLabel}
                </span>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onCheckedChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                    checked ? "bg-emerald-500" : "bg-zinc-700"
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
            {rightLabel && (
                <span className={cn("text-xs font-medium transition-colors", checked ? "text-white" : "text-zinc-500")}>
                    {rightLabel}
                </span>
            )}
            {label && <span className="text-sm font-medium text-white">{label}</span>}
        </div>
    )
}
