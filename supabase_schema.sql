-- Khởi tạo extension UUID nếu chưa có
create extension if not exists "uuid-ossp";

-- Định nghĩa các ENUM cho trạng thái
DO $$ BEGIN
    CREATE TYPE public.car_status AS ENUM ('available', 'rented', 'maintenance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.booking_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Bảng quản lý xe (cars)
create table if not exists public.cars (
    id uuid default uuid_generate_v4() primary key,
    plate text not null unique,
    brand text not null,
    model text not null,
    year integer not null,
    status public.car_status default 'available'::public.car_status not null,
    price_per_day numeric not null,
    image text,
    type text,
    color text,
    engine_number text,
    frame_number text,
    seats integer,
    owner_name text,
    owner_address text,
    inspection_number text,
    inspection_provider text,
    inspection_date text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Bảng đơn thuê xe (bookings)
create table if not exists public.bookings (
    id uuid default uuid_generate_v4() primary key,
    car_id uuid references public.cars(id) on delete restrict not null,
    customer_name text not null,
    customer_phone text not null,
    customer_year_of_birth text,
    customer_cccd text,
    customer_cccd_date text,
    customer_cccd_place text,
    customer_address text,
    customer_license_class text,
    customer_license_number text,
    customer_license_expiry text,
    rental_purpose text,
    payment_method text,
    payment_date text,
    deposit_amount numeric,
    contract_location text,
    customer_id_front text, -- Ảnh mặt trước CCCD
    customer_id_back text, -- Ảnh mặt sau CCCD
    customer_license_front text, -- Ảnh mặt trước GPLX
    customer_license_back text, -- Ảnh mặt sau GPLX
    contract_url text, -- Link lưu trữ bản sao Hợp Đồng (Ảnh/PDF)
    start_date timestamp with time zone not null,
    end_date timestamp with time zone not null,
    total_amount numeric not null,
    status public.booking_status default 'active'::public.booking_status not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cầu hình Trigger để tự động cập nhật trường `updated_at` mỗi khi sửa dữ liệu
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_updated_at_cars on public.cars;
create trigger handle_updated_at_cars
  before update on public.cars
  for each row
  execute function public.handle_updated_at();

drop trigger if exists handle_updated_at_bookings on public.bookings;
create trigger handle_updated_at_bookings
  before update on public.bookings
  for each row
  execute function public.handle_updated_at();

-- Khởi tạo Row Level Security (RLS) cho Supabase
alter table public.cars enable row level security;
alter table public.bookings enable row level security;

-- Thiết lập Policies (Phân quyền cơ bản: Cho phép đọc/ghi đối với tất cả)
-- (Nếu có hệ thống Auth đăng nhập, hãy đổi `true` thành `auth.role() = 'authenticated'`)
drop policy if exists "Cho phép tất cả thao tác trên Cars" on public.cars;
create policy "Cho phép tất cả thao tác trên Cars" on public.cars for all using (true);
drop policy if exists "Cho phép tất cả thao tác trên Bookings" on public.bookings;
create policy "Cho phép tất cả thao tác trên Bookings" on public.bookings for all using (true);

-- ==========================================
-- DỮ LIỆU MẪU (Bỏ qua nếu chỉ cần tạo bảng)
-- ==========================================
insert into public.cars (id, plate, brand, model, year, status, price_per_day, image) values
  ('d1ba28b2-3c22-4820-9df7-f3161a0cb680', '30G-123.45', 'Toyota', 'Vios', 2022, 'available', 600000, 'https://picsum.photos/seed/vios/400/300'),
  ('d88b4883-9366-4e12-b2fd-bd42f36ca55e', '51H-987.65', 'Honda', 'City', 2023, 'rented', 700000, 'https://picsum.photos/seed/city/400/300'),
  ('3b4d4a8e-5fa2-4217-a0f5-5a5fbc08e312', '43A-456.78', 'Mazda', '3', 2021, 'available', 800000, 'https://picsum.photos/seed/mazda3/400/300')
on conflict (id) do nothing;

-- ==========================================
-- SUPABASE STORAGE (Lưu trữ hình ảnh)
-- ==========================================
insert into storage.buckets (id, name, public) values ('car_images', 'car_images', true)
on conflict (id) do nothing;

drop policy if exists "Cho phép mọi người tải ảnh xe" on storage.objects;
create policy "Cho phép mọi người tải ảnh xe" on storage.objects 
  for insert with check ( bucket_id = 'car_images' );

drop policy if exists "Cho phép mọi người xem ảnh xe" on storage.objects;
create policy "Cho phép mọi người xem ảnh xe" on storage.objects 
  for select using ( bucket_id = 'car_images' );
  
drop policy if exists "Cho phép quản trị xóa ảnh xe" on storage.objects;
create policy "Cho phép quản trị xóa ảnh xe" on storage.objects 
  for delete using ( bucket_id = 'car_images' );

-- Bucket lưu trữ tài liệu hợp đồng & CCCD
insert into storage.buckets (id, name, public) values ('booking_documents', 'booking_documents', true)
on conflict (id) do nothing;

drop policy if exists "Cho phép mọi người tải tài liệu" on storage.objects;
create policy "Cho phép mọi người tải tài liệu" on storage.objects 
  for insert with check ( bucket_id = 'booking_documents' );

drop policy if exists "Cho phép mọi người xem tài liệu" on storage.objects;
create policy "Cho phép mọi người xem tài liệu" on storage.objects 
  for select using ( bucket_id = 'booking_documents' );
  
drop policy if exists "Cho phép quản trị xóa tài liệu" on storage.objects;
create policy "Cho phép quản trị xóa tài liệu" on storage.objects 
  for delete using ( bucket_id = 'booking_documents' );
