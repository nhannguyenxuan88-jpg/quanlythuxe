import { Car, CheckCircle2, AlertCircle, Wrench, TrendingUp, Users } from 'lucide-react';
import { Car as CarType, Booking } from '../data/mock';

interface DashboardProps {
  cars: CarType[];
  bookings: Booking[];
}

export function Dashboard({ cars, bookings }: DashboardProps) {
  const totalCars = cars.length;
  const availableCars = cars.filter(c => c.status === 'available').length;
  const rentedCars = cars.filter(c => c.status === 'rented').length;
  const maintenanceCars = cars.filter(c => c.status === 'maintenance').length;

  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const stats = [
    { label: 'Tổng số xe', value: totalCars, icon: Car, color: 'bg-blue-500' },
    { label: 'Xe sẵn sàng', value: availableCars, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Xe đang thuê', value: rentedCars, icon: AlertCircle, color: 'bg-amber-500' },
    { label: 'Đang bảo dưỡng', value: maintenanceCars, icon: Wrench, color: 'bg-rose-500' },
    { label: 'Đơn đang chạy', value: activeBookings, icon: Users, color: 'bg-indigo-500' },
    { label: 'Doanh thu (tháng)', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'bg-violet-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tổng quan</h2>
        <p className="text-slate-500 mt-1">Tóm tắt tình hình kinh doanh hôm nay</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Xe đang cho thuê gần đây</h3>
          <div className="space-y-4">
            {bookings.filter(b => b.status === 'active').map(booking => {
              const car = cars.find(c => c.id === booking.carId);
              return (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                      {car?.image ? (
                        <img src={car.image} alt={car.model} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Car className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{car?.brand} {car?.model}</p>
                      <p className="text-sm text-slate-500">{booking.customerName} - {booking.customerPhone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-indigo-600">{formatCurrency(booking.totalAmount)}</p>
                    <p className="text-xs text-slate-500">
                      Trả xe: {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              );
            })}
            {bookings.filter(b => b.status === 'active').length === 0 && (
              <p className="text-slate-500 text-center py-4">Không có đơn thuê nào đang chạy.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Tình trạng đội xe</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-700">Sẵn sàng</span>
              </div>
              <span className="font-medium text-slate-900">{availableCars}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(availableCars / totalCars) * 100}%` }}></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-slate-700">Đang thuê</span>
              </div>
              <span className="font-medium text-slate-900">{rentedCars}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(rentedCars / totalCars) * 100}%` }}></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-slate-700">Bảo dưỡng</span>
              </div>
              <span className="font-medium text-slate-900">{maintenanceCars}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${(maintenanceCars / totalCars) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
