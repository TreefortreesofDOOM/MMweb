'use client'

import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export function Logo() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // During SSR and initial client render, show black logo
  if (!mounted) {
    return (
      <Link href="/" className="flex items-center">
        <Image
          src="/images/logos/meaning_machine_logo_black.png"
          alt="Meaning Machine"
          width={120}
          height={40}
          className="h-8 w-auto min-w-[50px] object-contain"
          priority
        />
      </Link>
    )
  }
  
  const isDark = theme === 'dark' || resolvedTheme === 'dark'
  
  return (
    <Link href="/" className="flex items-center">
      <Image
        src={isDark 
          ? '/images/logos/meaning_machine_logo_white.png'
          : '/images/logos/meaning_machine_logo_black.png'
        }
        alt="Meaning Machine"
        width={120}
        height={40}
        className="h-8 w-auto min-w-[50px] object-contain"
        priority
      />
    </Link>
  )
} 