import { useState, useEffect, FormEvent, useRef } from 'react';
import { Booking, Car } from '../data/mock';
import { X, Printer, Save, Upload, Loader2 } from 'lucide-react';
import { ContractPreview } from './ContractPreview';
import { supabase } from '../lib/supabase';
import html2canvas from 'html2canvas';

interface BookingFormProps {
  cars: Car[];
  onSave: (booking: Omit<Booking, 'id'>) => void;
  onCancel: () => void;
  initialData?: Partial<Booking>;
}

export function BookingForm({ cars, onSave, onCancel, initialData }: BookingFormProps) {
  // Normalize date string to datetime-local format (yyyy-MM-ddTHH:mm) in LOCAL timezone
  const toDatetimeLocal = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      // Extract local time parts
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch { return dateStr; }
  };

  const [formData, setFormData] = useState<Partial<Booking>>(() => initialData ? {
    ...initialData,
    startDate: toDatetimeLocal(initialData.startDate),
    endDate: toDatetimeLocal(initialData.endDate),
  } : {
    customerName: '',
    customerPhone: '',
    customerYearOfBirth: '',
    customerCCCD: '',
    customerCccdDate: '',
    customerCccdPlace: 'Cục Cảnh sát QLHC về TTXH',
    customerAddress: '',
    customerLicenseClass: 'B2',
    customerLicenseNumber: '',
    customerLicenseExpiry: '',
    rentalPurpose: 'Du lịch - Công tác',
    paymentMethod: 'Chuyển khoản',
    paymentDate: (() => {
      // Input type="date" requires YYYY-MM-DD format
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })(),
    depositAmount: '15,000,000 VNĐ',
    contractLocation: '',
    carId: '',
    startDate: toDatetimeLocal(new Date().toString()),
    endDate: toDatetimeLocal(new Date(Date.now() + 86400000).toString()),
    status: 'active',
    totalAmount: 0,
  });

  const [idFiles, setIdFiles] = useState<{ front?: File; back?: File; licenseFront?: File; licenseBack?: File }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceOverride, setPriceOverride] = useState(!!initialData?.totalAmount);
  const contractRef = useRef<HTMLDivElement>(null);

  const selectedCar = cars.find(c => c.id === formData.carId);

  const [lessorData, setLessorData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('settings').select('*').eq('key', 'lessor_info').single();
        if (data) setLessorData(data.value);
      } catch (err) {
        console.error('Failed to load lessor info:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!priceOverride && formData.startDate && formData.endDate && selectedCar) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      setFormData(prev => ({ ...prev, totalAmount: days * selectedCar.pricePerDay }));
    }
  }, [formData.startDate, formData.endDate, formData.carId, selectedCar, priceOverride]);

  const handlePrint = () => {
    window.print();
  };

  const uploadFile = async (file: File | Blob, prefix: string): Promise<string | undefined> => {
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const fileName = `${prefix}_${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('booking_documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Lỗi tải file:', uploadError);
      return undefined;
    }

    const { data } = supabase.storage
      .from('booking_documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.carId || !formData.customerName || !formData.customerPhone) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    let customerIdFrontUrl = formData.customerIdFront;
    let customerIdBackUrl = formData.customerIdBack;
    let contractUrl = formData.contractUrl;

    try {
      // 1. Upload ID front
      if (idFiles.front) {
        const url = await uploadFile(idFiles.front, 'cccd_front');
        if (url) customerIdFrontUrl = url;
      }

      // 2. Upload ID back
      if (idFiles.back) {
        const url = await uploadFile(idFiles.back, 'cccd_back');
        if (url) customerIdBackUrl = url;
      }

      // 3. Upload License front
      let customerLicenseFrontUrl = formData.customerLicenseFront;
      if (idFiles.licenseFront) {
        const url = await uploadFile(idFiles.licenseFront, 'gplx_front');
        if (url) customerLicenseFrontUrl = url;
      }

      // 4. Upload License back
      let customerLicenseBackUrl = formData.customerLicenseBack;
      if (idFiles.licenseBack) {
        const url = await uploadFile(idFiles.licenseBack, 'gplx_back');
        if (url) customerLicenseBackUrl = url;
      }

      // 5. Generate & upload Contract screenshot
      if (contractRef.current) {
        // Switch to contract tab briefly if not visible to ensure rendering, though it's hidden we might need to make it visible
        const originalTab = activeTab;
        if (activeTab === 'form' && window.innerWidth < 768) {
          setActiveTab('contract');
          // wait for render
          await new Promise(r => setTimeout(r, 100));
        }

        const canvas = await html2canvas(contractRef.current, { scale: 1.5, useCORS: true, logging: false });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));

        if (originalTab === 'form' && window.innerWidth < 768) {
          setActiveTab('form');
        }

        if (blob) {
          const url = await uploadFile(blob, 'contract');
          if (url) contractUrl = url;
        }
      }

      // Save complete booking data
      const finalStartDate = formData.startDate ? new Date(formData.startDate).toISOString() : '';
      const finalEndDate = formData.endDate ? new Date(formData.endDate).toISOString() : '';

      onSave({
        ...formData,
        startDate: finalStartDate,
        endDate: finalEndDate,
        customerIdFront: customerIdFrontUrl,
        customerIdBack: customerIdBackUrl,
        customerLicenseFront: customerLicenseFrontUrl,
        customerLicenseBack: customerLicenseBackUrl,
        contractUrl,
      } as Omit<Booking, 'id'>);

    } catch (error) {
      console.error('Lỗi khi lưu đơn:', error);
      alert('Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
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
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày sinh *</label>
                    <input
                      type="text"
                      required
                      value={formData.customerYearOfBirth}
                      onChange={e => setFormData({ ...formData, customerYearOfBirth: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số CCCD *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerCCCD}
                    onChange={e => setFormData({ ...formData, customerCCCD: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Nhập 12 số CCCD"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày cấp *</label>
                    <input
                      type="text"
                      required
                      value={formData.customerCccdDate}
                      onChange={e => setFormData({ ...formData, customerCccdDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="dd/mm/yyyy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nơi cấp *</label>
                    <input
                      type="text"
                      required
                      value={formData.customerCccdPlace}
                      onChange={e => setFormData({ ...formData, customerCccdPlace: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ thường trú</label>
                  <input
                    type="text"
                    value={formData.customerAddress}
                    onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Số nhà, đường, Huyện/Quận, Tỉnh/TP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ tạm trú</label>
                  <input
                    type="text"
                    value={formData.customerTempAddress}
                    onChange={e => setFormData({ ...formData, customerTempAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Địa chỉ tạm trú hiện tại"
                  />
                </div>

                {/* --- THÔNG TIN GPLX --- */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">GPLX Hạng</label>
                    <input
                      type="text"
                      value={formData.customerLicenseClass}
                      onChange={e => setFormData({ ...formData, customerLicenseClass: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="VD: B2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số GPLX</label>
                    <input
                      type="text"
                      value={formData.customerLicenseNumber}
                      onChange={e => setFormData({ ...formData, customerLicenseNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GPLX Giá trị đến ngày</label>
                  <input
                    type="text"
                    value={formData.customerLicenseExpiry}
                    onChange={e => setFormData({ ...formData, customerLicenseExpiry: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                {/* --- THÔNG TIN THUÊ & THANH TOÁN --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mục đích thuê</label>
                    <input
                      type="text"
                      value={formData.rentalPurpose}
                      onChange={e => setFormData({ ...formData, rentalPurpose: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="VD: Du lịch..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nơi lập hợp đồng</label>
                    <input
                      type="text"
                      value={formData.contractLocation}
                      onChange={e => setFormData({ ...formData, contractLocation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="VD: TP Hồ Chí Minh"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phương thức TT</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                    >
                      <option value="Chuyển khoản">Chuyển khoản</option>
                      <option value="Tiền mặt">Tiền mặt</option>
                      <option value="Cà thẻ">Cà thẻ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ngày thanh toán</label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tài sản cọc thế chấp</label>
                  <input
                    type="text"
                    value={formData.depositAmount}
                    onChange={e => setFormData({ ...formData, depositAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="VD: 15 triệu VNĐ hoặc 1 chiếc xe máy Vision..."
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh CCCD / CMND</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Mặt trước */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Mặt trước</label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden hover:border-indigo-500 transition-colors bg-slate-50 group aspect-[4/3] flex items-center justify-center">
                        {formData.customerIdFront ? (
                          <>
                            <img src={formData.customerIdFront} alt="CCCD Mặt Trước" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Thay đổi ảnh</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <Upload className="w-6 h-6 mb-2" />
                            <span className="text-xs font-medium">Tải ảnh lên<br />(Mặt trước)</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData({ ...formData, customerIdFront: URL.createObjectURL(file) });
                              setIdFiles(prev => ({ ...prev, front: file }));
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Mặt sau */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Mặt sau</label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden hover:border-indigo-500 transition-colors bg-slate-50 group aspect-[4/3] flex items-center justify-center">
                        {formData.customerIdBack ? (
                          <>
                            <img src={formData.customerIdBack} alt="CCCD Mặt Sau" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Thay đổi ảnh</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <Upload className="w-6 h-6 mb-2" />
                            <span className="text-xs font-medium">Tải ảnh lên<br />(Mặt sau)</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData({ ...formData, customerIdBack: URL.createObjectURL(file) });
                              setIdFiles(prev => ({ ...prev, back: file }));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ảnh GPLX (Bằng Lái)</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Mặt trước GPLX */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Mặt trước</label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden hover:border-indigo-500 transition-colors bg-slate-50 group aspect-[4/3] flex items-center justify-center">
                        {formData.customerLicenseFront ? (
                          <>
                            <img src={formData.customerLicenseFront} alt="GPLX Mặt Trước" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Thay đổi ảnh</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <Upload className="w-6 h-6 mb-2" />
                            <span className="text-xs font-medium">Tải ảnh lên<br />(Mặt trước)</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData({ ...formData, customerLicenseFront: URL.createObjectURL(file) });
                              setIdFiles(prev => ({ ...prev, licenseFront: file }));
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Mặt sau GPLX */}
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Mặt sau</label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden hover:border-indigo-500 transition-colors bg-slate-50 group aspect-[4/3] flex items-center justify-center">
                        {formData.customerLicenseBack ? (
                          <>
                            <img src={formData.customerLicenseBack} alt="GPLX Mặt Sau" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-sm font-medium">Thay đổi ảnh</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                            <Upload className="w-6 h-6 mb-2" />
                            <span className="text-xs font-medium">Tải ảnh lên<br />(Mặt sau)</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData({ ...formData, customerLicenseBack: URL.createObjectURL(file) });
                              setIdFiles(prev => ({ ...prev, licenseBack: file }));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
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
                    {cars.filter(c => c.status !== 'maintenance' || c.id === formData.carId).map(car => {
                      const statusLabel = car.status === 'rented' ? ' 🔴 Đang thuê' : car.status === 'maintenance' ? ' 🟡 Bảo trì' : '';
                      return (
                        <option key={car.id} value={car.id}>
                          {car.plate} - {car.brand} {car.model} ({new Intl.NumberFormat('vi-VN').format(car.pricePerDay)}đ/ngày){statusLabel}
                        </option>
                      );
                    })}
                  </select>
                  {selectedCar && selectedCar.status === 'rented' && formData.carId !== initialData?.carId && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">⚠️ Xe này đang cho thuê. HĐ sẽ được tạo trước, xe sẽ chuyển trạng thái khi bàn giao.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Từ Ngày - Custom Picker 24h */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Từ ngày *</label>
                    <div className="flex rounded-lg shadow-sm">
                      <input 
                        type="date"
                        required
                        value={(formData.startDate || '').split('T')[0] || ''}
                        onChange={e => {
                          const timePart = (formData.startDate || '').split('T')[1] || '00:00';
                          setFormData({ ...formData, startDate: `${e.target.value}T${timePart}` });
                        }}
                        className="w-full px-2 py-2 border border-slate-200 border-r-0 rounded-l-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm bg-white"
                      />
                      <select 
                        value={((formData.startDate || '').split('T')[1] || '00:00').split(':')[0] || '00'} 
                        onChange={e => {
                          const datePart = (formData.startDate || '').split('T')[0] || '';
                          const minutes = ((formData.startDate || '').split('T')[1] || '00:00').split(':')[1] || '00';
                          setFormData({ ...formData, startDate: `${datePart}T${e.target.value}:${minutes}` });
                        }}
                        className="px-1 py-2 border-y border-l border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-slate-100 cursor-pointer text-center"
                      >
                        {Array.from({length: 24}).map((_, i) => {
                          const h = String(i).padStart(2, '0');
                          return <option key={h} value={h}>{h}</option>;
                        })}
                      </select>
                      <div className="flex items-center justify-center bg-slate-50 border-y border-slate-200 px-1 text-slate-400 font-bold">:</div>
                      <select 
                        value={((formData.startDate || '').split('T')[1] || '00:00').split(':')[1] || '00'} 
                        onChange={e => {
                          const datePart = (formData.startDate || '').split('T')[0] || '';
                          const hours = ((formData.startDate || '').split('T')[1] || '00:00').split(':')[0] || '00';
                          setFormData({ ...formData, startDate: `${datePart}T${hours}:${e.target.value}` });
                        }}
                        className="px-1 py-2 border border-slate-200 border-l-0 rounded-r-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-slate-100 cursor-pointer text-center"
                      >
                        {Array.from({length: 60}).map((_, i) => {
                          const m = String(i).padStart(2, '0');
                          return <option key={m} value={m}>{m}</option>;
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Đến Ngày - Custom Picker 24h */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đến ngày *</label>
                    <div className="flex rounded-lg shadow-sm">
                      <input 
                        type="date"
                        required
                        value={(formData.endDate || '').split('T')[0] || ''}
                        onChange={e => {
                          const timePart = (formData.endDate || '').split('T')[1] || '00:00';
                          setFormData({ ...formData, endDate: `${e.target.value}T${timePart}` });
                        }}
                        className="w-full px-2 py-2 border border-slate-200 border-r-0 rounded-l-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm bg-white"
                      />
                      <select 
                        value={((formData.endDate || '').split('T')[1] || '00:00').split(':')[0] || '00'} 
                        onChange={e => {
                          const datePart = (formData.endDate || '').split('T')[0] || '';
                          const minutes = ((formData.endDate || '').split('T')[1] || '00:00').split(':')[1] || '00';
                          setFormData({ ...formData, endDate: `${datePart}T${e.target.value}:${minutes}` });
                        }}
                        className="px-1 py-2 border-y border-l border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-slate-100 cursor-pointer text-center"
                      >
                        {Array.from({length: 24}).map((_, i) => {
                          const h = String(i).padStart(2, '0');
                          return <option key={h} value={h}>{h}</option>;
                        })}
                      </select>
                      <div className="flex items-center justify-center bg-slate-50 border-y border-slate-200 px-1 text-slate-400 font-bold">:</div>
                      <select 
                        value={((formData.endDate || '').split('T')[1] || '00:00').split(':')[1] || '00'} 
                        onChange={e => {
                          const datePart = (formData.endDate || '').split('T')[0] || '';
                          const hours = ((formData.endDate || '').split('T')[1] || '00:00').split(':')[0] || '00';
                          setFormData({ ...formData, endDate: `${datePart}T${hours}:${e.target.value}` });
                        }}
                        className="px-1 py-2 border border-slate-200 border-l-0 rounded-r-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm bg-slate-50 hover:bg-slate-100 cursor-pointer text-center"
                      >
                        {Array.from({length: 60}).map((_, i) => {
                          const m = String(i).padStart(2, '0');
                          return <option key={m} value={m}>{m}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Giá thuê linh hoạt */}
                <div className="pb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá thuê (VNĐ)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.totalAmount ? new Intl.NumberFormat('vi-VN').format(formData.totalAmount) : ''}
                      onChange={e => {
                        const rawValue = e.target.value.replace(/[^\d]/g, '');
                        setPriceOverride(true);
                        setFormData({ ...formData, totalAmount: rawValue ? Number(rawValue) : 0 });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Nhập giá thuê..."
                    />
                    {priceOverride && (
                      <button
                        type="button"
                        onClick={() => {
                          setPriceOverride(false);
                          // Recalculate
                          if (formData.startDate && formData.endDate && selectedCar) {
                            const start = new Date(formData.startDate);
                            const end = new Date(formData.endDate);
                            const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                            setFormData(prev => ({ ...prev, totalAmount: days * selectedCar.pricePerDay }));
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                      >
                        Tính tự động
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {priceOverride
                      ? '💰 Giá đã nhập thủ công. Bấm "Tính tự động" để tính lại theo đơn giá/ngày.'
                      : selectedCar
                        ? `📐 Tự động: ${new Intl.NumberFormat('vi-VN').format(selectedCar.pricePerDay)}đ/ngày × ${(() => { const s = new Date(formData.startDate || ''); const e = new Date(formData.endDate || ''); return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000)); })()} ngày`
                        : 'Chọn xe và ngày thuê để tự động tính giá'
                    }
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Section - Visible when printing or contract tab is active */}
          <div className={`w-full md:w-2/3 bg-slate-50 overflow-y-auto print:w-full print:bg-white print:block ${activeTab === 'contract' ? 'block' : 'hidden md:block'}`}>
            <ContractPreview ref={contractRef} booking={formData} car={selectedCar} lessorData={lessorData} />
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
                disabled={isSubmitting}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed ${activeTab === 'contract' ? 'flex flex-1 md:flex-none' : 'hidden md:flex'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Lưu đơn
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
