'use client'

import { Check } from 'lucide-react'

interface VerificationBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function VerificationBadge({ size = 'md', className = '' }: VerificationBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  }

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-blue-500 
        rounded-full 
        flex 
        items-center 
        justify-center 
        flex-shrink-0
        shadow-sm
        ${className}
      `}
      title="Empresa verificada"
    >
      <Check 
        size={iconSizes[size]} 
        className="text-white font-bold stroke-[3]" 
      />
    </div>
  )
}

