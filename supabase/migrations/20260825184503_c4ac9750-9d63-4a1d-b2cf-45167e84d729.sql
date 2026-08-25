CREATE TABLE IF NOT EXISTS public.pqrs (
    id BIGSERIAL PRIMARY KEY,
    zoho_id TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    subject TEXT,
    description TEXT,
    status TEXT,
    zoho_created_time TIMESTAMP WITH TIME ZONE,
    zoho_modified_time TIMESTAMP WITH TIME ZONE,
    migrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pqrs TO authenticated;
GRANT ALL ON public.pqrs TO service_role;

ALTER TABLE public.pqrs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read all pqrs"
    ON public.pqrs
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role can manage pqrs"
    ON public.pqrs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_pqrs_zoho_id ON public.pqrs (zoho_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pqrs_updated_at
    BEFORE UPDATE ON public.pqrs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();