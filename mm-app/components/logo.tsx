'use client'

import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"

export function Logo() {
  const { theme } = useTheme()
  
  return (
    <Link href="/" className="flex items-center">
      <Image
        src={theme === 'dark' 
          ? '/images/logos/meaning_machine_logo_white.png'
          : '/images/logos/meaning_machine_logo_black.png'
        }
        alt="Meaning Machine"
        width={120}
        height={40}
        className="h-8 w-auto"
      />
    </Link>
  )
} 