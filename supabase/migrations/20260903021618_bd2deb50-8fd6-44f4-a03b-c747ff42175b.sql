-- ============ ENUM ============
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'provider';

-- ============ CATALOGUE ============
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_te text,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT '🌾',
  description text,
  description_te text,
  sort_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_categories TO authenticated;
GRANT ALL ON public.service_categories TO service_role;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service categories readable" ON public.service_categories FOR SELECT USING (status = 'active' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manages service categories" ON public.service_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_te text,
  slug text NOT NULL UNIQUE,
  description text,
  pricing_type text NOT NULL DEFAULT 'quote',
  status text NOT NULL DEFAULT 'active',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services readable" ON public.services FOR SELECT USING (status = 'active' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin manages services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ PROVIDERS ============
CREATE TABLE public.service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  about text,
  profile_image text,
  experience_years numeric NOT NULL DEFAULT 0,
  service_radius_km numeric NOT NULL DEFAULT 25,
  state text,
  district text,
  mandal text,
  village text,
  verification_status text NOT NULL DEFAULT 'unverified',
  mobile_verified boolean NOT NULL DEFAULT false,
  rating numeric NOT NULL DEFAULT 0,
  rating_count integer NOT NULL DEFAULT 0,
  completed_jobs integer NOT NULL DEFAULT 0,
  response_rate numeric NOT NULL DEFAULT 0,
  availability_status text NOT NULL DEFAULT 'available',
  working_days text[] NOT NULL DEFAULT '{Mon,Tue,Wed,Thu,Fri,Sat}',
  working_hours_start time NOT NULL DEFAULT '06:00',
  working_hours_end time NOT NULL DEFAULT '18:00',
  max_bookings_per_day integer NOT NULL DEFAULT 3,
  accepts_urgent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_providers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.service_providers TO authenticated;
GRANT ALL ON public.service_providers TO service_role;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active providers readable" ON public.service_providers FOR SELECT USING (status = 'active');
CREATE POLICY "own provider profile" ON public.service_providers FOR ALL TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.is_provider_owner(_provider_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.service_providers p WHERE p.id = _provider_id AND p.user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_provider_owner(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_provider_owner(uuid) TO authenticated, service_role;

CREATE TABLE public.provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  price numeric,
  price_per_hour numeric,
  pricing_unit text NOT NULL DEFAULT 'per_acre',
  minimum_booking text,
  equipment_details text,
  materials_supplied_by text NOT NULL DEFAULT 'farmer',
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, service_id)
);
GRANT SELECT ON public.provider_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.provider_services TO authenticated;
GRANT ALL ON public.provider_services TO service_role;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "provider services readable" ON public.provider_services FOR SELECT USING (status = 'active');
CREATE POLICY "own provider services" ON public.provider_services FOR ALL TO authenticated
  USING (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.provider_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  brand text,
  model text,
  horsepower text,
  images text[] NOT NULL DEFAULT '{}',
  description text,
  rental_price_hour numeric,
  rental_price_day numeric,
  security_deposit numeric,
  delivery_available boolean NOT NULL DEFAULT false,
  location text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_equipment TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.provider_equipment TO authenticated;
GRANT ALL ON public.provider_equipment TO service_role;
ALTER TABLE public.provider_equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "provider equipment readable" ON public.provider_equipment FOR SELECT USING (status = 'active');
CREATE POLICY "own provider equipment" ON public.provider_equipment FOR ALL TO authenticated
  USING (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.provider_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  state text,
  district text,
  mandal text,
  village text,
  radius_km numeric NOT NULL DEFAULT 25,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_locations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.provider_locations TO authenticated;
GRANT ALL ON public.provider_locations TO service_role;
ALTER TABLE public.provider_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "provider locations readable" ON public.provider_locations FOR SELECT USING (true);
CREATE POLICY "own provider locations" ON public.provider_locations FOR ALL TO authenticated
  USING (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.provider_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time,
  end_time time,
  status text NOT NULL DEFAULT 'available',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, date)
);
GRANT SELECT ON public.provider_availability TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.provider_availability TO authenticated;
GRANT ALL ON public.provider_availability TO service_role;
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "provider availability readable" ON public.provider_availability FOR SELECT USING (true);
CREATE POLICY "own provider availability" ON public.provider_availability FOR ALL TO authenticated
  USING (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.provider_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  doc_type text NOT NULL,
  file_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provider_documents TO authenticated;
GRANT ALL ON public.provider_documents TO service_role;
ALTER TABLE public.provider_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin documents" ON public.provider_documents FOR ALL TO authenticated
  USING (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'));

-- ============ REQUESTS / QUOTES / BOOKINGS ============
CREATE TABLE public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code text NOT NULL DEFAULT ('SR-' || upper(substr(md5(random()::text),1,6))),
  farmer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE SET NULL,
  title text,
  crop text,
  farm_size_acres numeric,
  state text,
  district text,
  mandal text,
  village text,
  location_note text,
  preferred_date date,
  preferred_time time,
  duration text,
  equipment_required text,
  budget numeric,
  description text,
  photos text[] NOT NULL DEFAULT '{}',
  is_urgent boolean NOT NULL DEFAULT false,
  is_open_requirement boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'requested',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "farmer manages own requests" ON public.service_requests FOR ALL TO authenticated
  USING (farmer_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (farmer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "providers read open requests" ON public.service_requests FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.service_providers p WHERE p.user_id = auth.uid())
    AND (provider_id IS NULL OR public.is_provider_owner(provider_id))
  );

CREATE TABLE public.service_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.service_requests(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  base_price numeric NOT NULL DEFAULT 0,
  transport_fee numeric NOT NULL DEFAULT 0,
  additional_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'sent',
  locked boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, provider_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_quotes TO authenticated;
GRANT ALL ON public.service_quotes TO service_role;
ALTER TABLE public.service_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quote parties read" ON public.service_quotes FOR SELECT TO authenticated
  USING (
    public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.service_requests r WHERE r.id = request_id AND r.farmer_id = auth.uid())
  );
CREATE POLICY "provider sends quote" ON public.service_quotes FOR INSERT TO authenticated
  WITH CHECK (public.is_provider_owner(provider_id));
CREATE POLICY "quote parties update" ON public.service_quotes FOR UPDATE TO authenticated
  USING (
    public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.service_requests r WHERE r.id = request_id AND r.farmer_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.prevent_locked_quote_change()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF OLD.locked AND (NEW.base_price <> OLD.base_price OR NEW.transport_fee <> OLD.transport_fee
      OR NEW.additional_fee <> OLD.additional_fee OR NEW.total <> OLD.total) THEN
    RAISE EXCEPTION 'An accepted quotation cannot be changed without farmer approval';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_lock_quote BEFORE UPDATE ON public.service_quotes
FOR EACH ROW EXECUTE FUNCTION public.prevent_locked_quote_change();

CREATE TABLE public.service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text NOT NULL DEFAULT ('BK-' || upper(substr(md5(random()::text),1,6))),
  request_id uuid REFERENCES public.service_requests(id) ON DELETE SET NULL,
  quote_id uuid REFERENCES public.service_quotes(id) ON DELETE SET NULL,
  provider_id uuid NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  booking_date date,
  start_time time,
  location text,
  farm_size_acres numeric,
  agreed_price numeric NOT NULL DEFAULT 0,
  commission_percent numeric NOT NULL DEFAULT 0,
  commission_amount numeric NOT NULL DEFAULT 0,
  provider_payout numeric NOT NULL DEFAULT 0,
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  booking_status text NOT NULL DEFAULT 'confirmed',
  cancelled_by text,
  cancellation_reason text,
  reschedule_reason text,
  reschedule_requested_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_bookings TO authenticated;
GRANT ALL ON public.service_bookings TO service_role;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "booking parties read" ON public.service_bookings FOR SELECT TO authenticated
  USING (farmer_id = auth.uid() OR public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "booking create" ON public.service_bookings FOR INSERT TO authenticated
  WITH CHECK (farmer_id = auth.uid() OR public.is_provider_owner(provider_id));
CREATE POLICY "booking parties update" ON public.service_bookings FOR UPDATE TO authenticated
  USING (farmer_id = auth.uid() OR public.is_provider_owner(provider_id) OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.booking_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.service_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.booking_messages TO authenticated;
GRANT ALL ON public.booking_messages TO service_role;
ALTER TABLE public.booking_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "message parties read" ON public.booking_messages FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.service_bookings b WHERE b.id = booking_id AND (b.farmer_id = auth.uid() OR public.is_provider_owner(b.provider_id)))
    OR EXISTS (SELECT 1 FROM public.service_requests r WHERE r.id = request_id AND (r.farmer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.service_quotes q WHERE q.request_id = r.id AND public.is_provider_owner(q.provider_id))))
  );
CREATE POLICY "message send" ON public.booking_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE TABLE public.service_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.service_providers(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  direction text NOT NULL DEFAULT 'farmer_to_provider',
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  quality_rating integer,
  timeliness_rating integer,
  behaviour_rating integer,
  equipment_rating integer,
  value_rating integer,
  comment text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON public.service_reviews TO authenticated;
GRANT ALL ON public.service_reviews TO service_role;
ALTER TABLE public.service_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published service reviews readable" ON public.service_reviews FOR SELECT USING (status = 'published');
CREATE POLICY "create own service review" ON public.service_reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "update own service review" ON public.service_reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.service_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.service_bookings(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  attachments text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.service_complaints TO authenticated;
GRANT ALL ON public.service_complaints TO service_role;
ALTER TABLE public.service_complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "complaint parties read" ON public.service_complaints FOR SELECT TO authenticated
  USING (
    reporter_id = auth.uid() OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.service_bookings b WHERE b.id = booking_id AND public.is_provider_owner(b.provider_id))
  );
CREATE POLICY "create service complaint" ON public.service_complaints FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "update service complaint" ON public.service_complaints FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.service_bookings b WHERE b.id = booking_id AND public.is_provider_owner(b.provider_id))
  );

CREATE TABLE public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.platform_settings TO authenticated;
GRANT ALL ON public.platform_settings TO service_role;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings readable" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "admin manages settings" ON public.platform_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.platform_settings (key, value, description) VALUES
  ('service_commission_percent', '0'::jsonb, 'RythuSetu commission percentage on completed farming services. Configurable by admin.'),
  ('cancellation_policy', '{"farmer_free_cancel_hours": 24, "penalty_enabled": false}'::jsonb, 'Cancellation rules for farming service bookings.');

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER t_sc_upd BEFORE UPDATE ON public.service_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_sv_upd BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_sp_upd BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_ps_upd BEFORE UPDATE ON public.provider_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_pe_upd BEFORE UPDATE ON public.provider_equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_sr_upd BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_sb_upd BEFORE UPDATE ON public.service_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_scm_upd BEFORE UPDATE ON public.service_complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_provider_services_service ON public.provider_services(service_id);
CREATE INDEX idx_provider_locations_area ON public.provider_locations(district, mandal);
CREATE INDEX idx_requests_farmer ON public.service_requests(farmer_id);
CREATE INDEX idx_bookings_farmer ON public.service_bookings(farmer_id);
CREATE INDEX idx_bookings_provider ON public.service_bookings(provider_id);

-- ============ CATALOGUE SEED ============
INSERT INTO public.service_categories (name, name_te, slug, icon, description, sort_order) VALUES
  ('Tractor & Land Preparation','ట్రాక్టర్ & భూమి సిద్ధం','tractor-land','🚜','Ploughing, rotavator, levelling and land preparation work',1),
  ('Sowing & Planting','విత్తనం & నాటడం','sowing','🌱','Seed sowing, transplantation and planting machines',2),
  ('Crop Maintenance & Spraying','పంట సంరక్షణ & స్ప్రేయింగ్','crop-maintenance','🧪','Weeding, fertilizer and pesticide application',3),
  ('Drone Services','డ్రోన్ సేవలు','drone','🚁','Drone spraying, crop monitoring and field mapping',4),
  ('Harvesting','కోత సేవలు','harvesting','🌾','Combine harvester, reaper, thresher and manual harvesting',5),
  ('Post-Harvest Services','కోత అనంతర సేవలు','post-harvest','📦','Threshing, cleaning, grading, drying, packing and loading',6),
  ('Irrigation Services','నీటిపారుదల సేవలు','irrigation','💧','Pump rental, water tanker, drip and sprinkler installation',7),
  ('Soil Testing','మట్టి పరీక్ష','soil-testing','🧫','Soil sample collection and laboratory testing',8),
  ('Farm Equipment Rental','వ్యవసాయ పరికరాల అద్దె','equipment-rental','🔧','Rent tractors, rotavators, sprayers, pumps and more',9),
  ('Farm Transport','వ్యవసాయ రవాణా','transport','🚚','Produce and equipment transport with loading support',10),
  ('Expert Consultation','నిపుణుల సలహా','expert','👨‍🔬','Crop, soil, irrigation and organic farming consultation',11);

INSERT INTO public.services (category_id, name, name_te, slug, pricing_type, sort_order)
SELECT c.id, v.name, v.name_te, v.slug, v.pricing_type, v.ord FROM public.service_categories c
JOIN (VALUES
  ('tractor-land','Tractor Rental','ట్రాక్టర్ అద్దె','tractor-rental','per_hour',1),
  ('tractor-land','Ploughing','దుక్కి','ploughing','per_acre',2),
  ('tractor-land','Rotavator','రోటవేటర్','rotavator','per_acre',3),
  ('tractor-land','Cultivator','కల్టివేటర్','cultivator','per_acre',4),
  ('tractor-land','Land Levelling','భూమి చదును','land-levelling','per_acre',5),
  ('tractor-land','Harrowing','హారోయింగ్','harrowing','per_acre',6),
  ('tractor-land','Bed Preparation','బెడ్ తయారీ','bed-preparation','per_acre',7),
  ('tractor-land','Ridger Service','రిడ్జర్ సేవ','ridger','per_acre',8),
  ('tractor-land','Furrow Preparation','కాలువల తయారీ','furrow','per_acre',9),
  ('sowing','Seed Sowing','విత్తనం వేయడం','seed-sowing','per_acre',1),
  ('sowing','Paddy Transplantation','వరి నాట్లు','paddy-transplantation','per_acre',2),
  ('sowing','Vegetable Planting','కూరగాయల నాటడం','vegetable-planting','per_acre',3),
  ('sowing','Nursery Planting','నర్సరీ నాటడం','nursery-planting','per_task',4),
  ('sowing','Seed Drill Service','సీడ్ డ్రిల్ సేవ','seed-drill','per_acre',5),
  ('sowing','Planter Machine','ప్లాంటర్ మెషిన్','planter-machine','per_acre',6),
  ('sowing','Transplanter Machine','ట్రాన్స్‌ప్లాంటర్ మెషిన్','transplanter-machine','per_acre',7),
  ('crop-maintenance','Weeding','కలుపు తీయడం','weeding','per_acre',1),
  ('crop-maintenance','Inter-cultivation','అంతర కృషి','inter-cultivation','per_acre',2),
  ('crop-maintenance','Fertilizer Application','ఎరువుల వాడకం','fertilizer-application','per_acre',3),
  ('crop-maintenance','Organic Manure Application','సేంద్రియ ఎరువు వేయడం','organic-manure-application','per_acre',4),
  ('crop-maintenance','Pesticide Application','పురుగుమందు పిచికారీ','pesticide-application','per_acre',5),
  ('crop-maintenance','Bio-fertilizer Application','జీవ ఎరువుల వాడకం','bio-fertilizer-application','per_acre',6),
  ('crop-maintenance','Spraying Service','స్ప్రేయింగ్ సేవ','spraying-service','per_acre',7),
  ('drone','Drone Pesticide Spraying','డ్రోన్ పురుగుమందు పిచికారీ','drone-pesticide','per_acre',1),
  ('drone','Drone Fertilizer Spraying','డ్రోన్ ఎరువుల పిచికారీ','drone-fertilizer','per_acre',2),
  ('drone','Crop Monitoring','పంట పర్యవేక్షణ','crop-monitoring','per_acre',3),
  ('drone','Field Mapping','పొలం మ్యాపింగ్','field-mapping','per_acre',4),
  ('drone','Crop Health Monitoring','పంట ఆరోగ్య పర్యవేక్షణ','crop-health-monitoring','per_acre',5),
  ('harvesting','Paddy Harvesting','వరి కోత','paddy-harvesting','per_acre',1),
  ('harvesting','Cotton Harvesting','పత్తి కోత','cotton-harvesting','per_acre',2),
  ('harvesting','Chilli Harvesting','మిర్చి కోత','chilli-harvesting','per_acre',3),
  ('harvesting','Groundnut Harvesting','వేరుశనగ కోత','groundnut-harvesting','per_acre',4),
  ('harvesting','Maize Harvesting','మొక్కజొన్న కోత','maize-harvesting','per_acre',5),
  ('harvesting','Sugarcane Services','చెరకు సేవలు','sugarcane-services','per_acre',6),
  ('harvesting','Vegetable Harvesting','కూరగాయల కోత','vegetable-harvesting','per_acre',7),
  ('harvesting','Manual Harvesting Labour','మాన్యువల్ కోత కూలీ','manual-harvesting','per_acre',8),
  ('harvesting','Combine Harvester','కంబైన్ హార్వెస్టర్','combine-harvester','per_hour',9),
  ('harvesting','Reaper','రీపర్','reaper','per_acre',10),
  ('harvesting','Thresher','థ్రెషర్','thresher','per_hour',11),
  ('post-harvest','Threshing','నూర్పిడి','threshing','per_quintal',1),
  ('post-harvest','Cleaning','శుభ్రపరచడం','cleaning','per_quintal',2),
  ('post-harvest','Sorting','వేరుచేయడం','sorting','per_quintal',3),
  ('post-harvest','Grading','గ్రేడింగ్','grading','per_quintal',4),
  ('post-harvest','Drying','ఎండబెట్టడం','drying','per_quintal',5),
  ('post-harvest','Packing','ప్యాకింగ్','packing','per_quintal',6),
  ('post-harvest','Loading / Unloading','లోడింగ్ / అన్‌లోడింగ్','loading-unloading','per_task',7),
  ('irrigation','Borewell Support','బోరుబావి సహాయం','borewell-support','quote',1),
  ('irrigation','Pump Rental','పంపు అద్దె','pump-rental','per_day',2),
  ('irrigation','Water Tanker','నీటి ట్యాంకర్','water-tanker','per_task',3),
  ('irrigation','Irrigation Equipment Rental','నీటిపారుదల పరికరాల అద్దె','irrigation-equipment','per_day',4),
  ('irrigation','Drip Irrigation Installation','డ్రిప్ ఇరిగేషన్ ఏర్పాటు','drip-installation','per_acre',5),
  ('irrigation','Sprinkler Installation','స్ప్రింక్లర్ ఏర్పాటు','sprinkler-installation','per_acre',6),
  ('irrigation','Irrigation Maintenance','నీటిపారుదల నిర్వహణ','irrigation-maintenance','quote',7),
  ('soil-testing','Soil Sample Collection','మట్టి నమూనా సేకరణ','soil-sample-collection','per_task',1),
  ('soil-testing','Soil Laboratory Testing','ల్యాబ్ మట్టి పరీక్ష','soil-lab-testing','per_task',2),
  ('soil-testing','pH Testing','pH పరీక్ష','ph-testing','per_task',3),
  ('soil-testing','Nutrient Testing','పోషకాల పరీక్ష','nutrient-testing','per_task',4),
  ('soil-testing','Organic Matter Testing','సేంద్రియ పదార్థ పరీక్ష','organic-matter-testing','per_task',5),
  ('soil-testing','Basic Soil Health Report','ప్రాథమిక మట్టి ఆరోగ్య నివేదిక','soil-health-report','per_task',6),
  ('equipment-rental','Tractor','ట్రాక్టర్','rent-tractor','per_day',1),
  ('equipment-rental','Rotavator','రోటవేటర్','rent-rotavator','per_day',2),
  ('equipment-rental','Cultivator','కల్టివేటర్','rent-cultivator','per_day',3),
  ('equipment-rental','Harvester','హార్వెస్టర్','rent-harvester','per_day',4),
  ('equipment-rental','Thresher','థ్రెషర్','rent-thresher','per_day',5),
  ('equipment-rental','Sprayer','స్ప్రేయర్','rent-sprayer','per_day',6),
  ('equipment-rental','Seed Drill','సీడ్ డ్రిల్','rent-seed-drill','per_day',7),
  ('equipment-rental','Water Pump','నీటి పంపు','rent-water-pump','per_day',8),
  ('equipment-rental','Chaff Cutter','గడ్డి కత్తిరించు యంత్రం','rent-chaff-cutter','per_day',9),
  ('transport','Tractor Transport','ట్రాక్టర్ రవాణా','tractor-transport','quote',1),
  ('transport','Mini Truck','మినీ ట్రక్','mini-truck','quote',2),
  ('transport','Pickup Vehicle','పికప్ వాహనం','pickup-vehicle','quote',3),
  ('transport','Farm Produce Transport','పంట ఉత్పత్తుల రవాణా','produce-transport','quote',4),
  ('transport','Equipment Transport','పరికరాల రవాణా','equipment-transport','quote',5),
  ('transport','Loading / Unloading Support','లోడింగ్ సహాయం','transport-loading','per_task',6),
  ('expert','Crop Consultation','పంట సలహా','crop-consultation','per_task',1),
  ('expert','Soil Consultation','మట్టి సలహా','soil-consultation','per_task',2),
  ('expert','Irrigation Consultation','నీటిపారుదల సలహా','irrigation-consultation','per_task',3),
  ('expert','Organic Farming Consultation','సేంద్రియ వ్యవసాయ సలహా','organic-consultation','per_task',4),
  ('expert','Pest Management Guidance','చీడపీడల నిర్వహణ సలహా','pest-management','per_task',5),
  ('expert','Farm Planning','వ్యవసాయ ప్రణాళిక','farm-planning','per_task',6)
) AS v(cat_slug, name, name_te, slug, pricing_type, ord) ON c.slug = v.cat_slug;