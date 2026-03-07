import { useState, useEffect } from 'react';
import { Booking, Car as CarType, BookingStatus } from '../data/mock';
import { Plus, Search, Filter, Calendar as CalendarIcon, MoreVertical, Edit, Trash2, Printer, X, Image as ImageIcon, Download, ClipboardCheck, FileText, MessageSquare, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { cn } from '../lib/utils';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BookingForm } from './BookingForm';
import { ContractPreview } from './ContractPreview';
import { HandoverModal } from './HandoverModal';

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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [printingBooking, setPrintingBooking] = useState<Booking | null>(null);
  const [viewingDocuments, setViewingDocuments] = useState<Booking | null>(null);
  const [handoverBooking, setHandoverBooking] = useState<{ booking: Booking, type: 'checkout' | 'checkin' } | null>(null);
  const [lessorData, setLessorData] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const hiddenContractRef = import('react').then(module => module.useRef<HTMLDivElement>(null)); // Just use a standard useRef
  const contractRef = import('react').then(module => module.useRef<HTMLDivElement>(null));

  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data } = await supabase.from('settings').select('*').eq('key', 'lessor_info').single();
        if (data) setLessorData(data.value);
      } catch (err) {
        console.error('Failed to load lessor info:', err);
      }
    })();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const car = cars.find(c => c.id === booking.carId);
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone.includes(searchTerm) ||
      (car && (car.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    // Date range filter
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(booking.startDate) >= new Date(dateFrom);
    }
    if (dateTo) {
      const toEnd = new Date(dateTo);
      toEnd.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(booking.startDate) <= toEnd;
    }

    return matchesSearch && matchesStatus && matchesDate;
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

  const handleExportCSV = () => {
    const statusMap: Record<string, string> = { active: 'Đang chạy', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
    const headers = ['Khách hàng', 'SĐT', 'Xe thuê', 'Biển số', 'Từ ngày', 'Đến ngày', 'Tổng tiền', 'Trạng thái'];
    const rows = filteredBookings.map(b => {
      const car = cars.find(c => c.id === b.carId);
      return [
        b.customerName,
        b.customerPhone,
        `${car?.brand || ''} ${car?.model || ''}`,
        car?.plate || '',
        formatDate(b.startDate),
        formatDate(b.endDate),
        b.totalAmount.toString(),
        statusMap[b.status] || b.status
      ].map(v => `"${v}"`).join(',');
    });
    const bom = '\uFEFF';
    const csv = bom + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `don_thue_xe_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareZaloPDF = async (bookingToShare: Booking) => {
    setIsGeneratingPDF(true);
    setPrintingBooking(bookingToShare); // Temporarily open print view so we can capture it

    // Give it a short delay to render the DOM
    setTimeout(async () => {
      try {
        const contractEl = document.getElementById('print-contract-preview');
        if (!contractEl) throw new Error('Không tìm thấy giao diện hợp đồng');

        const canvas = await html2canvas(contractEl, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], `Hop_Dong_${bookingToShare.customerName.replace(/ /g, '_')}.pdf`, { type: 'application/pdf' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Hợp Đồng Thuê Xe',
            text: `Gửi anh/chị bản điện tử Hợp đồng thuê xe.`,
            files: [file]
          });
        } else {
          // Fallback if Web Share is not supported for files (e.g. desktop)
          const url = URL.createObjectURL(pdfBlob);
          window.open(`https://zalo.me/?text=${encodeURIComponent(`Anh/chị truy cập link để tải hợp đồng: ${bookingToShare.contractUrl || ''}`)}`, '_blank');

          // Also trigger a normal download as a fallback
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Lỗi tạo PDF:', error);
        alert('Có lỗi xảy ra khi tạo PDF. Vui lòng thử lại.');
      } finally {
        setIsGeneratingPDF(false);
        setPrintingBooking(null); // Hide print view again
      }
    }, 500);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Đơn thuê xe</h2>
          <p className="text-slate-500 mt-1">Quản lý các hợp đồng cho thuê</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-emerald-200"
          >
            <Download size={18} />
            Xuất Excel
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Tạo đơn mới
          </button>
        </div>
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

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              title="Từ ngày"
            />
            <span className="text-slate-400 text-sm">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              title="Đến ngày"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="w-full text-left border-collapse hidden md:table">
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
                const hasDocs = booking.contractUrl || booking.customerIdFront || booking.customerIdBack;
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
                      <select
                        value={booking.status}
                        onChange={(e) => onUpdateBooking(booking.id, { status: e.target.value as BookingStatus })}
                        className={cn(
                          "appearance-none cursor-pointer outline-none inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border focus:ring-2 focus:ring-indigo-500 transition-colors",
                          getStatusColor(booking.status)
                        )}
                      >
                        <option value="active" className="bg-white text-slate-900 font-sans">Đang chạy</option>
                        <option value="completed" className="bg-white text-slate-900 font-sans">Hoàn thành</option>
                        <option value="cancelled" className="bg-white text-slate-900 font-sans">Đã hủy</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-col gap-1 items-end">
                        {/* Handover Status / Buttons */}
                        {booking.status === 'active' && !booking.checkOutTime && (
                          <button
                            onClick={() => setHandoverBooking({ booking, type: 'checkout' })}
                            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 flex items-center gap-1 rounded font-medium border border-amber-200 transition-colors w-full justify-center"
                          >
                            <ClipboardCheck size={14} /> Giao xe
                          </button>
                        )}
                        {booking.status === 'active' && booking.checkOutTime && !booking.checkInTime && (
                          <button
                            onClick={() => setHandoverBooking({ booking, type: 'checkin' })}
                            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 flex items-center gap-1 rounded font-medium border border-indigo-200 transition-colors w-full justify-center"
                          >
                            <ClipboardCheck size={14} /> Nhận xe
                          </button>
                        )}
                        {(booking.checkOutTime || booking.checkInTime) && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {booking.checkInTime ? 'Đã nhận xe' : 'Đã giao xe'}
                          </span>
                        )}

                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          {(hasDocs || booking.checkOutTime) && (
                            <button
                              onClick={() => setViewingDocuments(booking)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-indigo-600"
                              title="Xem tài liệu & Biên bản"
                            >
                              <ImageIcon size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handlePrintExisting(booking)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="In hợp đồng"
                          >
                            <Printer size={18} />
                          </button>
                          <button
                            onClick={() => setEditingBooking(booking)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => onDeleteBooking(booking.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Không tìm thấy đơn thuê nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden bg-slate-50/50 print:hidden">
            {filteredBookings.map((booking) => {
              const car = cars.find(c => c.id === booking.carId);
              const days = Math.max(1, differenceInDays(new Date(booking.endDate), new Date(booking.startDate)));
              const hasDocs = booking.contractUrl || booking.customerIdFront || booking.customerIdBack || booking.customerLicenseFront || booking.customerLicenseBack;
              return (
                <div key={booking.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base">{booking.customerName}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{booking.customerPhone}</p>
                    </div>
                    <select
                      value={booking.status}
                      onChange={(e) => onUpdateBooking(booking.id, { status: e.target.value as BookingStatus })}
                      className={cn(
                        "appearance-none cursor-pointer outline-none inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border focus:ring-2 focus:ring-indigo-500 transition-colors",
                        getStatusColor(booking.status)
                      )}
                    >
                      <option value="active" className="bg-white text-slate-900 font-sans">Đang chạy</option>
                      <option value="completed" className="bg-white text-slate-900 font-sans">Hoàn thành</option>
                      <option value="cancelled" className="bg-white text-slate-900 font-sans">Đã hủy</option>
                    </select>
                  </div>

                  {car ? (
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="w-14 h-14 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                        <img src={car.image} alt={car.model} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{car.brand} {car.model}</p>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-white text-slate-700 border border-slate-200 mt-1 shadow-sm">
                          {car.plate}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-400 italic text-sm">Xe không tồn tại</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <CalendarIcon size={16} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs">Nhận xe</span>
                        <span className="font-medium text-slate-900">{formatDate(booking.startDate)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-slate-500 text-xs">Trả xe</span>
                        <span className="font-medium text-slate-900">{formatDate(booking.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Tổng ({days} ngày)</p>
                        <p className="font-bold text-indigo-600 text-lg leading-tight mt-0.5">{formatCurrency(booking.totalAmount)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {hasDocs && (
                          <button
                            onClick={() => setViewingDocuments(booking)}
                            className="min-w-[40px] w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-100 bg-white transition-colors shadow-sm"
                            title="Xem tài liệu"
                          >
                            <ImageIcon size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrintExisting(booking)}
                          className="min-w-[40px] w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-100 bg-white transition-colors shadow-sm"
                        >
                          <Printer size={18} />
                        </button>
                        <button
                          onClick={() => setEditingBooking(booking)}
                          className="min-w-[40px] w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-100 bg-white transition-colors shadow-sm"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => onDeleteBooking(booking.id)}
                          className="min-w-[40px] w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 bg-white transition-colors shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Handover Buttons */}
                    <div className="flex flex-col gap-2">
                      {booking.status === 'active' && !booking.checkOutTime && (
                        <button
                          onClick={() => setHandoverBooking({ booking, type: 'checkout' })}
                          className="w-full text-sm bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 flex items-center justify-center gap-2 rounded-xl font-medium border border-amber-200 transition-colors"
                        >
                          <ClipboardCheck size={16} /> Giao xe
                        </button>
                      )}
                      {booking.status === 'active' && booking.checkOutTime && !booking.checkInTime && (
                        <button
                          onClick={() => setHandoverBooking({ booking, type: 'checkin' })}
                          className="w-full text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 flex items-center justify-center gap-2 rounded-xl font-medium border border-indigo-200 transition-colors"
                        >
                          <ClipboardCheck size={16} /> Nhận xe
                        </button>
                      )}
                      {(booking.checkOutTime || booking.checkInTime) && (
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-medium flex items-center gap-1.5">
                            <ClipboardCheck size={14} className="text-slate-400" />
                            Trạng thái bàn giao
                          </span>
                          <span className="font-semibold text-slate-700">
                            {booking.checkInTime ? 'Đã nhận xe' : 'Đã giao xe'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredBookings.length === 0 && (
              <div className="text-center p-8 text-slate-500">
                Không tìm thấy đơn thuê nào phù hợp.
              </div>
            )}
          </div>
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

      {editingBooking && (
        <BookingForm
          cars={cars}
          initialData={editingBooking}
          onSave={(booking) => {
            onUpdateBooking(editingBooking.id, booking);
            setEditingBooking(null);
          }}
          onCancel={() => setEditingBooking(null)}
        />
      )}

      {/* Document Viewer Modal */}
      {viewingDocuments && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Tài liệu đính kèm</h3>
              <button onClick={() => setViewingDocuments(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-white shadow-sm text-slate-500 hover:text-slate-800">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Hợp Đồng Cho Thuê
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleShareZaloPDF(viewingDocuments)}
                      disabled={isGeneratingPDF}
                      className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-70"
                    >
                      {isGeneratingPDF ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                      {isGeneratingPDF ? 'Đang tạo PDF...' : 'Chia sẻ Zalo (PDF)'}
                    </button>
                    <button
                      onClick={() => {
                        setPrintingBooking(viewingDocuments);
                        setViewingDocuments(null);
                      }}
                      className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Printer size={16} /> Xem Bản in
                    </button>
                  </div>
                </div>
                {viewingDocuments.contractUrl ? (
                  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <img src={viewingDocuments.contractUrl} alt="Hợp đồng điện tử chụp" className="w-full h-auto rounded-lg" />
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-slate-200 border-dashed text-center">
                    <FileText size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500 text-sm mb-1">Không có bản chụp Hợp đồng đính kèm.</p>
                    <p className="text-slate-600 text-sm">Vui lòng bấm <strong>Xem Bản in</strong> để đọc lại nội dung Hợp đồng.</p>
                  </div>
                )}
              </div>

              {(viewingDocuments.customerIdFront || viewingDocuments.customerIdBack) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Giấy tờ tuỳ thân (CCCD)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingDocuments.customerIdFront && (
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-medium text-slate-500 mb-2 px-1">Mặt trước</p>
                        <img src={viewingDocuments.customerIdFront} alt="CCCD Mặt Trước" className="w-full h-auto rounded-lg object-contain bg-slate-50" />
                      </div>
                    )}
                    {viewingDocuments.customerIdBack && (
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-medium text-slate-500 mb-2 px-1">Mặt sau</p>
                        <img src={viewingDocuments.customerIdBack} alt="CCCD Mặt Sau" className="w-full h-auto rounded-lg object-contain bg-slate-50" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(viewingDocuments.customerLicenseFront || viewingDocuments.customerLicenseBack) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Giấy phép lái xe (GPLX)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewingDocuments.customerLicenseFront && (
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-medium text-slate-500 mb-2 px-1">Mặt trước</p>
                        <img src={viewingDocuments.customerLicenseFront} alt="GPLX Mặt Trước" className="w-full h-auto rounded-lg object-contain bg-slate-50" />
                      </div>
                    )}
                    {viewingDocuments.customerLicenseBack && (
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-medium text-slate-500 mb-2 px-1">Mặt sau</p>
                        <img src={viewingDocuments.customerLicenseBack} alt="GPLX Mặt Sau" className="w-full h-auto rounded-lg object-contain bg-slate-50" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Handover Check-out */}
              {viewingDocuments.checkOutTime && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                      <ClipboardCheck size={18} className="text-amber-500" />
                      Biên bản Giao xe
                    </h4>
                    <span className="text-xs text-slate-500">{formatDate(viewingDocuments.checkOutTime)}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-sm flex gap-4">
                    <div><span className="text-slate-500">ODO:</span> <span className="font-medium text-slate-900">{viewingDocuments.checkOutOdo} km</span></div>
                    <div><span className="text-slate-500">Pin:</span> <span className="font-medium text-slate-900">{viewingDocuments.checkOutFuel}</span></div>
                  </div>
                  {viewingDocuments.checkOutNotes && (
                    <p className="text-sm text-slate-600 italic">Ghi chú: {viewingDocuments.checkOutNotes}</p>
                  )}
                  {viewingDocuments.checkOutImages && viewingDocuments.checkOutImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {viewingDocuments.checkOutImages.map((url, i) => (
                        <div key={i} className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} alt={`Lúc giao ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Handover Check-in */}
              {viewingDocuments.checkInTime && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                      <ClipboardCheck size={18} className="text-indigo-500" />
                      Biên bản Nhận xe
                    </h4>
                    <span className="text-xs text-slate-500">{formatDate(viewingDocuments.checkInTime)}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-sm flex gap-4">
                    <div><span className="text-slate-500">ODO:</span> <span className="font-medium text-slate-900">{viewingDocuments.checkInOdo} km</span></div>
                    <div><span className="text-slate-500">Pin:</span> <span className="font-medium text-slate-900">{viewingDocuments.checkInFuel}</span></div>
                  </div>
                  {viewingDocuments.checkInNotes && (
                    <p className="text-sm text-slate-600 italic">Ghi chú: {viewingDocuments.checkInNotes}</p>
                  )}
                  {viewingDocuments.checkInImages && viewingDocuments.checkInImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {viewingDocuments.checkInImages.map((url, i) => (
                        <div key={i} className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                          <img src={url} alt={`Lúc nhận ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!viewingDocuments.contractUrl &&
                !viewingDocuments.customerIdFront &&
                !viewingDocuments.customerIdBack &&
                !viewingDocuments.customerLicenseFront &&
                !viewingDocuments.customerLicenseBack &&
                !viewingDocuments.checkOutTime && (
                  <div className="text-center py-8 text-slate-500">
                    Không có tài liệu hay biên bản nào được đính kèm.
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Print View for Existing Booking */}
      {printingBooking && (
        <div id="print-contract-preview" className={`fixed inset-0 bg-white z-[100] overflow-auto print:static print:block ${isGeneratingPDF ? 'opacity-0 pointer-events-none' : ''}`}>
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
            lessorData={lessorData}
          />
        </div>
      )}
      {/* Handover Modal */}
      {handoverBooking && (
        <HandoverModal
          booking={handoverBooking.booking}
          car={cars.find(c => c.id === handoverBooking.booking.carId)!}
          type={handoverBooking.type}
          onClose={() => setHandoverBooking(null)}
          onSuccess={(updated) => {
            onUpdateBooking(updated.id, updated);
            setHandoverBooking(null);
          }}
        />
      )}
    </div>
  );
}

