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

  const [activeTab, setActiveTab] = useState<'form' | 'contract'>('form');

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-end md:items-center justify-center p-0 md:p-4 print:p-0 print:bg-white print:static print:block">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] md:max-h-[90vh] flex flex-col overflow-hidden print:max-w-none print:shadow-none print:h-auto print:overflow-visible">

        {/* Header with Mobile Tabs */}
        <div className="bg-white border-b border-slate-100 shrink-0 print:hidden">
          <div className="p-4 flex items-center justify-between">
            <h3 className="font-bold text-lg">Tạo đơn thuê mới</h3>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors bg-slate-50 md:bg-transparent">
              <X size={20} />
            </button>
          </div>

          {/* Mobile Tabs */}
          <div className="flex md:hidden border-t border-slate-100">
            <button
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'form' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
              onClick={() => setActiveTab('form')}
            >
              📝 Thông tin Đơn
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'contract' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}
              onClick={() => setActiveTab('contract')}
            >
              ✍️ Xem Hợp Đồng
            </button>
          </div>
        </div>

        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden print:overflow-visible">

          {/* Form Section */}
          <div className={`w-full md:w-1/3 md:border-r border-slate-100 flex-col overflow-y-auto print:hidden ${activeTab === 'form' ? 'flex' : 'hidden md:flex'}`}>
            <div className="p-4">
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

                <div className="grid grid-cols-2 gap-4 pb-4">
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
              </form>
            </div>
          </div>

          {/* Preview Section - Visible when printing or contract tab is active */}
          <div className={`w-full md:w-2/3 bg-slate-50 overflow-y-auto print:w-full print:bg-white print:block ${activeTab === 'contract' ? 'block' : 'hidden md:block'}`}>
            <ContractPreview booking={formData} car={selectedCar} />
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="bg-white border-t border-slate-100 p-4 shrink-0 pb-safe print:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Price Summary */}
            <div className="flex justify-between items-center w-full md:w-auto bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100 flex-1 md:flex-none">
              <span className="text-slate-700 font-medium text-sm mr-4">Tổng tiền dự kiến:</span>
              <span className="text-xl font-bold text-indigo-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.totalAmount || 0)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full md:w-auto">
              {activeTab === 'form' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('contract')}
                  className="flex-1 md:hidden bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-medium flex items-center justify-center transition-colors"
                >
                  Tiếp tục ký HĐ
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className={`bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium items-center justify-center gap-2 transition-colors shadow-sm ${activeTab === 'contract' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'}`}
              >
                <Printer size={20} />
                In HĐ
              </button>
              <button
                type="submit"
                form="booking-form"
                className={`bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium items-center justify-center gap-2 transition-colors shadow-sm ${activeTab === 'contract' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'}`}
              >
                <Save size={20} />
                Lưu đơn
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
