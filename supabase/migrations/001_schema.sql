-- ═══════════════════════════════════════════════════
-- LottoMind — Supabase Schema
-- Run ใน Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles (ข้อมูลเพิ่มเติมของ user) ───────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  avatar_color  TEXT DEFAULT '#7c3aed',
  is_admin      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Subscriptions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  status      TEXT DEFAULT 'free' CHECK (status IN ('free','premium','expired')),
  started_at  TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Payments ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id              UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount               INTEGER NOT NULL,      -- สตางค์ (5900 = 59 บาท)
  currency             TEXT DEFAULT 'thb',
  status               TEXT DEFAULT 'pending'
                         CHECK (status IN ('pending','succeeded','failed','refunded')),
  method               TEXT,                  -- 'card' | 'promptpay' | 'internet_banking'
  omise_charge_id      TEXT UNIQUE,
  omise_transaction_id TEXT,
  metadata             JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lottery Draws (shared ทุก user) ────────────────
CREATE TABLE IF NOT EXISTS public.lottery_draws (
  id                 TEXT PRIMARY KEY,         -- 'YYYY-MM-DD'
  draw_date          DATE NOT NULL,
  first_prize        TEXT NOT NULL,
  three_digit_front  TEXT[] NOT NULL,
  three_digit_back   TEXT[] NOT NULL,
  two_digit_back     TEXT NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  created_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ── User Dream Selections (per-user) ───────────────
CREATE TABLE IF NOT EXISTS public.user_dreams (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id    TEXT NOT NULL,
  thai_name   TEXT,
  two_digit   INTEGER[],
  three_digit INTEGER[],
  confidence  INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dream_id)
);

-- ── User Astrology Profiles (per-user) ─────────────
CREATE TABLE IF NOT EXISTS public.user_astrology (
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  birth_date   DATE,
  profile_data JSONB DEFAULT '{}',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── User Journal (per-user) ────────────────────────
CREATE TABLE IF NOT EXISTS public.user_journal (
  id             TEXT PRIMARY KEY,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  draw_date      DATE NOT NULL,
  numbers        JSONB NOT NULL DEFAULT '[]',
  note           TEXT,
  checked_result BOOLEAN DEFAULT FALSE,
  hit_prize      TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_user     ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status   ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created  ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_draws_date        ON public.lottery_draws(draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_user       ON public.user_dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_expires      ON public.subscriptions(expires_at);

-- ════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ════════════════════════════════════════════════════
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_dreams    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_astrology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journal   ENABLE ROW LEVEL SECURITY;

-- ── Profiles policies ──────────────────────────────
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── Subscriptions policies ─────────────────────────
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ── Payments policies ──────────────────────────────
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- ── Lottery Draws policies ─────────────────────────
CREATE POLICY "Anyone can read draws"
  ON public.lottery_draws FOR SELECT
  USING (TRUE);

-- Only admins can write draws (checked via profiles)
CREATE POLICY "Admins can manage draws"
  ON public.lottery_draws FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ── User Dreams policies ───────────────────────────
CREATE POLICY "Users manage own dreams"
  ON public.user_dreams FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── User Astrology policies ────────────────────────
CREATE POLICY "Users manage own astrology"
  ON public.user_astrology FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ════════════════════════════════════════════════════

-- Auto-create profile + subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_color', '#7c3aed')
  );

  INSERT INTO public.subscriptions (user_id, status)
  VALUES (NEW.id, 'free');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-expire subscriptions
CREATE OR REPLACE FUNCTION public.check_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at < NOW() AND NEW.status = 'premium' THEN
    NEW.status = 'expired';
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_expiry_check
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.check_subscription_expiry();

-- ════════════════════════════════════════════════════
-- SEED: Initial lottery draws (32 draws)
-- ════════════════════════════════════════════════════
INSERT INTO public.lottery_draws (id, draw_date, first_prize, three_digit_front, three_digit_back, two_digit_back)
VALUES
  ('2024-01-01','2024-01-01','587123',ARRAY['123','456'],ARRAY['789','234'],'56'),
  ('2024-01-16','2024-01-16','243891',ARRAY['234','567'],ARRAY['891','345'],'78'),
  ('2024-02-01','2024-02-01','761234',ARRAY['345','678'],ARRAY['912','456'],'23'),
  ('2024-02-16','2024-02-16','892345',ARRAY['456','789'],ARRAY['123','567'],'89'),
  ('2024-03-01','2024-03-01','134567',ARRAY['567','890'],ARRAY['234','678'],'34'),
  ('2024-03-16','2024-03-16','456789',ARRAY['678','901'],ARRAY['345','789'],'45'),
  ('2024-04-01','2024-04-01','678901',ARRAY['789','012'],ARRAY['456','890'],'67'),
  ('2024-04-16','2024-04-16','890123',ARRAY['890','123'],ARRAY['567','901'],'12'),
  ('2024-05-01','2024-05-01','012345',ARRAY['901','234'],ARRAY['678','012'],'78'),
  ('2024-05-16','2024-05-16','234567',ARRAY['012','345'],ARRAY['789','123'],'90'),
  ('2024-06-01','2024-06-01','456789',ARRAY['123','456'],ARRAY['890','234'],'56'),
  ('2024-06-16','2024-06-16','678901',ARRAY['234','567'],ARRAY['901','345'],'23'),
  ('2024-07-01','2024-07-01','890123',ARRAY['345','678'],ARRAY['012','456'],'89'),
  ('2024-07-16','2024-07-16','123456',ARRAY['456','789'],ARRAY['123','567'],'34'),
  ('2024-08-01','2024-08-01','345678',ARRAY['567','890'],ARRAY['234','678'],'67'),
  ('2024-08-16','2024-08-16','567890',ARRAY['678','901'],ARRAY['345','789'],'12'),
  ('2024-09-01','2024-09-01','789012',ARRAY['789','012'],ARRAY['456','890'],'45'),
  ('2024-09-16','2024-09-16','901234',ARRAY['890','123'],ARRAY['567','901'],'78'),
  ('2024-10-01','2024-10-01','123456',ARRAY['901','234'],ARRAY['678','012'],'90'),
  ('2024-10-16','2024-10-16','345678',ARRAY['012','345'],ARRAY['789','123'],'56'),
  ('2024-11-01','2024-11-01','567890',ARRAY['123','456'],ARRAY['890','234'],'23'),
  ('2024-11-16','2024-11-16','789012',ARRAY['234','567'],ARRAY['901','345'],'89'),
  ('2024-12-01','2024-12-01','901234',ARRAY['345','678'],ARRAY['012','456'],'34'),
  ('2024-12-16','2024-12-16','234567',ARRAY['456','789'],ARRAY['123','567'],'67'),
  ('2025-01-01','2025-01-01','456789',ARRAY['567','890'],ARRAY['234','678'],'12'),
  ('2025-01-16','2025-01-16','678901',ARRAY['678','901'],ARRAY['345','789'],'45'),
  ('2025-02-01','2025-02-01','890123',ARRAY['789','012'],ARRAY['456','890'],'78'),
  ('2025-02-16','2025-02-16','012345',ARRAY['890','123'],ARRAY['567','901'],'90'),
  ('2025-03-01','2025-03-01','234567',ARRAY['901','234'],ARRAY['678','012'],'56'),
  ('2025-03-16','2025-03-16','456789',ARRAY['012','345'],ARRAY['789','123'],'23'),
  ('2025-04-01','2025-04-01','678901',ARRAY['123','456'],ARRAY['890','234'],'89'),
  ('2025-04-16','2025-04-16','890123',ARRAY['234','567'],ARRAY['901','345'],'34')
ON CONFLICT (id) DO NOTHING;
