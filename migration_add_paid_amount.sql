-- Migration: Thêm cột paid_amount vào bảng bookings
-- Chạy lệnh này trong Supabase SQL Editor nếu bảng đã tồn tại

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0;

-- Đơn hoàn thành → mặc định đã thanh toán đủ (= total_amount)
UPDATE public.bookings
SET paid_amount = total_amount
WHERE status = 'completed' AND (paid_amount IS NULL OR paid_amount = 0);

-- Đơn bị hủy → mặc định 0
UPDATE public.bookings SET paid_amount = 0 WHERE paid_amount IS NULL;
