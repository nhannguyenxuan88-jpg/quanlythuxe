import { useState, useEffect, FormEvent } from 'react';
import { Booking, Car } from '../data/mock';
import { X, Printer, Save } from 'lucide-react';
import { ContractPreview } from './ContractPreview';

interface BookingFormProps {
  cars: Car[];
  onSave: (booking: Omit<Booking, 'id'>) => void;
  onCancel: () => void;
}

export function BookingForm({ cars, onSave, onCancel }: BookingFormProps) {
  const [formData, setFormData] = useState<Partial<Booking>>({
    customerName: '',
    customerPhone: '',
    customerCCCD: '',
    customerAddress: '',
    carId: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    status: 'active',
    totalAmount: 0,
  });

  const selectedCar = cars.find(c => c.id === formData.carId);

  useEffect(() => {
    if (formData.startDate && formData.endDate && selectedCar) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      setFormData(prev => ({ ...prev, totalAmount: days * selectedCar.pricePerDay }));
    }
  }, [formData.startDate, formData.endDate, formData.carId, selectedCar]);

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.carId || !formData.customerName || !formData.customerPhone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    onSave(formData as Omit<Booking, 'id'>);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:block">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden print:max-w-none print:shadow-none print:h-auto print:overflow-visible">

        {/* Form Section - Hidden when printing */}
        <div className="w-full md:w-1/3 md:border-r border-slate-100 flex flex-col shrink-0 min-h-[50vh] md:min-h-0 print:hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="font-bold text-lg">Tạo đơn thuê mới</h3>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors bg-slate-50 md:bg-transparent">
              <X size={20} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Khách hàng *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Họ và tên"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="09xx..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số CCCD</label>
                  <input
                    type="text"
                    value={formData.customerCCCD}
                    onChange={e => setFormData({ ...formData, customerCCCD: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="12 số CCCD"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.customerAddress}
                  onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Địa chỉ thường trú"
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-1">Chọn xe *</label>
                <select
                  required
                  value={formData.carId}
                  onChange={e => setFormData({ ...formData, carId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
                >
                  <option value="">-- Chọn xe --</option>
                  {cars.filter(c => c.status === 'available').map(car => (
                    <option key={car.id} value={car.id}>
                      {car.plate} - {car.brand} {car.model} ({new Intl.NumberFormat('vi-VN').format(car.pricePerDay)}đ/ngày)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Từ ngày *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đến ngày *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  <span className="text-slate-700 font-medium text-sm">Tổng tiền dự kiến:</span>
                  <span className="text-xl font-bold text-indigo-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 border-t border-slate-100 border-b md:border-b-0 flex gap-3 shrink-0 bg-slate-50 md:bg-white">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Printer size={20} />
              In HĐ
            </button>
            <button
              type="submit"
              form="booking-form"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Save size={20} />
              Lưu đơn
            </button>
          </div>
        </div>

        {/* Preview Section - Visible when printing */}
        <div className="w-full md:w-2/3 bg-slate-50 overflow-y-auto flex-1 min-h-[50vh] md:min-h-0 print:w-full print:bg-white">
          <ContractPreview booking={formData} car={selectedCar} />
        </div>
      </div>
    </div>
  );
}
