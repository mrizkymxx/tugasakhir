-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_records ENABLE ROW LEVEL SECURITY;

-- users policies
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all for superadmin" ON public.users FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'superadmin')
);

-- orders policies
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for ppic and superadmin" ON public.orders FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ppic', 'superadmin'))
);
CREATE POLICY "Enable update for ppic and superadmin" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ppic', 'superadmin'))
);

-- order_photos policies
CREATE POLICY "Enable read access for all users" ON public.order_photos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for ppic and superadmin" ON public.order_photos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ppic', 'superadmin'))
);

-- order_items policies
CREATE POLICY "Enable read access for all users" ON public.order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert and update for ppic and superadmin" ON public.order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ppic', 'superadmin'))
);
-- Wait, we need QC to trigger update on order_items via trigger. 
-- Triggers run with the privileges of the owner of the trigger, but for RLS, if the role doing the INSERT on qc_records 
-- does not have UPDATE on order_items, it might fail IF the trigger runs as user?
-- No, PostgreSQL triggers run as the user executing the statement. RLS policies apply.
-- So we need to give QC roles UPDATE access to order_items, OR use SECURITY DEFINER in the trigger function.
-- I already appended 'SECURITY DEFINER' ? No, I didn't in schema.sql. 
-- For safety, I'll allow 'qc' to update order_items here, or we can just alter the trigger to SECURITY DEFINER. Let's allow QC.
CREATE POLICY "Enable update for qc" ON public.order_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('qc'))
);

-- qc_records policies
CREATE POLICY "Enable read access for all users" ON public.qc_records FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for qc and superadmin" ON public.qc_records FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('qc', 'superadmin'))
);

-- Allow qc to update orders too because of the trigger
CREATE POLICY "Enable update for qc on orders for trigger" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('qc'))
);
