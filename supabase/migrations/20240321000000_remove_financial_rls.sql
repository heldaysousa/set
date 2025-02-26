-- Remove RLS from financial tables
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_payments DISABLE ROW LEVEL SECURITY;

-- Drop financial policies
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.transactions;
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.expenses;
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.goals;

-- Drop commission policies
DROP POLICY IF EXISTS "Users can view their business commission settings" ON public.commission_settings;
DROP POLICY IF EXISTS "Users can manage their business commission settings" ON public.commission_settings;
DROP POLICY IF EXISTS "Users can view their business commissions" ON public.commissions;
DROP POLICY IF EXISTS "Users can manage their business commissions" ON public.commissions;
DROP POLICY IF EXISTS "Users can view their business commission payments" ON public.commission_payments;
DROP POLICY IF EXISTS "Users can manage their business commission payments" ON public.commission_payments;
