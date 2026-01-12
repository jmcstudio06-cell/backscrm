-- Table for referral configuration (admin settings)
CREATE TABLE public.referral_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_active_days INTEGER NOT NULL DEFAULT 7,
  reward_10 INTEGER NOT NULL DEFAULT 30,
  reward_20 INTEGER NOT NULL DEFAULT 60,
  reward_30 INTEGER NOT NULL DEFAULT 90,
  campaign_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default config
INSERT INTO public.referral_config (min_active_days, reward_10, reward_20, reward_30, campaign_active)
VALUES (7, 30, 60, 90, true);

-- Table for referrals
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_name TEXT NOT NULL,
  referred_phone TEXT NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'valid', 'invalid')),
  whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
  validated_at TIMESTAMP WITH TIME ZONE,
  invalidated_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint on phone to prevent duplicates
CREATE UNIQUE INDEX idx_referrals_phone ON public.referrals(referred_phone);

-- Index for faster lookups
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- Table to track rewards already claimed
CREATE TABLE public.referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone INTEGER NOT NULL CHECK (milestone IN (10, 20, 30)),
  days_awarded INTEGER NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone)
);

-- Enable RLS
ALTER TABLE public.referral_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_config (only admins can modify, everyone can read)
CREATE POLICY "Anyone can read referral config"
ON public.referral_config FOR SELECT
USING (true);

CREATE POLICY "Admins can update referral config"
ON public.referral_config FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (referrer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create referrals"
ON public.referrals FOR INSERT
TO authenticated
WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Admins can update referrals"
ON public.referrals FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete referrals"
ON public.referrals FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_rewards
CREATE POLICY "Users can view their own rewards"
ON public.referral_rewards FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert rewards"
ON public.referral_rewards FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_referral_config_updated_at
BEFORE UPDATE ON public.referral_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();