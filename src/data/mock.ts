export type CarStatus = 'available' | 'rented' | 'maintenance';

export interface Car {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: CarStatus;
  pricePerDay: number;
  image: string;
  type?: string;          // Loại xe (VD: Ô TÔ con)
  color?: string;         // Màu sơn
  engineNumber?: string;  // Số máy
  frameNumber?: string;   // Số khung
  seats?: number;         // Số chỗ ngồi
  ownerName?: string;     // Tên chủ xe
  ownerAddress?: string;  // Địa chỉ chủ xe
  inspectionNumber?: string; // Số đăng kiểm
  inspectionProvider?: string; // Cơ quan đăng kiểm
  inspectionDate?: string;     // Ngày cấp đăng kiểm
}

export type BookingStatus = 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  carId: string;
  customerName: string;
  customerPhone: string;
  customerCCCD?: string;
  customerAddress?: string;
  customerIdFront?: string; // Ảnh mặt trước CCCD
  customerIdBack?: string;  // Ảnh mặt sau CCCD
  contractUrl?: string;     // Link lưu trữ bản sao Hợp Đồng (Ảnh/PDF)
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: BookingStatus;
}

export const initialCars: Car[] = [];

export const initialBookings: Booking[] = [];
