-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.push_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own subscription
CREATE POLICY "Users can insert own subscription"
ON public.push_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own subscription
CREATE POLICY "Users can update own subscription"
ON public.push_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own subscription
CREATE POLICY "Users can delete own subscription"
ON public.push_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: President can view all subscriptions (for sending push notifications)
CREATE POLICY "President can view all subscriptions"
ON public.push_subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'president'
  )
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
