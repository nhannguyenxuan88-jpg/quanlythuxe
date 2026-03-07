import { useState } from 'react';
import { Booking, Car } from '../data/mock';
import { Search, Phone, X, Calendar, Car as CarIcon, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomerListProps {
  bookings: Booking[];
  cars: Car[];
}

export function CustomerList({ bookings, cars }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  // Extract unique customers from bookings with additional info
  const customers = Array.from(new Map(bookings.map(b => [b.customerPhone, {
    name: b.customerName,
    phone: b.customerPhone,
    cccd: b.customerCCCD || '',
    address: b.customerAddress || '',
    yearOfBirth: b.customerYearOfBirth || '',
    totalBookings: bookings.filter(bk => bk.customerPhone === b.customerPhone).length,
    activeBookings: bookings.filter(bk => bk.customerPhone === b.customerPhone && bk.status === 'active').length,
    totalSpent: bookings.filter(bk => bk.customerPhone === b.customerPhone && bk.status === 'completed').reduce((sum, bk) => sum + bk.totalAmount, 0),
    lastBooking: bookings.filter(bk => bk.customerPhone === b.customerPhone).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]?.startDate
  }])).values());

  const filteredCustomers = customers.filter(customer => {
    return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.cccd.includes(searchTerm);
  });

  // Get booking history for a customer
  const getCustomerHistory = (phone: string) => {
    return bookings
      .filter(b => b.customerPhone === phone)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Đang chạy';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Khách hàng</h2>
          <p className="text-slate-500 mt-1">Quản lý thông tin khách hàng thuê xe ({customers.length} khách)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, hoặc CCCD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">CCCD</th>
                <th className="p-4 font-medium">Liên hệ</th>
                <th className="p-4 font-medium text-center">Số lần thuê</th>
                <th className="p-4 font-medium text-right">Tổng chi tiêu</th>
                <th className="p-4 font-medium">Lần thuê cuối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedCustomer(customer.phone)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{customer.name}</p>
                        {customer.address && <p className="text-xs text-slate-500 truncate max-w-[200px]">{customer.address}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-600 font-mono">{customer.cccd || '—'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-medium text-sm">
                        {customer.totalBookings}
                      </span>
                      {customer.activeBookings > 0 && (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium">
                          {customer.activeBookings} đang chạy
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium text-indigo-600">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {customer.lastBooking ? new Date(customer.lastBooking).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
          {filteredCustomers.map((customer, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm cursor-pointer hover:border-indigo-200 transition-colors"
              onClick={() => setSelectedCustomer(customer.phone)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{customer.name}</p>
                  <p className="text-sm text-slate-500">{customer.phone}</p>
                </div>
                {customer.activeBookings > 0 && (
                  <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                    {customer.activeBookings} đang chạy
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{customer.totalBookings} lần thuê</span>
                <span className="font-medium text-indigo-600">{formatCurrency(customer.totalSpent)}</span>
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="text-center p-8 text-slate-500">
              Không tìm thấy khách hàng nào phù hợp.
            </div>
          )}
        </div>
      </div>

      {/* Customer History Modal */}
      {selectedCustomer && (() => {
        const history = getCustomerHistory(selectedCustomer);
        const customer = customers.find(c => c.phone === selectedCustomer);
        if (!customer) return null;
        return (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{customer.name}</h3>
                    <p className="text-sm text-slate-500">{customer.phone} {customer.cccd ? `• CCCD: ${customer.cccd}` : ''}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 border-b border-slate-100 bg-slate-50/50 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{customer.totalBookings}</p>
                  <p className="text-xs text-slate-500">Lần thuê</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600">{formatCurrency(customer.totalSpent)}</p>
                  <p className="text-xs text-slate-500">Tổng chi tiêu</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{customer.activeBookings}</p>
                  <p className="text-xs text-slate-500">Đang chạy</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h4 className="font-semibold text-slate-700 text-sm mb-2">Lịch sử thuê xe</h4>
                {history.map(booking => {
                  const car = cars.find(c => c.id === booking.carId);
                  return (
                    <div key={booking.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CarIcon size={16} className="text-slate-400" />
                          <span className="font-medium text-slate-900 text-sm">{car?.brand} {car?.model}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">{car?.plate}</span>
                        </div>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", getStatusColor(booking.status))}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(booking.startDate).toLocaleDateString('vi-VN')} → {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center gap-1 font-medium text-indigo-600">
                          <CreditCard size={12} />
                          {formatCurrency(booking.totalAmount)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
