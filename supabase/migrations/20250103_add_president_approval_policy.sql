-- Add RLS policy for president to approve/reject users
-- This policy allows users with role='president' to update other users' status

CREATE POLICY "President can approve or reject users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users AS president_user
    WHERE president_user.id = auth.uid()
    AND president_user.role = 'president'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users AS president_user
    WHERE president_user.id = auth.uid()
    AND president_user.role = 'president'
  )
);
