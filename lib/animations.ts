import { Variants } from 'framer-motion'

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
}

/**
 * Fade in with slide up
 */
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
}

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.4, ease: 'easeOut' }
    }
}

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
}

/**
 * Hover lift effect
 */
export const hoverLift = {
    rest: { y: 0, scale: 1 },
    hover: {
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: {
        scale: 0.98,
        transition: { duration: 0.1 }
    }
}

/**
 * Number counter animation config
 */
export const counterConfig = {
    duration: 1.5,
    ease: 'easeOut'
}
