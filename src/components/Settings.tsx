import { useState, useEffect } from 'react';
import { Save, User, CreditCard, Loader2, FileText, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
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

export interface ContractClause {
    id: string;
    title: string;
    content: string;
    enabled: boolean;
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
    const [customClauses, setCustomClauses] = useState<ContractClause[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'lessor' | 'clauses'>('lessor');

    // Load from Supabase on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [lessorRes, clausesRes] = await Promise.all([
                    supabase.from('settings').select('*').eq('key', 'lessor_info').single(),
                    supabase.from('settings').select('*').eq('key', 'custom_clauses').single(),
                ]);

                if (lessorRes.data && !lessorRes.error) {
                    setLessorInfo({ ...defaultLessorInfo, ...lessorRes.data.value });
                }

                if (clausesRes.data && !clausesRes.error) {
                    setCustomClauses(clausesRes.data.value || []);
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
            const [lessorResult, clausesResult] = await Promise.all([
                supabase.from('settings').upsert(
                    { key: 'lessor_info', value: lessorInfo, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                ),
                supabase.from('settings').upsert(
                    { key: 'custom_clauses', value: customClauses, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                ),
            ]);

            if (lessorResult.error) throw lessorResult.error;
            if (clausesResult.error) throw clausesResult.error;
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

    // --- Custom Clauses helpers ---
    const addClause = () => {
        const nextNum = customClauses.length + 8; // Continue from Điều 7
        setCustomClauses([...customClauses, {
            id: Date.now().toString(),
            title: `ĐIỀU ${nextNum}: ĐIỀU KHOẢN BỔ SUNG`,
            content: '',
            enabled: true,
        }]);
    };

    const updateClause = (id: string, field: keyof ContractClause, value: string | boolean) => {
        setCustomClauses(customClauses.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const removeClause = (id: string) => {
        if (!window.confirm('Xóa điều khoản này?')) return;
        setCustomClauses(customClauses.filter(c => c.id !== id));
    };

    const moveClause = (index: number, direction: 'up' | 'down') => {
        const newClauses = [...customClauses];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newClauses.length) return;
        [newClauses[index], newClauses[targetIndex]] = [newClauses[targetIndex], newClauses[index]];
        setCustomClauses(newClauses);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Cài đặt</h2>
                <p className="text-slate-500 mt-1">Tùy chỉnh thông tin hệ thống và mẫu hợp đồng</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                <button
                    onClick={() => setActiveTab('lessor')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'lessor'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <User size={16} /> Thông tin Bên A
                </button>
                <button
                    onClick={() => setActiveTab('clauses')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'clauses'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <FileText size={16} /> Điều khoản HĐ
                </button>
            </div>

            {activeTab === 'lessor' && (
                <>
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
                </>
            )}

            {activeTab === 'clauses' && (
                <div className="space-y-4">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <FileText size={18} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Điều khoản bổ sung</h3>
                                    <p className="text-xs text-slate-500">Thêm các điều khoản tùy chỉnh vào cuối hợp đồng</p>
                                </div>
                            </div>
                            <button
                                onClick={addClause}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                            >
                                <Plus size={16} /> Thêm điều khoản
                            </button>
                        </div>

                        {customClauses.length === 0 ? (
                            <div className="p-8 text-center">
                                <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                                <p className="text-slate-500 text-sm font-medium">Chưa có điều khoản bổ sung nào</p>
                                <p className="text-slate-400 text-xs mt-1">Bấm "Thêm điều khoản" để bổ sung vào hợp đồng</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {customClauses.map((clause, index) => (
                                    <div key={clause.id} className={`p-5 transition-colors ${!clause.enabled ? 'bg-slate-50/70 opacity-60' : ''}`}>
                                        <div className="flex items-start gap-3">
                                            {/* Reorder controls */}
                                            <div className="flex flex-col items-center gap-0.5 pt-1 shrink-0">
                                                <button
                                                    onClick={() => moveClause(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Di chuyển lên"
                                                    type="button"
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <GripVertical size={14} className="text-slate-300" />
                                                <button
                                                    onClick={() => moveClause(index, 'down')}
                                                    disabled={index === customClauses.length - 1}
                                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="Di chuyển xuống"
                                                    type="button"
                                                >
                                                    <ChevronDown size={14} />
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={clause.title}
                                                        onChange={e => updateClause(clause.id, 'title', e.target.value)}
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold text-sm"
                                                        placeholder="VD: ĐIỀU 8: ĐIỀU KHOẢN KHÁC"
                                                    />
                                                    <label className="flex items-center gap-2 cursor-pointer shrink-0 select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={clause.enabled}
                                                            onChange={e => updateClause(clause.id, 'enabled', e.target.checked)}
                                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-xs text-slate-500 font-medium">Hiển thị</span>
                                                    </label>
                                                    <button
                                                        onClick={() => removeClause(clause.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                                                        title="Xóa điều khoản"
                                                        type="button"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <textarea
                                                    value={clause.content}
                                                    onChange={e => updateClause(clause.id, 'content', e.target.value)}
                                                    rows={4}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-y"
                                                    placeholder={"Nhập nội dung điều khoản...\n\nMỗi dòng mới sẽ được hiển thị như một mục riêng trong hợp đồng.\nVD:\n- Bên B phải đảm bảo mức pin trên 20% khi trả xe.\n- Phí phạt nếu mức pin dưới 20%: 500.000 đồng."}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preview hint */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                        <FileText size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-indigo-700">
                            <p className="font-medium">Hướng dẫn</p>
                            <ul className="mt-1 space-y-1 text-indigo-600 text-xs">
                                <li>• Các điều khoản bổ sung sẽ hiển thị <strong>sau Điều 7</strong> trong hợp đồng.</li>
                                <li>• Dùng dấu xuống dòng để tạo các mục con (mỗi dòng = 1 đoạn).</li>
                                <li>• Bỏ chọn "Hiển thị" để tạm ẩn điều khoản mà không cần xóa.</li>
                                <li>• Dùng mũi tên ▲▼ để sắp xếp thứ tự.</li>
                                <li>• Nhớ bấm <strong>"Lưu cài đặt"</strong> sau khi thay đổi.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

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
