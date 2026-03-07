import { useState, useEffect } from 'react';
import { Save, User, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface LessorInfo {
    name: string;
    yearOfBirth: string;
    cccd: string;
    cccdDate: string;
    cccdPlace: string;
    tempAddress: string;
    permanentAddress: string;
    phone: string;
    defaultDeposit: number;
}

const defaultLessorInfo: LessorInfo = {
    name: 'HOÀNG BÁ NGUYÊN',
    yearOfBirth: '1991',
    cccd: '066091019537',
    cccdDate: '27/11/2024',
    cccdPlace: 'BỘ CÔNG AN',
    tempAddress: 'tổ 08 ấp nam phường TAM LONG thành phố HCM',
    permanentAddress: 'số nhà 77, Thôn 11, Xã PHÚ XUÂN, tỉnh ĐĂK LĂK',
    phone: '',
    defaultDeposit: 15000000,
};

export function Settings() {
    const [lessorInfo, setLessorInfo] = useState<LessorInfo>(defaultLessorInfo);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load from Supabase on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('settings')
                    .select('*')
                    .eq('key', 'lessor_info')
                    .single();

                if (data && !error) {
                    setLessorInfo({ ...defaultLessorInfo, ...data.value });
                }
            } catch (err) {
                // Table might not exist yet, use defaults
                console.log('Settings not found, using defaults');
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('settings')
                .upsert(
                    { key: 'lessor_info', value: lessorInfo, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                );

            if (error) throw error;
            toast.success('Đã lưu cài đặt lên hệ thống!');
        } catch (err: any) {
            toast.error('Lỗi khi lưu: ' + err.message);
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Cài đặt</h2>
                <p className="text-slate-500 mt-1">Tùy chỉnh thông tin hệ thống và mẫu hợp đồng</p>
            </div>

            {/* Lessor Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <User size={18} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Thông tin Bên A (Chủ xe)</h3>
                        <p className="text-xs text-slate-500">Hiển thị trên Hợp đồng thuê xe • Lưu trên đám mây</p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên *</label>
                            <input
                                type="text"
                                value={lessorInfo.name}
                                onChange={e => setLessorInfo({ ...lessorInfo, name: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Năm sinh</label>
                            <input
                                type="text"
                                value={lessorInfo.yearOfBirth}
                                onChange={e => setLessorInfo({ ...lessorInfo, yearOfBirth: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Số CCCD</label>
                        <input
                            type="text"
                            value={lessorInfo.cccd}
                            onChange={e => setLessorInfo({ ...lessorInfo, cccd: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ngày cấp CCCD</label>
                            <input
                                type="text"
                                value={lessorInfo.cccdDate}
                                onChange={e => setLessorInfo({ ...lessorInfo, cccdDate: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="dd/mm/yyyy"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nơi cấp</label>
                            <input
                                type="text"
                                value={lessorInfo.cccdPlace}
                                onChange={e => setLessorInfo({ ...lessorInfo, cccdPlace: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tạm trú tại</label>
                        <input
                            type="text"
                            value={lessorInfo.tempAddress}
                            onChange={e => setLessorInfo({ ...lessorInfo, tempAddress: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Thường trú</label>
                        <input
                            type="text"
                            value={lessorInfo.permanentAddress}
                            onChange={e => setLessorInfo({ ...lessorInfo, permanentAddress: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">SĐT liên hệ</label>
                        <input
                            type="text"
                            value={lessorInfo.phone}
                            onChange={e => setLessorInfo({ ...lessorInfo, phone: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Default Values */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CreditCard size={18} className="text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Giá trị mặc định</h3>
                        <p className="text-xs text-slate-500">Tự động điền khi tạo đơn mới</p>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tiền cọc mặc định (VNĐ)</label>
                        <input
                            type="number"
                            value={lessorInfo.defaultDeposit}
                            onChange={e => setLessorInfo({ ...lessorInfo, defaultDeposit: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-1">Hiện tại: {formatCurrency(lessorInfo.defaultDeposit)} VNĐ</p>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors w-full justify-center"
            >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
        </div>
    );
}
