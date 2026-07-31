'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TrendIconProps {
  direction: 'UP' | 'DOWN' | 'NEUTRAL'
  size?: number
}

export function TrendIcon({ direction, size = 16 }: TrendIconProps) {
  switch (direction) {
    case 'UP':
      return <TrendingUp size={size} className="text-green-600 dark:text-green-400" />
    case 'DOWN':
      return <TrendingDown size={size} className="text-red-600 dark:text-red-400" />
    case 'NEUTRAL':
    default:
      return <Minus size={size} className="text-gray-600 dark:text-gray-400" />
  }
}
