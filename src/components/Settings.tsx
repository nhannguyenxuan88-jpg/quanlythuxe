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

export interface CoreClauses {
    dieu2_2: string;
    dieu3_2: string;
    dieu3_3: string;
    dieu4: string;
    dieu5_1: string;
    dieu5_2: string;
    dieu6_1: string;
    dieu6_2: string;
    dieu7: string;
}

export const defaultCoreClauses: CoreClauses = {
    dieu2_2: "Phí cầu đường: Trong thời gian thuê xe, Bên B phải chịu toàn bộ chi phí cầu đường phát sinh cho Bên A.\nTrong trường hợp bên B trả xe trễ quá 6 tiếng thì phải chịu phí 01 ngày thuê.\nPhí khử mùi: 200.000 đồng, phát sinh khi xe được hoàn trả bị ám mùi hôi khó chịu (mùi thuốc lá, thực phẩm nặng mùi).\nPhí sạc pin: Bên B được miễn phí sạc.",
    dieu3_2: "Phương thức thanh toán: Ngay khi ký hợp đồng, Bên B thanh toán trước cho Bên A 50% giá trị hợp đồng. Bên B thanh toán 50% giá trị hợp đồng còn lại và các khoản phụ phí phát sinh (nếu có) khi Bên B hoàn trả xe cho bên A.",
    dieu3_3: "Hình thức thanh toán: Do các bên thỏa thuận.",
    dieu4: "+ Trường hợp Bên B có địa chỉ thường trú tại Vũng Tàu, Bên B thực hiện việc thế chấp xe máy của mình (kèm theo cà vẹt) hoặc 10.000.000 đồng cho Bên A. Khi Bên B hoàn trả lại tài sản thuê cho Bên A, Bên A sẽ hoàn trả lại tài sản thế chấp cho Bên B.\n+ Trường hợp Bên B không có địa chỉ thường trú tại Vũng Tàu, khi thuê xe Bên B thực hiện thế chấp xe máy của mình (kèm theo cà vẹt) và 5.000.000 đồng hoặc 15.000.000 đồng cho Bên A. Khi Bên B hoàn trả lại tài sản thuê cho Bên A, Bên A sẽ hoàn trả lại tài sản thế chấp cho Bên B nhưng sẽ giữ lại số tiền 5.000.000 đồng. Trong thời hạn 5 ngày, Bên A sẽ hoàn trả cho Bên B số tiền giữ lại nếu tài sản thuê không phát sinh phạt nguội trong thời gian Bên B thuê.",
    dieu5_1: "- Nhận đủ tiền thuê và tài sản thế chấp theo như thỏa thuận.\n- Khi hết hạn Hợp đồng có quyền nhận lại tài sản thuê như tình trạng thỏa thuận ban đầu, trừ hao mòn tự nhiên.\n- Trường hợp xe có phát sinh sự cố trong chuyến đi dẫn đến phải đưa xe đi kiểm tra, sửa chữa, Bên A có quyền yêu cầu Bên B cùng tham gia vào quá trình bao gồm nhưng không giới hạn: liên hệ bảo hiểm, cùng đi giám định và sửa chữa,… Trường hợp các Bên có thỏa thuận khác, phải ghi nhận thông tin ở Biên bản bàn giao xe.\n- Có quyền đơn phương chấm dứt Hợp đồng và yêu cầu bồi thường thiệt hại nếu Bên B có các hành vi sử dụng tài sản thuê không đúng mục đích như đã thỏa thuận, làm hư hỏng, mất mát tài sản thuê, giao xe cho người khác sử dụng mà không có sự đồng ý của Bên A.\n- Báo cho Cơ quan Công an khi Bên A không liên lạc được với Bên B hoặc Bên B tắt/tháo thiết bị định vị trên xe hoặc quá thời gian thuê xe tại Hợp đồng này mà Bên B không hoàn trả xe cho Bên A.\n- Yêu cầu Bên B thực hiện nộp phạt vi phạm hành chính trong thời gian Bên B thuê xe (phạt nguội). Trường hợp Bên B không thể đi nộp phạt thì phải cung cấp giấy phép lái xe của Bên B và thanh toán trước chi phí phạt theo lỗi vi phạm, chi phí đi lại (nếu có) cho Bên A để Bên A hỗ trợ thực hiện.\n- Đối với trường hợp các Bên có thỏa thuận về việc đặt cọc tài sản, Bên A có quyền giữ tài sản đặt cọc của Bên B từ lúc nhận xe đến khi Bên B hoàn tất việc trả xe và các khoản chi phí phát sinh (nếu có).",
    dieu5_2: "- Chịu trách nhiệm pháp lý về nguồn gốc và quyền sở hữu của xe.\n- Hoàn trả tài sản thế chấp cho Bên B theo thỏa thuận tại Điều 4 khi Bên B hoàn trả tài sản thuê.\n- Giao toàn bộ giấy tờ liên quan đến xe trong tình trạng xe an toàn, vệ sinh sạch sẽ nhằm đảm bảo chất lượng dịch vụ khi Bên B sử dụng. Các giấy tờ xe liên quan bao gồm: giấy đăng ký xe ô tô, giấy kiểm định xe ô tô (bản photo), giấy bảo hiểm xe ô tô bắt buộc (bản chính).\n- Giao xe tại địa điểm bàn giao xe và đúng thời gian theo Hợp đồng này, trước khi giao xe cho Bên B, phải kiểm tra, đối chiếu thông tin khách thuê, sao chụp lại các giấy tờ nhân thân cần thiết để phục vụ nhu cầu liên hệ sau này.\n- Hỗ trợ Bên B khi xe gặp sự cố, hư hỏng cần sửa chữa trong thời gian thuê xe.",
    dieu6_1: "- Nhận đúng xe và các giấy tờ liên quan đến xe theo Hợp đồng này.\n- Trường hợp cấp thiết cần phải sửa chữa xe, Bên B có quyền được thực hiện việc sửa chữa nhưng phải thông báo trước cho Bên A về tình trạng xe đang gặp phải và những vấn đề cần khắc phục trước khi tiến hành sửa chữa.\n- Yêu cầu Bên A sửa chữa nếu xe có hư hỏng do lỗi của Bên A hoặc do hao mòn tự nhiên của xe; và bồi thường thiệt hại nếu Bên A chậm giao hoặc giao xe không đúng như thỏa thuận.\n- Yêu cầu Bên A cung cấp hóa đơn, giấy tờ thể hiện chi phí sửa chữa trong trường hợp Bên A thay mặt Bên B làm việc với nhà bảo hiểm, gara để sửa chữa xe hư hỏng do lỗi của Bên B.\n- Đơn phương chấm dứt Hợp đồng và yêu cầu bồi thường thiệt hại nếu Bên A thực hiện các hành vi sau:\n+ Bên A giao xe không đúng thời hạn như thỏa thuận, trừ trường hợp bất khả kháng (Trường hợp bất khả kháng được hiểu là một Bên cố gắng thực hiện bằng mọi biện pháp để thực hiện nghĩa vụ của mình nhưng không thể thực hiện được vì trở ngại khách quan: mưa bão, dịch bệnh…). Bên nào viện dẫn trường hợp bất khả kháng thì Bên đó có nghĩa vụ chứng minh. Trường hợp giao xe chậm gây thiệt hại cho Bên B thì phải bồi thường.\n+ Xe có khuyết tật dẫn đến Bên B không đạt được mục đích thuê mà Bên B không biết.\n+ Xe có tranh chấp về quyền sở hữu giữa Bên A với Bên thứ ba mà Bên B không biết dẫn đến Bên B không xác lập được mục đích sử dụng xe trong quá trình thuê như đã thỏa thuận.",
    dieu6_2: "- Cung cấp và tự chịu trách nhiệm về các thông tin nhân thân cần thiết theo nội dung ở phần đầu Hợp đồng và Giấy phép lái xe của mình.\n- Kiểm tra kỹ xe trước khi nhận và trước khi hoàn trả xe. Quay chụp tình trạng xe để làm căn cứ đồng thời ký xác nhận tình trạng xe khi nhận và khi hoàn trả.\n- Thanh toán cho Bên A tiền thuê xe theo thỏa thuận và toàn bộ phụ phí phát sinh trong chuyến đi ngay tại thời điểm hoàn trả xe. Bàn giao tài sản thế chấp ngay khi ký hợp đồng cho Bên A.\n- Kiểm tra kỹ và tự chịu trách nhiệm đối với tư trang, tài sản cá nhân của mình trước khi trả xe, đảm bảo không để quên, thất lạc đồ trên xe.\n- Tuân thủ quy định trả xe như đã được ký kết trong Hợp đồng. Nếu trả xe không đúng thời hạn, Bên B sẽ phải trả thêm tiền phụ trội, và số tiền trả thêm sẽ được tính theo giờ/ngày như quy định tại Điều 2 Hợp đồng này.\n- Bên B chịu trách nhiệm đền bù mọi thất thoát về phụ tùng, phụ kiện của xe: đền bù 100% theo giá phụ tùng chính hãng nếu tráo đổi linh kiện, phụ tùng; chịu 100% chi phí sửa chữa xe nếu có xảy ra hỏng hóc được xác định do lỗi của Bên B, địa điểm sửa chữa theo sự chỉ định của Bên A hoặc 2 Bên tự thỏa thuận. Các ngày xe nghỉ không chạy được do lỗi của Bên B thì Bên B phải trả tiền hoàn toàn trong các ngày đó, giá được tính bằng giá thuê trong Hợp đồng (hoặc các bên có thỏa thuận khác).\n- Nghiêm túc chấp hành đúng luật lệ giao thông đường bộ. Tự chịu trách nhiệm dân sự, hình sự, hành chính trong suốt thời gian thuê xe. Có nghĩa vụ thực hiện nộp phạt vi phạm hành chính trong lĩnh vực giao thông đường bộ căn cứ vào thời gian thuê xe của Hợp đồng này và thông báo phạt vi phạm từ cơ quan nhà nước có thẩm quyền.\n- Tuyệt đối không cho người khác thuê lại và không sử dụng xe cho các hành vi trái pháp luật: cầm cố, đua xe, chở hàng lậu, hàng cấm, … Không giao tay lái cho người không đủ năng lực hành vi, không có GPLX từ B1 trở lên. Trường hợp Bên A có căn cứ thấy rằng Bên B có dấu hiệu vi phạm thì Bên A có quyền đơn phương chấm dứt Hợp đồng, đồng thời sẽ thông báo với Cơ quan Công an và thực hiện biện pháp thu hồi xe. Bên B phải hoàn toàn chịu trách nhiệm hình sự trước pháp luật và chịu các phí tổn phát sinh khác.",
    dieu7: "7.1 Hợp đồng này, Biên bản bàn giao và các phụ lục bổ sung Hợp đồng (nếu có) là bộ phận không tách rời của Hợp đồng, các Bên phải có nghĩa vụ thực hiện, cam kết thi hành đúng các điều khoản của Hợp đồng, không Bên nào tự ý đơn phương sửa đổi, đình chỉ hoặc hủy bỏ Hợp đồng. Mọi sự vi phạm phải được xử lý theo pháp luật.\n7.2 Trong quá trình thực hiện Hợp đồng, nếu có vấn đề phát sinh các Bên sẽ cùng bàn bạc giải quyết trên tinh thần hợp tác và tôn trọng lợi ích của cả hai Bên và được thể hiện bằng văn bản. Nếu không giải quyết được thì đưa ra Tòa án nhân dân có thẩm quyền để giải quyết. Bên thua kiện sẽ chịu toàn bộ chi phí.\n7.3 Hợp đồng này tự động chấm dứt khi Bên B hoàn trả xe cho Bên A và hai Bên hoàn tất mọi nghĩa vụ phát sinh từ Hợp đồng này.\n7.4 Hợp đồng có hiệu lực kể từ thời điểm ký kết và được lập thành 02 (hai) bản, mỗi Bên giữ 01 (một) bản."
};

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
    const [coreClauses, setCoreClauses] = useState<CoreClauses>(defaultCoreClauses);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'lessor' | 'core_clauses' | 'clauses'>('lessor');

    // Load from Supabase on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [lessorRes, clausesRes, coreRes] = await Promise.all([
                    supabase.from('settings').select('*').eq('key', 'lessor_info').single(),
                    supabase.from('settings').select('*').eq('key', 'custom_clauses').single(),
                    supabase.from('settings').select('*').eq('key', 'core_clauses').single(),
                ]);

                if (lessorRes.data && !lessorRes.error) {
                    setLessorInfo({ ...defaultLessorInfo, ...lessorRes.data.value });
                }

                if (clausesRes.data && !clausesRes.error) {
                    setCustomClauses(clausesRes.data.value || []);
                }

                if (coreRes.data && !coreRes.error) {
                    setCoreClauses({ ...defaultCoreClauses, ...coreRes.data.value });
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
            const [lessorResult, clausesResult, coreResult] = await Promise.all([
                supabase.from('settings').upsert(
                    { key: 'lessor_info', value: lessorInfo, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                ),
                supabase.from('settings').upsert(
                    { key: 'custom_clauses', value: customClauses, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                ),
                supabase.from('settings').upsert(
                    { key: 'core_clauses', value: coreClauses, updated_at: new Date().toISOString() },
                    { onConflict: 'key' }
                ),
            ]);

            if (lessorResult.error) throw lessorResult.error;
            if (clausesResult.error) throw clausesResult.error;
            if (coreResult.error) throw coreResult.error;
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
                    <User size={16} /> Bên A
                </button>
                <button
                    onClick={() => setActiveTab('core_clauses')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'core_clauses'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <FileText size={16} /> Khoản cố định
                </button>
                <button
                    onClick={() => setActiveTab('clauses')}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'clauses'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Plus size={16} /> Khoản bổ sung
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

            {activeTab === 'core_clauses' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FileText size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Điều khoản cố định</h3>
                                <p className="text-xs text-slate-500">Nội dung khung của Hợp đồng thuê xe</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-6 text-sm">
                            <div>
                                <label className="block font-medium text-slate-700 mb-2 font-bold uppercase">Điều 2: Phụ phí phát sinh</label>
                                <textarea rows={4} value={coreClauses.dieu2_2} onChange={e => setCoreClauses({...coreClauses, dieu2_2: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed" />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-2 font-bold uppercase">Điều 3: Phương thức & Hình thức thanh toán</label>
                                <textarea rows={3} value={coreClauses.dieu3_2} onChange={e => setCoreClauses({...coreClauses, dieu3_2: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed mb-3" placeholder="3.2. Phương thức thanh toán..." />
                                <textarea rows={2} value={coreClauses.dieu3_3} onChange={e => setCoreClauses({...coreClauses, dieu3_3: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed" placeholder="3.3. Hình thức thanh toán..." />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-2 font-bold uppercase">Điều 4: Thế chấp tài sản</label>
                                <textarea rows={6} value={coreClauses.dieu4} onChange={e => setCoreClauses({...coreClauses, dieu4: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed" />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-2 font-bold uppercase">Điều 5: Quyền & Nghĩa vụ Bên A</label>
                                <textarea rows={6} value={coreClauses.dieu5_1} onChange={e => setCoreClauses({...coreClauses, dieu5_1: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed mb-3" placeholder="5.1. Quyền của Bên A..." />
                                <textarea rows={6} value={coreClauses.dieu5_2} onChange={e => setCoreClauses({...coreClauses, dieu5_2: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed" placeholder="5.2. Nghĩa vụ của Bên A..." />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-2 font-bold uppercase">Điều 6: Quyền & Nghĩa vụ Bên B</label>
                                <textarea rows={6} value={coreClauses.dieu6_1} onChange={e => setCoreClauses({...coreClauses, dieu6_1: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed mb-3" placeholder="6.1. Quyền của Bên B..." />
                                <textarea rows={6} value={coreClauses.dieu6_2} onChange={e => setCoreClauses({...coreClauses, dieu6_2: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed" placeholder="6.2. Nghĩa vụ của Bên B..." />
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-2 font-bold uppercase">Điều 7: Điều khoản chung</label>
                                <textarea rows={6} value={coreClauses.dieu7} onChange={e => setCoreClauses({...coreClauses, dieu7: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y text-sm leading-relaxed" />
                            </div>
                        </div>
                    </div>
                </div>
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
