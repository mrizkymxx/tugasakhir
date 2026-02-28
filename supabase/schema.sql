-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users (Extension of auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'ppic', 'qc', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'on_progress' CHECK (status IN ('on_progress', 'completed', 'rework')),
    po_source TEXT, -- Info tambahan
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: order_photos (Untuk foto PO/Drawing)
CREATE TABLE IF NOT EXISTS public.order_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qc_svc', 'qc_aksesoris', 'qc_finishing', 'completed', 'rework')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: qc_records
CREATE TABLE IF NOT EXISTS public.qc_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
    stage TEXT NOT NULL CHECK (stage IN ('svc', 'aksesoris', 'finishing')),
    status TEXT NOT NULL CHECK (status IN ('pass', 'reject')),
    notes TEXT,
    qc_image_url TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to handle order item status update on QC insert
CREATE OR REPLACE FUNCTION update_order_status_on_qc()
RETURNS TRIGGER AS $$
DECLARE
    item_status TEXT;
    all_items_completed BOOLEAN;
    any_item_reject BOOLEAN;
BEGIN
    -- Update item status based on QC result
    IF NEW.status = 'reject' THEN
        UPDATE public.order_items SET status = 'rework' WHERE id = NEW.order_item_id;
    ELSIF NEW.status = 'pass' THEN
        IF NEW.stage = 'svc' THEN
            UPDATE public.order_items SET status = 'qc_aksesoris' WHERE id = NEW.order_item_id;
        ELSIF NEW.stage = 'aksesoris' THEN
            UPDATE public.order_items SET status = 'qc_finishing' WHERE id = NEW.order_item_id;
        ELSIF NEW.stage = 'finishing' THEN
            UPDATE public.order_items SET status = 'completed' WHERE id = NEW.order_item_id;
        END IF;
    END IF;

    -- Update parent order status
    SELECT bool_and(status = 'completed'), bool_or(status = 'rework')
    INTO all_items_completed, any_item_reject
    FROM public.order_items
    WHERE order_id = (SELECT order_id FROM public.order_items WHERE id = NEW.order_item_id);

    IF any_item_reject THEN
        UPDATE public.orders SET status = 'rework' WHERE id = (SELECT order_id FROM public.order_items WHERE id = NEW.order_item_id);
    ELSIF all_items_completed THEN
        UPDATE public.orders SET status = 'completed' WHERE id = (SELECT order_id FROM public.order_items WHERE id = NEW.order_item_id);
    ELSE 
        -- Set back to on_progress if it was rework but updated (for simplification, usually rework needs new QC)
        UPDATE public.orders SET status = 'on_progress' WHERE id = (SELECT order_id FROM public.order_items WHERE id = NEW.order_item_id) AND status != 'on_progress';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for QC Records
DROP TRIGGER IF EXISTS trg_update_order_status ON public.qc_records;
CREATE TRIGGER trg_update_order_status
AFTER INSERT ON public.qc_records
FOR EACH ROW
EXECUTE FUNCTION update_order_status_on_qc();

-- Trigger for basic User Creation sync from auth.users (optional but helpful)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'viewer'); -- default role viewer
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
