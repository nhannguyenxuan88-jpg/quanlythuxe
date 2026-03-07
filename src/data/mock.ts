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
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: BookingStatus;
}

export const initialCars: Car[] = [
  {
    id: 'c1',
    plate: '30G-123.45',
    brand: 'Toyota',
    model: 'Vios',
    year: 2022,
    status: 'available',
    pricePerDay: 600000,
    image: 'https://picsum.photos/seed/vios/400/300',
  },
  {
    id: 'c2',
    plate: '51H-987.65',
    brand: 'Honda',
    model: 'City',
    year: 2023,
    status: 'rented',
    pricePerDay: 700000,
    image: 'https://picsum.photos/seed/city/400/300',
  },
  {
    id: 'c3',
    plate: '43A-456.78',
    brand: 'Mazda',
    model: '3',
    year: 2021,
    status: 'available',
    pricePerDay: 800000,
    image: 'https://picsum.photos/seed/mazda3/400/300',
  },
  {
    id: 'c4',
    plate: '15K-111.22',
    brand: 'Kia',
    model: 'Cerato',
    year: 2020,
    status: 'maintenance',
    pricePerDay: 650000,
    image: 'https://picsum.photos/seed/cerato/400/300',
  },
  {
    id: 'c5',
    plate: '60A-333.44',
    brand: 'Hyundai',
    model: 'Accent',
    year: 2022,
    status: 'available',
    pricePerDay: 600000,
    image: 'https://picsum.photos/seed/accent/400/300',
  },
];

export const initialBookings: Booking[] = [
  {
    id: 'b1',
    carId: 'c2',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 2100000,
    status: 'active',
  },
  {
    id: 'b2',
    carId: 'c1',
    customerName: 'Trần Thị B',
    customerPhone: '0987654321',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 2400000,
    status: 'completed',
  },
];
