import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function Toggle({ checked, onChange, disabled = false, size = 'md' }: ToggleProps) {
  const sm = size === 'sm'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        sm ? 'h-5 w-9' : 'h-6 w-11',
        checked
          ? 'bg-gradient-accent shadow-[0_0_8px_rgba(255,107,53,0.4)]'
          : 'bg-text-dim',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 40 }}
        className={[
          'pointer-events-none inline-block rounded-full bg-white shadow-md',
          sm ? 'h-4 w-4' : 'h-5 w-5',
        ].join(' ')}
        style={{
          translateX: checked ? (sm ? '16px' : '20px') : '0px',
        }}
      />
    </button>
  )
}
