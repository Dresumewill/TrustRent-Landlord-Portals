-- ============================================================
-- TrustRent — Initial Schema
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────────────────────────

create type user_role            as enum ('tenant', 'landlord', 'admin');
create type verification_status  as enum ('unverified', 'pending', 'verified', 'rejected');
create type property_status      as enum ('draft', 'active', 'rented', 'archived');
create type property_type        as enum ('apartment', 'house', 'studio', 'room', 'commercial');
create type application_status   as enum ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn');
create type transaction_type     as enum ('rent', 'deposit', 'refund', 'fee');
create type transaction_status   as enum ('pending', 'held_in_escrow', 'completed', 'failed', 'refunded');

-- ──────────────────────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────────────────────

create table public.users (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null unique,
  full_name           text,
  avatar_url          text,
  phone               text,
  role                user_role not null default 'tenant',
  verification_status verification_status not null default 'unverified',
  trust_score         numeric(4,2) default 0.00 check (trust_score >= 0 and trust_score <= 5),
  bio                 text,
  address_line1       text,
  address_line2       text,
  city                text,
  state               text,
  country             text default 'NG',
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- PROPERTIES
-- ──────────────────────────────────────────────────────────────

create table public.properties (
  id              uuid primary key default uuid_generate_v4(),
  landlord_id     uuid not null references public.users(id) on delete cascade,
  title           text not null,
  description     text,
  property_type   property_type not null default 'apartment',
  status          property_status not null default 'draft',
  address_line1   text not null,
  address_line2   text,
  city            text not null,
  state           text not null,
  country         text not null default 'NG',
  latitude        numeric(10,7),
  longitude       numeric(10,7),
  rent_amount     numeric(12,2) not null check (rent_amount > 0),
  currency        char(3) not null default 'NGN',
  deposit_amount  numeric(12,2) default 0,
  bedrooms        smallint default 0 check (bedrooms >= 0),
  bathrooms       smallint default 0 check (bathrooms >= 0),
  size_sqm        numeric(8,2),
  is_furnished    boolean not null default false,
  allows_pets     boolean not null default false,
  images          text[] default '{}',
  is_verified     boolean not null default false,
  verified_at     timestamptz,
  verified_by     uuid references public.users(id),
  available_from  date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_properties_landlord  on public.properties(landlord_id);
create index idx_properties_status    on public.properties(status);
create index idx_properties_city      on public.properties(city);
create index idx_properties_available on public.properties(available_from);

-- ──────────────────────────────────────────────────────────────
-- APPLICATIONS
-- ──────────────────────────────────────────────────────────────

create table public.applications (
  id                   uuid primary key default uuid_generate_v4(),
  property_id          uuid not null references public.properties(id) on delete cascade,
  tenant_id            uuid not null references public.users(id) on delete cascade,
  status               application_status not null default 'submitted',
  employment_status    text,
  monthly_income       numeric(12,2),
  num_occupants        smallint default 1 check (num_occupants > 0),
  move_in_date         date,
  message              text,
  landlord_note        text,
  reviewed_at          timestamptz,
  trust_score_at_apply numeric(4,2),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (property_id, tenant_id)
);

create index idx_applications_property on public.applications(property_id);
create index idx_applications_tenant   on public.applications(tenant_id);
create index idx_applications_status   on public.applications(status);

-- ──────────────────────────────────────────────────────────────
-- TRANSACTIONS
-- ──────────────────────────────────────────────────────────────

create table public.transactions (
  id                  uuid primary key default uuid_generate_v4(),
  application_id      uuid references public.applications(id) on delete set null,
  property_id         uuid not null references public.properties(id) on delete restrict,
  payer_id            uuid not null references public.users(id) on delete restrict,
  payee_id            uuid not null references public.users(id) on delete restrict,
  transaction_type    transaction_type not null,
  status              transaction_status not null default 'pending',
  amount              numeric(12,2) not null check (amount > 0),
  currency            char(3) not null default 'NGN',
  platform_fee        numeric(12,2) not null default 0,
  reference           text unique,
  provider            text,
  provider_response   jsonb,
  escrow_released_at  timestamptz,
  period_start        date,
  period_end          date,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_transactions_payer    on public.transactions(payer_id);
create index idx_transactions_payee    on public.transactions(payee_id);
create index idx_transactions_property on public.transactions(property_id);
create index idx_transactions_status   on public.transactions(status);

-- ──────────────────────────────────────────────────────────────
-- REVIEWS
-- ──────────────────────────────────────────────────────────────

create table public.reviews (
  id            uuid primary key default uuid_generate_v4(),
  reviewer_id   uuid not null references public.users(id) on delete cascade,
  reviewee_id   uuid not null references public.users(id) on delete cascade,
  property_id   uuid references public.properties(id) on delete set null,
  rating        smallint not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz not null default now(),
  unique (reviewer_id, reviewee_id, property_id)
);

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────

alter table public.users         enable row level security;
alter table public.properties    enable row level security;
alter table public.applications  enable row level security;
alter table public.transactions  enable row level security;
alter table public.reviews       enable row level security;

-- Users
create policy "Public profiles are viewable by everyone"
  on public.users for select using (true);

create policy "Users can update their own profile"
  on public.users for update using (auth.uid() = id);

-- Properties
create policy "Active properties are publicly viewable"
  on public.properties for select using (status = 'active' or landlord_id = auth.uid());

create policy "Landlords can insert their own properties"
  on public.properties for insert with check (landlord_id = auth.uid());

create policy "Landlords can update their own properties"
  on public.properties for update using (landlord_id = auth.uid());

create policy "Landlords can delete their own properties"
  on public.properties for delete using (landlord_id = auth.uid());

-- Applications
create policy "Tenants can view their own applications"
  on public.applications for select using (tenant_id = auth.uid());

create policy "Landlords can view applications for their properties"
  on public.applications for select using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.landlord_id = auth.uid()
    )
  );

create policy "Tenants can submit applications"
  on public.applications for insert with check (tenant_id = auth.uid());

create policy "Tenants can withdraw their own applications"
  on public.applications for update using (tenant_id = auth.uid());

create policy "Landlords can review applications for their properties"
  on public.applications for update using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.landlord_id = auth.uid()
    )
  );

-- Transactions
create policy "Parties can view their own transactions"
  on public.transactions for select using (payer_id = auth.uid() or payee_id = auth.uid());

-- Reviews
create policy "Reviews are publicly viewable"
  on public.reviews for select using (true);

create policy "Authenticated users can leave a review"
  on public.reviews for insert with check (reviewer_id = auth.uid());

-- ──────────────────────────────────────────────────────────────
-- TRIGGERS
-- ──────────────────────────────────────────────────────────────

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'tenant')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at        before update on public.users        for each row execute procedure public.set_updated_at();
create trigger properties_updated_at   before update on public.properties   for each row execute procedure public.set_updated_at();
create trigger applications_updated_at before update on public.applications for each row execute procedure public.set_updated_at();
create trigger transactions_updated_at before update on public.transactions for each row execute procedure public.set_updated_at();

-- Recompute trust_score on review insert
create or replace function public.update_trust_score()
returns trigger language plpgsql as $$
begin
  update public.users
  set trust_score = (
    select round(avg(rating)::numeric, 2)
    from public.reviews
    where reviewee_id = new.reviewee_id
  )
  where id = new.reviewee_id;
  return new;
end;
$$;

create trigger after_review_insert
  after insert on public.reviews
  for each row execute procedure public.update_trust_score();
