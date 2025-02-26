-- Create clients table
create table public.clients (
    id uuid not null default uuid_generate_v4(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    name text not null,
    email text,
    phone text not null,
    birth_date date not null,
    instagram text,
    facebook text,
    whatsapp text,
    notes text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint clients_pkey primary key (id)
);

-- Create client_history table
create table public.client_history (
    id uuid not null default uuid_generate_v4(),
    client_id uuid not null references public.clients(id) on delete cascade,
    service_id uuid not null references public.services(id) on delete restrict,
    professional_id uuid not null references public.professionals(id) on delete restrict,
    date date not null,
    time time not null,
    duration integer not null default 30,
    value numeric(10,2) not null,
    service_name text not null,
    professional_name text not null,
    service_details text,
    status text not null default 'concluido',
    payment_method text,
    notes text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint client_history_pkey primary key (id),
    constraint client_history_status_check check (status in ('concluido', 'cancelado', 'agendado')),
    constraint client_history_payment_method_check check (payment_method in ('dinheiro', 'pix', 'credito', 'debito'))
);

-- Add RLS policies
alter table public.clients enable row level security;
alter table public.client_history enable row level security;

create policy "Users can view their business clients"
    on public.clients for select
    using (business_id in (
        select id from public.businesses
        where owner_id = auth.uid()
    ));

create policy "Users can insert their business clients"
    on public.clients for insert
    with check (business_id in (
        select id from public.businesses
        where owner_id = auth.uid()
    ));

create policy "Users can update their business clients"
    on public.clients for update
    using (business_id in (
        select id from public.businesses
        where owner_id = auth.uid()
    ));

create policy "Users can delete their business clients"
    on public.clients for delete
    using (business_id in (
        select id from public.businesses
        where owner_id = auth.uid()
    ));

create policy "Users can view their business client history"
    on public.client_history for select
    using (client_id in (
        select id from public.clients
        where business_id in (
            select id from public.businesses
            where owner_id = auth.uid()
        )
    ));

create policy "Users can insert their business client history"
    on public.client_history for insert
    with check (client_id in (
        select id from public.clients
        where business_id in (
            select id from public.businesses
            where owner_id = auth.uid()
        )
    ));

create policy "Users can update their business client history"
    on public.client_history for update
    using (client_id in (
        select id from public.clients
        where business_id in (
            select id from public.businesses
            where owner_id = auth.uid()
        )
    ));

create policy "Users can delete their business client history"
    on public.client_history for delete
    using (client_id in (
        select id from public.clients
        where business_id in (
            select id from public.businesses
            where owner_id = auth.uid()
        )
    ));
