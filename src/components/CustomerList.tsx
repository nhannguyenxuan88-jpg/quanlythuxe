import { useState } from 'react';
import { Booking } from '../data/mock';
import { Search, Phone, Mail, MapPin } from 'lucide-react';

interface CustomerListProps {
  bookings: Booking[];
}

export function CustomerList({ bookings }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique customers from bookings
  const customers = Array.from(new Map(bookings.map(b => [b.customerPhone, {
    name: b.customerName,
    phone: b.customerPhone,
    totalBookings: bookings.filter(bk => bk.customerPhone === b.customerPhone).length,
    totalSpent: bookings.filter(bk => bk.customerPhone === b.customerPhone && bk.status === 'completed').reduce((sum, bk) => sum + bk.totalAmount, 0),
    lastBooking: bookings.filter(bk => bk.customerPhone === b.customerPhone).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]?.startDate
  }])).values());

  const filteredCustomers = customers.filter(customer => {
    return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           customer.phone.includes(searchTerm);
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Khách hàng</h2>
          <p className="text-slate-500 mt-1">Quản lý thông tin khách hàng thuê xe</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm theo tên hoặc số điện thoại..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Liên hệ</th>
                <th className="p-4 font-medium text-center">Số lần thuê</th>
                <th className="p-4 font-medium text-right">Tổng chi tiêu</th>
                <th className="p-4 font-medium">Lần thuê cuối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={16} className="text-slate-400" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {customer.totalBookings}
                    </span>
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
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Không tìm thấy khách hàng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
