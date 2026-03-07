import { Car, CheckCircle2, AlertCircle, Wrench, TrendingUp, Users, Clock, AlertTriangle, Calendar } from 'lucide-react';
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

  const activeBookings = bookings.filter(b => b.status === 'active');
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Monthly revenue (completed bookings this month)
  const monthlyRevenue = bookings
    .filter(b => {
      if (b.status !== 'completed') return false;
      const d = new Date(b.endDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Total all-time revenue
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  // Overdue bookings (endDate < now & still active)
  const overdueBookings = activeBookings.filter(b => new Date(b.endDate) < now);

  // Expiring soon (endDate within next 2 days)
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const expiringSoon = activeBookings.filter(b => {
    const end = new Date(b.endDate);
    return end >= now && end <= twoDaysLater;
  });

  // Revenue chart: last 6 months
  const revenueByMonth: { label: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const amount = bookings
      .filter(b => {
        if (b.status !== 'completed') return false;
        const bd = new Date(b.endDate);
        return bd.getMonth() === m && bd.getFullYear() === y;
      })
      .reduce((sum, b) => sum + b.totalAmount, 0);
    revenueByMonth.push({
      label: `T${m + 1}/${String(y).slice(2)}`,
      amount
    });
  }
  const maxRevenue = Math.max(...revenueByMonth.map(r => r.amount), 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}tr`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
    return `${amount}`;
  };

  const stats = [
    { label: 'Tổng số xe', value: totalCars, icon: Car, color: 'bg-blue-500' },
    { label: 'Xe sẵn sàng', value: availableCars, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: 'Xe đang thuê', value: rentedCars, icon: AlertCircle, color: 'bg-amber-500' },
    { label: 'Đang bảo dưỡng', value: maintenanceCars, icon: Wrench, color: 'bg-rose-500' },
    { label: 'Đơn đang chạy', value: activeBookings.length, icon: Users, color: 'bg-indigo-500' },
    { label: 'Doanh thu tháng', value: formatCurrency(monthlyRevenue), icon: TrendingUp, color: 'bg-violet-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Tổng quan</h2>
        <p className="text-slate-500 mt-1">Tóm tắt tình hình kinh doanh hôm nay</p>
      </div>

      {/* Alerts */}
      {(overdueBookings.length > 0 || expiringSoon.length > 0) && (
        <div className="space-y-3">
          {overdueBookings.map(booking => {
            const car = cars.find(c => c.id === booking.carId);
            const overdueDays = Math.ceil((now.getTime() - new Date(booking.endDate).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={booking.id} className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-rose-800">
                    ⚠️ Quá hạn {overdueDays} ngày
                  </p>
                  <p className="text-sm text-rose-600 truncate">
                    {car?.brand} {car?.model} ({car?.plate}) — KH: {booking.customerName} ({booking.customerPhone})
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-rose-500">Hạn trả</p>
                  <p className="font-medium text-rose-700 text-sm">{new Date(booking.endDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            );
          })}

          {expiringSoon.map(booking => {
            const car = cars.find(c => c.id === booking.carId);
            const hoursLeft = Math.ceil((new Date(booking.endDate).getTime() - now.getTime()) / (1000 * 60 * 60));
            return (
              <div key={booking.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-amber-800">
                    🔔 Sắp đến hạn trả ({hoursLeft < 24 ? `${hoursLeft}h` : `${Math.ceil(hoursLeft / 24)} ngày`})
                  </p>
                  <p className="text-sm text-amber-600 truncate">
                    {car?.brand} {car?.model} ({car?.plate}) — KH: {booking.customerName} ({booking.customerPhone})
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-amber-500">Hạn trả</p>
                  <p className="font-medium text-amber-700 text-sm">{new Date(booking.endDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Doanh thu 6 tháng</h3>
            <p className="text-sm text-slate-500">Tổng: {formatCurrency(totalRevenue)}</p>
          </div>
          <div className="flex items-end gap-3 h-40">
            {revenueByMonth.map((month, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-[10px] font-medium text-slate-500">{formatShortCurrency(month.amount)}</p>
                <div className="w-full bg-slate-100 rounded-t-lg relative overflow-hidden" style={{ height: '100%' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max((month.amount / maxRevenue) * 100, 4)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] font-medium text-slate-600">{month.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Rentals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Xe đang cho thuê</h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {activeBookings.map(booking => {
              const car = cars.find(c => c.id === booking.carId);
              return (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {car?.image ? (
                        <img src={car.image} alt={car.model} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Car className="text-slate-400" size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{car?.brand} {car?.model}</p>
                      <p className="text-xs text-slate-500 truncate">{booking.customerName} - {booking.customerPhone}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-medium text-indigo-600 text-sm">{formatCurrency(booking.totalAmount)}</p>
                    <p className="text-[10px] text-slate-500">
                      Trả: {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              );
            })}
            {activeBookings.length === 0 && (
              <p className="text-slate-500 text-center py-6 text-sm">Không có đơn thuê nào đang chạy.</p>
            )}
          </div>
        </div>
      </div>

      {/* Fleet Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Tình trạng đội xe</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-slate-700">Sẵn sàng</span>
              </div>
              <span className="font-medium text-slate-900">{availableCars}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: totalCars ? `${(availableCars / totalCars) * 100}%` : '0%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-slate-700">Đang thuê</span>
              </div>
              <span className="font-medium text-slate-900">{rentedCars}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full transition-all" style={{ width: totalCars ? `${(rentedCars / totalCars) * 100}%` : '0%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-sm text-slate-700">Bảo dưỡng</span>
              </div>
              <span className="font-medium text-slate-900">{maintenanceCars}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-rose-500 h-2 rounded-full transition-all" style={{ width: totalCars ? `${(maintenanceCars / totalCars) * 100}%` : '0%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
