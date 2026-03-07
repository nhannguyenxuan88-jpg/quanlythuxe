import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CarStatus } from '../data/mock';

interface CarFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (car: {
        plate: string;
        brand: string;
        model: string;
        year: number;
        pricePerDay: number;
        status: CarStatus;
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
    }) => void;
}

export function CarForm({ isOpen, onClose, onSubmit }: CarFormProps) {
    const [formData, setFormData] = useState({
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        pricePerDay: 0,
        status: 'available' as CarStatus,
        image: '',
        type: 'Ô TÔ con',
        color: '',
        engineNumber: '',
        frameNumber: '',
        seats: 7,
        ownerName: '',
        ownerAddress: '',
        inspectionNumber: '',
        inspectionProvider: '',
        inspectionDate: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            image: formData.image || `https://picsum.photos/seed/${formData.model || 'car'}/400/300`
        });

        // Reset form after submission
        setFormData({
            plate: '',
            brand: '',
            model: '',
            year: new Date().getFullYear(),
            pricePerDay: 0,
            status: 'available',
            image: '',
            type: 'Ô TÔ con',
            color: '',
            engineNumber: '',
            frameNumber: '',
            seats: 7,
            ownerName: '',
            ownerAddress: '',
            inspectionNumber: '',
            inspectionProvider: '',
            inspectionDate: '',
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800">Thêm xe mới</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="add-car-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Biển số *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="VD: 30G-123.45"
                                    value={formData.plate}
                                    onChange={e => setFormData({ ...formData, plate: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Trạng thái</label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as CarStatus })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white"
                                >
                                    <option value="available">Sẵn sàng</option>
                                    <option value="rented">Đang thuê</option>
                                    <option value="maintenance">Bảo dưỡng</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Hãng xe *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="VD: Toyota"
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Dòng xe *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="VD: Vios"
                                    value={formData.model}
                                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Năm sản xuất *</label>
                                <input
                                    type="number"
                                    required
                                    min="2000"
                                    max={new Date().getFullYear() + 1}
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Giá thuê/ngày (VNĐ) *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="50000"
                                    value={formData.pricePerDay}
                                    onChange={e => setFormData({ ...formData, pricePerDay: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Additional Contract Info Sections Optional/Expandable */}
                        <div className="border border-slate-200 rounded-xl mt-6 p-4 bg-slate-50/50">
                            <p className="text-sm font-semibold text-slate-800 mb-4">Thông tin thêm dùng cho Hợp đồng (Tùy chọn)</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Chủ xe</label>
                                    <input type="text" placeholder="Tên chủ xe" value={formData.ownerName} onChange={e => setFormData({ ...formData, ownerName: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Tên Tỉnh/Tp Thường trú</label>
                                    <input type="text" placeholder="Nơi cư trú" value={formData.ownerAddress} onChange={e => setFormData({ ...formData, ownerAddress: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Số khung</label>
                                    <input type="text" placeholder="Khung xe" value={formData.frameNumber} onChange={e => setFormData({ ...formData, frameNumber: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Số máy</label>
                                    <input type="text" placeholder="Số máy" value={formData.engineNumber} onChange={e => setFormData({ ...formData, engineNumber: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Màu sơn / Số chỗ</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" placeholder="Màu" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        <input type="number" placeholder="Chỗ" value={formData.seats} onChange={e => setFormData({ ...formData, seats: Number(e.target.value) })} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-slate-700">Mã Đăng kiểm (Số XA-xxx, nơi cấp, ngày cấp)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <input type="text" placeholder="Số chứng nhận..." value={formData.inspectionNumber} onChange={e => setFormData({ ...formData, inspectionNumber: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        <input type="text" placeholder="Nơi cấp..." value={formData.inspectionProvider} onChange={e => setFormData({ ...formData, inspectionProvider: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                        <input type="text" placeholder="Ngày cấp..." value={formData.inspectionDate} onChange={e => setFormData({ ...formData, inspectionDate: e.target.value })} className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Hình ảnh URL (Tùy chọn)</label>
                            <input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                            <p className="text-xs text-slate-500">Nếu để trống, hệ thống sẽ tự tạo ảnh dựa trên dòng xe.</p>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        form="add-car-form"
                        className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                    >
                        Thêm xe
                    </button>
                </div>
            </div>
        </div>
    );
}
