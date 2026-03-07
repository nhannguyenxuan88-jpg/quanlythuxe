import { useState } from 'react';
import { Booking, Car as CarType, BookingStatus } from '../data/mock';
import { Plus, Search, Filter, Calendar as CalendarIcon, MoreVertical, Edit, Trash2, Printer, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BookingForm } from './BookingForm';
import { ContractPreview } from './ContractPreview';

interface BookingListProps {
  bookings: Booking[];
  cars: CarType[];
  onAddBooking: (booking: Omit<Booking, 'id'>) => void;
  onUpdateBooking: (id: string, booking: Partial<Booking>) => void;
  onDeleteBooking: (id: string) => void;
}

export function BookingList({ bookings, cars, onAddBooking, onUpdateBooking, onDeleteBooking }: BookingListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [printingBooking, setPrintingBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter(booking => {
    const car = cars.find(c => c.id === booking.carId);
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          booking.customerPhone.includes(searchTerm) ||
                          (car && (car.plate.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   car.model.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'active': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'active': return 'Đang chạy';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const handlePrintExisting = (booking: Booking) => {
    setPrintingBooking(booking);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Đơn thuê xe</h2>
          <p className="text-slate-500 mt-1">Quản lý các hợp đồng cho thuê</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Tạo đơn mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm theo khách hàng, SĐT, biển số xe..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
              className="pl-10 pr-8 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang chạy</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-medium">Khách hàng</th>
                <th className="p-4 font-medium">Xe thuê</th>
                <th className="p-4 font-medium">Thời gian</th>
                <th className="p-4 font-medium">Tổng tiền</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => {
                const car = cars.find(c => c.id === booking.carId);
                const days = Math.max(1, differenceInDays(new Date(booking.endDate), new Date(booking.startDate)));
                return (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-900">{booking.customerName}</p>
                        <p className="text-sm text-slate-500">{booking.customerPhone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {car ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                            <img src={car.image} alt={car.model} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{car.brand} {car.model}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200 mt-1">
                              {car.plate}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Xe không tồn tại</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <CalendarIcon size={16} className="mt-0.5 text-slate-400 shrink-0" />
                        <div>
                          <p>{formatDate(booking.startDate)}</p>
                          <p className="text-slate-400">đến {formatDate(booking.endDate)}</p>
                          <p className="text-xs font-medium text-indigo-600 mt-1">({days} ngày)</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{formatCurrency(booking.totalAmount)}</td>
                    <td className="p-4">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(booking.status))}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handlePrintExisting(booking)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="In hợp đồng"
                        >
                          <Printer size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteBooking(booking.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Không tìm thấy đơn thuê nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <BookingForm 
          cars={cars} 
          onSave={(booking) => {
            onAddBooking(booking);
            setIsAdding(false);
          }} 
          onCancel={() => setIsAdding(false)} 
        />
      )}

      {/* Print View for Existing Booking */}
      {printingBooking && (
        <div className="fixed inset-0 bg-white z-[100] overflow-auto print:static print:block">
          <div className="print:hidden p-4 flex justify-end bg-slate-100 border-b">
            <button 
              onClick={() => setPrintingBooking(null)}
              className="px-4 py-2 bg-white rounded-lg shadow-sm font-medium flex items-center gap-2"
            >
              <X size={20} /> Đóng
            </button>
          </div>
          <ContractPreview 
            booking={printingBooking} 
            car={cars.find(c => c.id === printingBooking.carId)} 
          />
        </div>
      )}
    </div>
  );
}

