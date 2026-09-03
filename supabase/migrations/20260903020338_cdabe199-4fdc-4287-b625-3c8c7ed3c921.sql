-- 1. Role check helper: switch from SECURITY DEFINER to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- 2. user_roles: only own rows readable
DROP POLICY IF EXISTS "roles readable" ON public.user_roles;
CREATE POLICY "own roles readable" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid());
REVOKE SELECT ON public.user_roles FROM anon;

-- 3. profiles: signed-in only
DROP POLICY IF EXISTS "profiles readable" ON public.profiles;
CREATE POLICY "profiles readable to authenticated" ON public.profiles
FOR SELECT TO authenticated
USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 4. farmer_profiles
DROP POLICY IF EXISTS "farmer profiles readable" ON public.farmer_profiles;
CREATE POLICY "farmer profiles readable to authenticated" ON public.farmer_profiles
FOR SELECT TO authenticated
USING (true);
REVOKE SELECT ON public.farmer_profiles FROM anon;

-- 5. labour_profiles
DROP POLICY IF EXISTS "labour profiles readable" ON public.labour_profiles;
CREATE POLICY "labour profiles readable to authenticated" ON public.labour_profiles
FOR SELECT TO authenticated
USING (true);
REVOKE SELECT ON public.labour_profiles FROM anon;

-- 6. seller_profiles
DROP POLICY IF EXISTS "seller profiles readable" ON public.seller_profiles;
CREATE POLICY "seller profiles readable to authenticated" ON public.seller_profiles
FOR SELECT TO authenticated
USING (true);
REVOKE SELECT ON public.seller_profiles FROM anon;