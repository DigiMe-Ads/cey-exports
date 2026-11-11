import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    setProfile(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      await loadProfile(data.session?.user)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      // Defer the query so it doesn't run inside the auth callback
      setTimeout(() => loadProfile(s?.user), 0)
    })
    return () => sub.subscription.unsubscribe()
  }, [loadProfile])

  const value = {
    ready,
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === 'admin',
    refreshProfile: () => loadProfile(session?.user),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, meta) =>
      supabase.auth.signUp({ email, password, options: { data: meta, emailRedirectTo: `${window.location.origin}/#/account` } }),
    signOut: () => supabase.auth.signOut(),
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
