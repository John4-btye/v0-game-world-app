'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label?: string
  count?: number
  active?: boolean
  activeColor?: string
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ icon, label, count, active, activeColor = 'text-red-500', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
          'hover:scale-105 hover:bg-muted active:scale-100',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'min-h-[44px] touch-manipulation',
          active ? activeColor : 'text-muted-foreground hover:text-foreground',
          className
        )}
        {...props}
      >
        <span className={cn(
          'transition-transform duration-200',
          active && 'animate-pulse'
        )}>
          {icon}
        </span>
        {typeof count === 'number' && count > 0 && (
          <span className={cn(
            'rounded-full px-1.5 py-0.5 text-xs',
            active ? 'bg-red-500/10' : 'bg-muted'
          )}>
            {count}
          </span>
        )}
        {label && <span className="sr-only">{label}</span>}
      </button>
    )
  }
)

ActionButton.displayName = 'ActionButton'
