import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function TimeInput({ value, onChange }: { value?: string, onChange: (val: string) => void }) {
    const [hours, setHours] = useState("00")
    const [minutes, setMinutes] = useState("00")
    const [seconds, setSeconds] = useState("00")

    useEffect(() => {
        if (value) {
            const parts = value.split(':')
            if (parts.length === 3) {
                setHours(parts[0])
                setMinutes(parts[1])
                setSeconds(parts[2])
            } else if (parts.length === 2) {
                setMinutes(parts[0])
                setSeconds(parts[1])
            }
        }
    }, [value])

    const handleChange = (type: 'h' | 'm' | 's', val: string) => {
        // Allow only numbers
        if (!/^\d*$/.test(val)) return

        let newVal = val
        if (newVal.length > 2) newVal = newVal.slice(0, 2)

        let h = hours
        let m = minutes
        let s = seconds

        if (type === 'h') {
            h = newVal
            setHours(newVal)
        } else if (type === 'm') {
            // Cap minutes at 59? Or allow > 59? Usually 59.
            // But for input, let's just let them type, maybe validate on blur?
            // For simplicity, let's just update.
            m = newVal
            setMinutes(newVal)
        } else if (type === 's') {
            s = newVal
            setSeconds(newVal)
        }

        // Pad with 0 if needed when calling onChange?
        // No, let's pass raw values to allow natural typing.
        // We will pad on blur.
        onChange(`${h}:${m}:${s}`)
    }

    const handleBlur = () => {
        const pad = (str: string) => str.padStart(2, '0')
        const paddedH = pad(hours)
        const paddedM = pad(minutes)
        const paddedS = pad(seconds)

        setHours(paddedH)
        setMinutes(paddedM)
        setSeconds(paddedS)

        onChange(`${paddedH}:${paddedM}:${paddedS}`)
    }

    return (
        <div className="flex items-center gap-1">
            <input
                type="text"
                value={hours}
                onChange={(e) => handleChange('h', e.target.value)}
                onBlur={handleBlur}
                className="w-full min-w-[2ch] rounded-lg bg-black/50 px-1 py-2 text-center text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                placeholder="00"
            />
            <span className="text-zinc-500">:</span>
            <input
                type="text"
                value={minutes}
                onChange={(e) => handleChange('m', e.target.value)}
                onBlur={handleBlur}
                className="w-full min-w-[2ch] rounded-lg bg-black/50 px-1 py-2 text-center text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                placeholder="00"
            />
            <span className="text-zinc-500">:</span>
            <input
                type="text"
                value={seconds}
                onChange={(e) => handleChange('s', e.target.value)}
                onBlur={handleBlur}
                className="w-full min-w-[2ch] rounded-lg bg-black/50 px-1 py-2 text-center text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                placeholder="00"
            />
        </div>
    )
}
