'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  approveSession as approveWalletConnectSession,
  disconnectSession as disconnectWalletConnectSession,
  getPendingWalletConnectProposal,
  getWalletConnectClient,
  getWalletConnectSessions,
  pairWalletConnect,
  rejectSession as rejectWalletConnectSession,
  subscribeWalletConnectProposal,
  subscribeWalletConnectSessions,
  type WalletConnectProposal,
  type WalletConnectSession,
} from '@/lib/walletConnect'

export function useWalletConnect() {
  const [sessions, setSessions] = useState<WalletConnectSession[]>([])
  const [pendingProposal, setPendingProposal] = useState<WalletConnectProposal | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true

    getWalletConnectClient()
      .then(() => {
        if (!mounted) return
        setSessions(getWalletConnectSessions())
        setPendingProposal(getPendingWalletConnectProposal())
        setIsReady(true)
      })
      .catch(() => {
        if (!mounted) return
        setIsReady(false)
      })

    const unsubscribeSessions = subscribeWalletConnectSessions(setSessions)
    const unsubscribeProposal = subscribeWalletConnectProposal(setPendingProposal)

    return () => {
      mounted = false
      unsubscribeSessions()
      unsubscribeProposal()
    }
  }, [])

  const pair = useCallback(async (uri: string) => {
    await pairWalletConnect(uri)
  }, [])

  const approveSession = useCallback(async (proposal: WalletConnectProposal, contractAddress: string) => {
    await approveWalletConnectSession(proposal, contractAddress)
  }, [])

  const rejectSession = useCallback(async (proposal: WalletConnectProposal) => {
    await rejectWalletConnectSession(proposal)
  }, [])

  const disconnectSession = useCallback(async (topic: string) => {
    await disconnectWalletConnectSession(topic)
  }, [])

  return {
    isReady,
    sessions,
    pendingProposal,
    pair,
    approveSession,
    rejectSession,
    disconnectSession,
  }
}
