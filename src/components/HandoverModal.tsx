import { useState } from 'react';
import { Booking, Car } from '../data/mock';
import { X, Camera, Upload, Trash2, Loader2, Gauge, BatteryCharging } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface HandoverModalProps {
    booking: Booking;
    car: Car;
    type: 'checkout' | 'checkin';
    onClose: () => void;
    onSuccess: (updatedBooking: Booking) => void;
}

const BATTERY_LEVELS = ['Dưới 20%', '40%', '60%', '80%', '100%'];

export function HandoverModal({ booking, car, type, onClose, onSuccess }: HandoverModalProps) {
    const isCheckOut = type === 'checkout';

    const [odo, setOdo] = useState<string>(
        isCheckOut ? (booking.checkOutOdo?.toString() || '') : (booking.checkInOdo?.toString() || booking.checkOutOdo?.toString() || '')
    );

    const [fuel, setFuel] = useState<string>(
        isCheckOut ? (booking.checkOutFuel || '1/2') : (booking.checkInFuel || booking.checkOutFuel || '1/2')
    );

    const [notes, setNotes] = useState<string>(
        isCheckOut ? (booking.checkOutNotes || '') : (booking.checkInNotes || '')
    );

    const existingImages = isCheckOut ? (booking.checkOutImages || []) : (booking.checkInImages || []);
    const [images, setImages] = useState<{ file?: File, url: string }[]>(
        existingImages.map(url => ({ url }))
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages = Array.from(e.target.files).map(file => ({
                file,
                url: URL.createObjectURL(file)
            }));
            setImages([...images, ...newImages].slice(0, 6)); // Max 6 images
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const uploadImages = async (): Promise<string[]> => {
        const uploadedUrls: string[] = [];

        for (const img of images) {
            if (!img.file) {
                // Already uploaded URL
                uploadedUrls.push(img.url);
                continue;
            }

            const fileExt = img.file.name.split('.').pop();
            const fileName = `${booking.id}_${type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `handover/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('booking_documents')
                .upload(filePath, img.file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('booking_documents')
                .getPublicUrl(filePath);

            uploadedUrls.push(data.publicUrl);
        }

        return uploadedUrls;
    };

    const handleSubmit = async () => {
        if (!odo) {
            toast.error('Vui lòng nhập số KM hiện tại');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Đang lưu thông tin bàn giao...');

        try {
            const imageUrls = await uploadImages();

            const updates: Partial<Booking> = {};
            const now = new Date().toISOString();

            if (isCheckOut) {
                updates.checkOutOdo = parseInt(odo, 10);
                updates.checkOutFuel = fuel;
                updates.checkOutNotes = notes;
                updates.checkOutImages = imageUrls;
                if (!booking.checkOutTime) updates.checkOutTime = now;
            } else {
                updates.checkInOdo = parseInt(odo, 10);
                updates.checkInFuel = fuel;
                updates.checkInNotes = notes;
                updates.checkInImages = imageUrls;
                if (!booking.checkInTime) updates.checkInTime = now;
            }

            const { data, error } = await supabase
                .from('bookings')
                .update({
                    ...(isCheckOut ? {
                        check_out_time: updates.checkOutTime || booking.checkOutTime,
                        check_out_odo: updates.checkOutOdo,
                        check_out_fuel: updates.checkOutFuel,
                        check_out_notes: updates.checkOutNotes,
                        check_out_images: updates.checkOutImages,
                    } : {
                        check_in_time: updates.checkInTime || booking.checkInTime,
                        check_in_odo: updates.checkInOdo,
                        check_in_fuel: updates.checkInFuel,
                        check_in_notes: updates.checkInNotes,
                        check_in_images: updates.checkInImages,
                    })
                })
                .eq('id', booking.id)
                .select()
                .single();

            if (error) throw error;

            toast.success('Đã lưu thông tin bàn giao!', { id: loadingToast });
            onSuccess({ ...booking, ...updates }); // Merge updates into mock for immediate UI update
            onClose();
        } catch (error: any) {
            toast.error('Lỗi khi lưu: ' + error.message, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            {isCheckOut ? 'Biên bản Giao xe' : 'Biên bản Nhận lại xe'}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Xe {car.brand} {car.model} biển số <span className="font-mono font-medium text-slate-700">{car.plate}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* ODO */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <Gauge size={16} className="text-indigo-500" />
                                Số KM hiện tại (ODO) *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={odo}
                                    onChange={e => setOdo(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                                    placeholder="Ví dụ: 45000"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">km</span>
                            </div>
                        </div>

                        {/* Fuel */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                <BatteryCharging size={16} className="text-emerald-500" />
                                Mức pin hiện tại
                            </label>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                {BATTERY_LEVELS.map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFuel(level)}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${fuel === level
                                            ? 'bg-white shadow text-emerald-600'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tình trạng xe / Ghi chú xước xát (nếu có)
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 h-24 resize-none"
                            placeholder={isCheckOut ? "Ví dụ: Trầy xước nhẹ ở cản trước bên phải..." : "Ví dụ: Khách làm xước cửa sau, đã thu phụ phí 500k..."}
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Hình ảnh thực tế ({images.length}/6)
                            </label>
                            <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                                <Camera size={16} />
                                Thêm ảnh
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleImageChange}
                                    disabled={images.length >= 6}
                                />
                            </label>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative aspect-video rounded-xl border border-slate-200 overflow-hidden group bg-slate-100">
                                    <img src={img.url} alt={`Handover ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {images.length === 0 && (
                                <div className="col-span-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                    <Upload size={24} className="mb-2 text-slate-300" />
                                    <p className="text-sm font-medium">Chưa có hình ảnh</p>
                                    <p className="text-xs">Chụp tối đa 6 ảnh xung quanh xe</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-white shrink-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {isSubmitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            isCheckOut ? 'Lưu Biên bản Giao xe' : 'Lưu Biên bản Nhận xe'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
