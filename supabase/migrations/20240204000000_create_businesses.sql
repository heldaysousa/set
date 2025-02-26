-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text,
    phone text,
    employees text,
    goals text,
    challenges text,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Businesses can be viewed by owner"
    ON public.businesses FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Businesses can be updated by owner"
    ON public.businesses FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Businesses can be deleted by owner"
    ON public.businesses FOR DELETE
    USING (auth.uid() = owner_id);

CREATE POLICY "Businesses can be inserted by authenticated users"
    ON public.businesses FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
