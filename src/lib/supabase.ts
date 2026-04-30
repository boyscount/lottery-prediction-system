import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabaseReady = !!(url && key &&
  url !== 'https://xxxxxxxxxxxxxxxxxxxx.supabase.co')

export const supabase = createClient(
  url  || 'https://placeholder.supabase.co',
  key  || 'placeholder',
  {
    auth: {
      persistSession: true,
      storageKey: 'lottomind_auth',
      autoRefreshToken: true,
      // bypass navigator lock — ป้องกัน NavigatorLockAcquireTimeoutError
      lock: <R>(_name: string, _timeout: number, fn: () => Promise<R>): Promise<R> => fn(),
    },
  }
)

export type SupabaseProfile = {
  id: string
  username: string
  avatar_color: string
  is_admin: boolean
  created_at: string
}

export type SupabaseSubscription = {
  id: string
  user_id: string
  status: 'free' | 'premium' | 'expired'
  started_at: string | null
  expires_at: string | null
  updated_at: string
}

export type SupabasePayment = {
  id: string
  user_id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'
  method: string
  omise_charge_id: string | null
  created_at: string
}
