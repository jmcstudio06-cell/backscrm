-- 1. Table
CREATE TABLE public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  member_user_id uuid NOT NULL,
  email text NOT NULL,
  role_label text,
  permission_level text NOT NULL DEFAULT 'viewer',
  allowed_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (member_user_id)
);

CREATE INDEX idx_workspace_members_owner ON public.workspace_members(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their members"
ON public.workspace_members FOR ALL TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Members read own membership"
ON public.workspace_members FOR SELECT TO authenticated
USING (member_user_id = auth.uid());

CREATE TRIGGER update_workspace_members_updated_at
BEFORE UPDATE ON public.workspace_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Helper functions
CREATE OR REPLACE FUNCTION public.workspace_owner_for(_uid uuid)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT owner_id FROM public.workspace_members
      WHERE member_user_id = _uid AND is_active = true LIMIT 1),
    _uid
  );
$$;

CREATE OR REPLACE FUNCTION public.member_can(_owner_id uuid, _action text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.owner_id = _owner_id
      AND wm.member_user_id = auth.uid()
      AND wm.is_active = true
      AND (
        _action = 'view'
        OR (_action = 'write'  AND wm.permission_level IN ('editor','manager'))
        OR (_action = 'delete' AND wm.permission_level = 'manager')
      )
  );
$$;

-- 3. Member policies on owner-scoped tables
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'shows','transactions','clients','leads','budgets','contracts','musicians',
    'goals','user_goals','annual_goals','advances','repertoire_blocks',
    'checklist_templates','stage_mappings','performance_types',
    'content_plan_entries','artist_equipment','contract_clauses','contents',
    'contract_signature_links'
  ]
  LOOP
    EXECUTE format($f$
      CREATE POLICY "Team members can view %1$s"
      ON public.%1$I FOR SELECT TO authenticated
      USING (public.member_can(user_id, 'view'));
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY "Team members can insert %1$s"
      ON public.%1$I FOR INSERT TO authenticated
      WITH CHECK (public.member_can(user_id, 'write'));
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY "Team members can update %1$s"
      ON public.%1$I FOR UPDATE TO authenticated
      USING (public.member_can(user_id, 'write'))
      WITH CHECK (public.member_can(user_id, 'write'));
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY "Team members can delete %1$s"
      ON public.%1$I FOR DELETE TO authenticated
      USING (public.member_can(user_id, 'delete'));
    $f$, t);
  END LOOP;
END $$;

-- 4. Child tables (scoped through their parent)
CREATE POLICY "Team members can view repertoire_songs"
ON public.repertoire_songs FOR SELECT TO authenticated
USING (public.member_can(user_id, 'view'));
CREATE POLICY "Team members can write repertoire_songs"
ON public.repertoire_songs FOR INSERT TO authenticated
WITH CHECK (public.member_can(user_id, 'write'));
CREATE POLICY "Team members can update repertoire_songs"
ON public.repertoire_songs FOR UPDATE TO authenticated
USING (public.member_can(user_id, 'write'))
WITH CHECK (public.member_can(user_id, 'write'));
CREATE POLICY "Team members can delete repertoire_songs"
ON public.repertoire_songs FOR DELETE TO authenticated
USING (public.member_can(user_id, 'delete'));

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['show_checklist','show_expenses','show_musicians']
  LOOP
    EXECUTE format($f$
      CREATE POLICY "Team members can view %1$s"
      ON public.%1$I FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.shows s WHERE s.id = %1$I.show_id AND public.member_can(s.user_id,'view')));
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY "Team members can insert %1$s"
      ON public.%1$I FOR INSERT TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM public.shows s WHERE s.id = show_id AND public.member_can(s.user_id,'write')));
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY "Team members can update %1$s"
      ON public.%1$I FOR UPDATE TO authenticated
      USING (EXISTS (SELECT 1 FROM public.shows s WHERE s.id = %1$I.show_id AND public.member_can(s.user_id,'write')))
      WITH CHECK (EXISTS (SELECT 1 FROM public.shows s WHERE s.id = show_id AND public.member_can(s.user_id,'write')));
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY "Team members can delete %1$s"
      ON public.%1$I FOR DELETE TO authenticated
      USING (EXISTS (SELECT 1 FROM public.shows s WHERE s.id = %1$I.show_id AND public.member_can(s.user_id,'delete')));
    $f$, t);
  END LOOP;
END $$;

CREATE POLICY "Team members can view budget_items"
ON public.budget_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.budgets b WHERE b.id = budget_items.budget_id AND public.member_can(b.user_id,'view')));
CREATE POLICY "Team members can insert budget_items"
ON public.budget_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.budgets b WHERE b.id = budget_id AND public.member_can(b.user_id,'write')));
CREATE POLICY "Team members can update budget_items"
ON public.budget_items FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.budgets b WHERE b.id = budget_items.budget_id AND public.member_can(b.user_id,'write')))
WITH CHECK (EXISTS (SELECT 1 FROM public.budgets b WHERE b.id = budget_id AND public.member_can(b.user_id,'write')));
CREATE POLICY "Team members can delete budget_items"
ON public.budget_items FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.budgets b WHERE b.id = budget_items.budget_id AND public.member_can(b.user_id,'delete')));

CREATE POLICY "Team members can view booking_requests"
ON public.booking_requests FOR SELECT TO authenticated
USING (public.member_can(artist_id, 'view'));
CREATE POLICY "Team members can update booking_requests"
ON public.booking_requests FOR UPDATE TO authenticated
USING (public.member_can(artist_id, 'write'))
WITH CHECK (public.member_can(artist_id, 'write'));
CREATE POLICY "Team members can delete booking_requests"
ON public.booking_requests FOR DELETE TO authenticated
USING (public.member_can(artist_id, 'delete'));

-- 5. Members can read the owner profile (plan + branding)
CREATE POLICY "Team members can view owner profile"
ON public.profiles FOR SELECT TO authenticated
USING (public.member_can(user_id, 'view'));