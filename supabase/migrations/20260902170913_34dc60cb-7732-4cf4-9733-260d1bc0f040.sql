
-- ROLES
CREATE TYPE public.app_role AS ENUM ('farmer','labourer','seller','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  mobile text,
  email text,
  language text NOT NULL DEFAULT 'te',
  profile_image text,
  state text,
  district text,
  mandal text,
  village text,
  verification_status text NOT NULL DEFAULT 'pending',
  status text NOT NULL DEFAULT 'active',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "profiles readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles readable" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "own role insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND role <> 'admin');

-- signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, mobile)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email, NEW.raw_user_meta_data->>'mobile')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ROLE DETAIL PROFILES
CREATE TABLE public.farmer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_size numeric,
  crops text[] NOT NULL DEFAULT '{}',
  farming_type text,
  farm_location text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farmer_profiles TO authenticated;
GRANT SELECT ON public.farmer_profiles TO anon;
GRANT ALL ON public.farmer_profiles TO service_role;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "farmer profiles readable" ON public.farmer_profiles FOR SELECT USING (true);
CREATE POLICY "own farmer profile" ON public.farmer_profiles FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.labour_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills text[] NOT NULL DEFAULT '{}',
  crops_experience text[] NOT NULL DEFAULT '{}',
  experience_years numeric NOT NULL DEFAULT 0,
  preferred_wage numeric,
  wage_type text NOT NULL DEFAULT 'per_day',
  availability text NOT NULL DEFAULT 'available',
  preferred_radius_km numeric NOT NULL DEFAULT 10,
  rating numeric NOT NULL DEFAULT 0,
  completed_jobs integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.labour_profiles TO authenticated;
GRANT SELECT ON public.labour_profiles TO anon;
GRANT ALL ON public.labour_profiles TO service_role;
ALTER TABLE public.labour_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "labour profiles readable" ON public.labour_profiles FOR SELECT USING (true);
CREATE POLICY "own labour profile" ON public.labour_profiles FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.seller_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text,
  description text,
  verification_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seller_profiles TO authenticated;
GRANT SELECT ON public.seller_profiles TO anon;
GRANT ALL ON public.seller_profiles TO service_role;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller profiles readable" ON public.seller_profiles FOR SELECT USING (true);
CREATE POLICY "own seller profile" ON public.seller_profiles FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid());

-- LABOUR JOBS
CREATE TABLE public.labour_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  crop text,
  workers_required integer NOT NULL DEFAULT 1,
  work_date date,
  duration text,
  wage numeric NOT NULL,
  wage_type text NOT NULL DEFAULT 'per_day',
  state text, district text, mandal text, village text,
  description text,
  accommodation boolean NOT NULL DEFAULT false,
  food boolean NOT NULL DEFAULT false,
  contact_preference text NOT NULL DEFAULT 'in_app',
  status text NOT NULL DEFAULT 'open',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.labour_jobs TO authenticated;
GRANT SELECT ON public.labour_jobs TO anon;
GRANT ALL ON public.labour_jobs TO service_role;
ALTER TABLE public.labour_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs readable" ON public.labour_jobs FOR SELECT USING (true);
CREATE POLICY "farmer manages own jobs" ON public.labour_jobs FOR ALL TO authenticated USING (farmer_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (farmer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.labour_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.labour_jobs(id) ON DELETE CASCADE,
  labourer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'applied',
  applied_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, labourer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.labour_applications TO authenticated;
GRANT ALL ON public.labour_applications TO service_role;
ALTER TABLE public.labour_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications visible to parties" ON public.labour_applications FOR SELECT TO authenticated
  USING (labourer_id = auth.uid() OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.labour_jobs j WHERE j.id = job_id AND j.farmer_id = auth.uid()));
CREATE POLICY "labourer applies" ON public.labour_applications FOR INSERT TO authenticated WITH CHECK (labourer_id = auth.uid());
CREATE POLICY "parties update application" ON public.labour_applications FOR UPDATE TO authenticated
  USING (labourer_id = auth.uid() OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.labour_jobs j WHERE j.id = job_id AND j.farmer_id = auth.uid()));
CREATE POLICY "labourer withdraws" ON public.labour_applications FOR DELETE TO authenticated USING (labourer_id = auth.uid());

-- CATEGORIES & PRODUCTS
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_te text,
  type text NOT NULL,
  slug text NOT NULL UNIQUE
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories readable" ON public.categories FOR SELECT USING (true);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id),
  name text NOT NULL,
  name_te text,
  description text,
  benefits text,
  usage_instructions text,
  price numeric NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  stock numeric NOT NULL DEFAULT 0,
  images text[] NOT NULL DEFAULT '{}',
  location text,
  rating numeric NOT NULL DEFAULT 0,
  approval_status text NOT NULL DEFAULT 'pending',
  status text NOT NULL DEFAULT 'active',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved products readable" ON public.products FOR SELECT
  USING (approval_status = 'approved' AND status = 'active');
CREATE POLICY "seller reads own products" ON public.products FOR SELECT TO authenticated
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "seller manages products" ON public.products FOR ALL TO authenticated
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (seller_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- CART
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart" ON public.cart_items FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  discount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cod',
  payment_status text NOT NULL DEFAULT 'pending',
  order_status text NOT NULL DEFAULT 'pending',
  address text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "create own order" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update own order" ON public.orders FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  seller_id uuid,
  product_name text NOT NULL,
  quantity numeric NOT NULL,
  price numeric NOT NULL
);
GRANT SELECT, INSERT, UPDATE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items visible" ON public.order_items FOR SELECT TO authenticated
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(),'admin')
    OR EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "insert own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "seller updates order items" ON public.order_items FOR UPDATE TO authenticated
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- INSURANCE
CREATE TABLE public.insurance_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  scheme_name text,
  crop text NOT NULL,
  state text NOT NULL,
  season text,
  coverage text,
  premium_info text,
  conditions text,
  policy_period text,
  provider_url text,
  provider_contact text,
  is_demo boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active'
);
GRANT SELECT ON public.insurance_options TO anon, authenticated;
GRANT ALL ON public.insurance_options TO service_role;
ALTER TABLE public.insurance_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insurance options readable" ON public.insurance_options FOR SELECT USING (status = 'active');

CREATE TABLE public.insurance_support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code text NOT NULL DEFAULT ('RS-' || upper(substr(md5(random()::text),1,6))),
  user_id uuid NOT NULL,
  provider text,
  crop text,
  policy_number text,
  category text NOT NULL,
  description text NOT NULL,
  attachments text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  admin_response text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.insurance_support_tickets TO authenticated;
GRANT ALL ON public.insurance_support_tickets TO service_role;
ALTER TABLE public.insurance_support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tickets" ON public.insurance_support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "create own ticket" ON public.insurance_support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "update ticket" ON public.insurance_support_tickets FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- REVIEWS / COMPLAINTS / NOTIFICATIONS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL,
  target_user_id uuid,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.labour_jobs(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published reviews readable" ON public.reviews FOR SELECT USING (status = 'published');
CREATE POLICY "create own review" ON public.reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "update own review" ON public.reviews FOR UPDATE TO authenticated USING (reviewer_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  category text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own complaints" ON public.complaints FOR SELECT TO authenticated USING (reporter_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "create complaint" ON public.complaints FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY "update complaint" ON public.complaints FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'general',
  read_status boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (true);

-- DEMO DATA
INSERT INTO public.categories (name, name_te, type, slug) VALUES
 ('Vegetables','కూరగాయలు','market','vegetables'),
 ('Eggs','గుడ్లు','market','eggs'),
 ('Chicken','చికెన్','market','chicken'),
 ('Organic Seeds','సేంద్రియ విత్తనాలు','organic','organic-seeds'),
 ('Natural Fertilizers','సహజ ఎరువులు','organic','natural-fertilizers');

INSERT INTO public.profiles (id, full_name, mobile, state, district, mandal, village, verification_status, is_demo) VALUES
 ('11111111-1111-1111-1111-111111111111','Ramesh Reddy (Demo)','+91 90000 00001','Telangana','Warangal','Hasanparthy','Damera','verified',true),
 ('11111111-1111-1111-1111-111111111112','Srinivas Rao (Demo)','+91 90000 00002','Telangana','Khammam','Kusumanchi','Bachodu','verified',true),
 ('11111111-1111-1111-1111-111111111113','Lakshmi Devi (Demo)','+91 90000 00003','Andhra Pradesh','Guntur','Tadikonda','Pedakakani','verified',true),
 ('22222222-2222-2222-2222-222222222221','Ravi Kumar (Demo)','+91 90000 00011','Telangana','Warangal','Hasanparthy','Damera','verified',true),
 ('22222222-2222-2222-2222-222222222222','Suresh Naik (Demo)','+91 90000 00012','Telangana','Warangal','Parkal','Nagaram','verified',true),
 ('22222222-2222-2222-2222-222222222223','Kumar Yadav (Demo)','+91 90000 00013','Andhra Pradesh','Guntur','Tadikonda','Pedakakani','verified',true),
 ('33333333-3333-3333-3333-333333333331','Anitha Agri Store (Demo)','+91 90000 00021','Telangana','Warangal','Hanamkonda','Hanamkonda','verified',true),
 ('33333333-3333-3333-3333-333333333332','Green Earth Organics (Demo)','+91 90000 00022','Andhra Pradesh','Guntur','Guntur','Guntur','verified',true);

INSERT INTO public.user_roles (user_id, role) VALUES
 ('11111111-1111-1111-1111-111111111111','farmer'),
 ('11111111-1111-1111-1111-111111111112','farmer'),
 ('11111111-1111-1111-1111-111111111113','farmer'),
 ('22222222-2222-2222-2222-222222222221','labourer'),
 ('22222222-2222-2222-2222-222222222222','labourer'),
 ('22222222-2222-2222-2222-222222222223','labourer'),
 ('33333333-3333-3333-3333-333333333331','seller'),
 ('33333333-3333-3333-3333-333333333332','seller');

INSERT INTO public.farmer_profiles (user_id, farm_size, crops, farming_type, farm_location) VALUES
 ('11111111-1111-1111-1111-111111111111',5,'{Chilli,Cotton}','mixed','Damera, Warangal'),
 ('11111111-1111-1111-1111-111111111112',3,'{Paddy}','conventional','Bachodu, Khammam'),
 ('11111111-1111-1111-1111-111111111113',2,'{Tomato,Brinjal}','organic','Pedakakani, Guntur');

INSERT INTO public.labour_profiles (user_id, skills, crops_experience, experience_years, preferred_wage, availability, preferred_radius_km, rating, completed_jobs) VALUES
 ('22222222-2222-2222-2222-222222222221','{Harvesting,Weeding}','{Chilli,Cotton}',6,600,'available',15,4.6,42),
 ('22222222-2222-2222-2222-222222222222','{Ploughing,Spraying}','{Paddy,Cotton}',9,750,'available',25,4.4,67),
 ('22222222-2222-2222-2222-222222222223','{Transplanting,Harvesting}','{Tomato,Paddy}',4,550,'busy',10,4.8,23);

INSERT INTO public.seller_profiles (user_id, business_name, business_type, verification_status) VALUES
 ('33333333-3333-3333-3333-333333333331','Anitha Agri Store (Demo)','retail','verified'),
 ('33333333-3333-3333-3333-333333333332','Green Earth Organics (Demo)','organic_inputs','verified');

INSERT INTO public.products (seller_id, category_id, name, name_te, description, price, unit, stock, location, rating, approval_status, is_demo)
SELECT '33333333-3333-3333-3333-333333333331', c.id, v.name, v.name_te, v.descr, v.price, v.unit, v.stock, 'Warangal, Telangana', v.rating, 'approved', true
FROM (VALUES
 ('Tomato','టమాటా','Fresh farm tomatoes, harvested daily.',32,'kg',400,4.3,'vegetables'),
 ('Green Chilli','పచ్చిమిర్చి','Locally grown green chillies.',58,'kg',180,4.1,'vegetables'),
 ('Brinjal','వంకాయ','Tender brinjal from nearby farms.',36,'kg',150,4.0,'vegetables'),
 ('Country Eggs','నాటు కోడి గుడ్లు','Free-range country eggs.',12,'piece',900,4.7,'eggs'),
 ('Country Chicken','నాటు కోడి','Farm-raised country chicken.',380,'kg',60,4.5,'chicken')
) AS v(name,name_te,descr,price,unit,stock,rating,slug)
JOIN public.categories c ON c.slug = v.slug;

INSERT INTO public.products (seller_id, category_id, name, name_te, description, benefits, usage_instructions, price, unit, stock, location, rating, approval_status, is_demo)
SELECT '33333333-3333-3333-3333-333333333332', c.id, v.name, v.name_te, v.descr, v.benefits, v.usage, v.price, v.unit, v.stock, 'Guntur, Andhra Pradesh', v.rating, 'approved', true
FROM (VALUES
 ('Organic Tomato Seeds','సేంద్రియ టమాటా విత్తనాలు','Open-pollinated tomato seeds.','Suited to local conditions.','Sow in nursery beds; transplant after 25-30 days.',120,'packet',200,4.4,'organic-seeds'),
 ('Organic Chilli Seeds','సేంద్రియ మిరప విత్తనాలు','Traditional chilli variety seeds.','Locally adapted variety.','Sow in prepared nursery; keep soil moist.',140,'packet',160,4.2,'organic-seeds'),
 ('Cow Dung Manure','పశువుల ఎరువు','Well-decomposed farmyard manure.','Improves soil organic matter.','Apply during land preparation.',15,'kg',5000,4.6,'natural-fertilizers'),
 ('Vermicompost','వర్మీ కంపోస్ట్','Earthworm-processed compost.','Improves soil structure and moisture retention.','Apply 2-3 tonnes per acre before sowing.',22,'kg',3000,4.5,'natural-fertilizers')
) AS v(name,name_te,descr,benefits,usage,price,unit,stock,rating,slug)
JOIN public.categories c ON c.slug = v.slug;

INSERT INTO public.labour_jobs (farmer_id, title, category, crop, workers_required, work_date, duration, wage, wage_type, state, district, mandal, village, description, accommodation, food, status, is_demo) VALUES
 ('11111111-1111-1111-1111-111111111111','Need 8 workers for chilli harvesting','harvesting','Chilli',8, CURRENT_DATE + 3,'3 days',600,'per_day','Telangana','Warangal','Hasanparthy','Damera','Chilli picking work in 5 acre field. Morning 7 AM start.',false,true,'open',true),
 ('11111111-1111-1111-1111-111111111112','Paddy transplanting workers required','transplanting','Paddy',12, CURRENT_DATE + 5,'2 days',550,'per_day','Telangana','Khammam','Kusumanchi','Bachodu','Transplanting work for 3 acres.',false,true,'open',true),
 ('11111111-1111-1111-1111-111111111113','Weeding help for tomato field','weeding','Tomato',4, CURRENT_DATE + 1,'1 day',500,'per_day','Andhra Pradesh','Guntur','Tadikonda','Pedakakani','Manual weeding, organic farm.',false,false,'open',true);

INSERT INTO public.insurance_options (provider_name, scheme_name, crop, state, season, coverage, premium_info, conditions, policy_period, provider_url, provider_contact, is_demo) VALUES
 ('Demo Insurance Provider A','Sample Kharif Crop Cover (Demo)','Chilli','Telangana','Kharif','Illustrative cover for notified perils. Actual coverage decided by the provider.','Illustrative figure only — confirm with the provider.','Enrolment window and eligibility set by the provider.','One crop season','https://pmfby.gov.in','Contact provider directly',true),
 ('Demo Insurance Provider B','Sample Paddy Cover (Demo)','Paddy','Telangana','Kharif','Illustrative cover for yield loss. Actual coverage decided by the provider.','Illustrative figure only — confirm with the provider.','Loss intimation timelines set by the provider.','One crop season','https://pmfby.gov.in','Contact provider directly',true),
 ('Demo Insurance Provider C','Sample Horticulture Cover (Demo)','Tomato','Andhra Pradesh','Rabi','Illustrative cover for notified perils. Actual coverage decided by the provider.','Illustrative figure only — confirm with the provider.','Eligibility determined by the provider.','One crop season','https://pmfby.gov.in','Contact provider directly',true);
