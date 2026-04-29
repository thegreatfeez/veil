'use client'

import { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WalletConnectSessionMetadata {
  name: string
  description?: string
  url: string
  icons: string[]
}

export interface WalletConnectSession {
  topic: string
  peer: {
    metadata: WalletConnectSessionMetadata
  }
  expiry: number
}

// ── Storage key ───────────────────────────────────────────────────────────────

const SESSIONS_KEY = 'veil_wc_sessions'

// ── Core helpers ──────────────────────────────────────────────────────────────

/**
 * Return all active (non-expired) WalletConnect sessions stored locally.
 */
export function getSessions(): WalletConnectSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    if (!raw) return []
    const parsed: WalletConnectSession[] = JSON.parse(raw)
    const now = Math.floor(Date.now() / 1000)
    // Filter out expired sessions while we're here
    return parsed.filter((s) => s.expiry > now)
  } catch {
    return []
  }
}

/**
 * Persist the current session list to localStorage.
 */
function persistSessions(sessions: WalletConnectSession[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

/**
 * Disconnect a single session by topic.
 * Removes it from local storage and (in a real integration) would
 * also call the WalletConnect SignClient to send a disconnect request.
 */
export function disconnectSession(topic: string): void {
  const sessions = getSessions().filter((s) => s.topic !== topic)
  persistSessions(sessions)
}

/**
 * Disconnect all active sessions at once.
 */
export function disconnectAllSessions(): void {
  persistSessions([])
}

// ── React hook ────────────────────────────────────────────────────────────────

export interface UseWalletConnectReturn {
  sessions: WalletConnectSession[]
  disconnect: (topic: string) => void
  disconnectAll: () => void
  isLoaded: boolean
}

/**
 * useWalletConnect
 *
 * Reads active WalletConnect sessions from local storage and exposes
 * disconnect helpers that immediately update the UI.
 */
export function useWalletConnect(): UseWalletConnectReturn {
  const [sessions, setSessions] = useState<WalletConnectSession[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setSessions(getSessions())
    setIsLoaded(true)
  }, [])

  const disconnect = useCallback((topic: string) => {
    disconnectSession(topic)
    setSessions((prev) => prev.filter((s) => s.topic !== topic))
  }, [])

  const disconnectAll = useCallback(() => {
    disconnectAllSessions()
    setSessions([])
  }, [])

  return { sessions, disconnect, disconnectAll, isLoaded }
}