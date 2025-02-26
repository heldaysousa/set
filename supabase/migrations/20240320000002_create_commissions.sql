-- Create commission_settings table
create table public.commission_settings (
    id uuid not null default uuid_generate_v4(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    default_percentage numeric(5,2) not null default 0,
    calculation_period text not null default 'monthly',
    payment_day integer not null default 5,
    minimum_value numeric(10,2),
    maximum_value numeric(10,2),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint commission_settings_pkey primary key (id),
    constraint commission_settings_calculation_period_check check (calculation_period in ('daily', 'weekly', 'biweekly', 'monthly')),
    constraint commission_settings_payment_day_check check (payment_day between 1 and 31)
);

-- Create commissions table
create table public.commissions (
    id uuid not null default uuid_generate_v4(),
    professional_id uuid not null references public.professionals(id) on delete cascade,
    service_id uuid not null references public.services(id) on delete cascade,
    percentage numeric(5,2),
    fixed_value numeric(10,2),
    is_percentage boolean not null default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint commissions_pkey primary key (id),
    constraint commissions_percentage_check check (percentage between 0 and 100),
    constraint commissions_fixed_value_check check (fixed_value >= 0),
    constraint commissions_value_type_check check (
        (is_percentage = true and percentage is not null and fixed_value is null) or
        (is_percentage = false and fixed_value is not null and percentage is null)
    )
);

-- Create commission_payments table
create table public.commission_payments (
    id uuid not null default uuid_generate_v4(),
    professional_id uuid not null references public.professionals(id) on delete cascade,
    period_start date not null,
    period_end date not null,
    total_services integer not null default 0,
    total_value numeric(10,2) not null default 0,
    commission_value numeric(10,2) not null default 0,
    status text not null default 'pending',
    payment_date date,
    notes text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint commission_payments_pkey primary key (id),
    constraint commission_payments_status_check check (status in ('pending', 'paid', 'cancelled')),
    constraint commission_payments_period_check check (period_end >= period_start)
);
