'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedNumberProps {
    value: number
    duration?: number
    className?: string
    suffix?: string
    decimals?: number
}

export function AnimatedNumber({
    value,
    duration = 1.5,
    className = '',
    suffix = '',
    decimals = 0
}: AnimatedNumberProps) {
    const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
    const display = useTransform(spring, (current) =>
        current.toFixed(decimals) + suffix
    )

    useEffect(() => {
        spring.set(value)
    }, [spring, value])

    return <motion.span className={className}>{display}</motion.span>
}
