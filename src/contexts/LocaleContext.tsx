'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Locale } from '../lib/translations'

const STORAGE_KEY = 'oqfoz-locale'

type LocaleContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored && (stored === 'pt' || stored === 'en' || stored === 'es')) {
        setLocaleState(stored)
      }
    } catch {
      // ignore
    }
    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // ignore
    }
  }

  return (
    <LocaleContext.Provider value={{ locale: mounted ? locale : 'pt', setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (ctx === undefined) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return ctx
}
