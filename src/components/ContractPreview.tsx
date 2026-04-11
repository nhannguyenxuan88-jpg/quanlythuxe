import { forwardRef, useRef, useState, useEffect } from 'react';
import { Booking, Car } from '../data/mock';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';
import { defaultCoreClauses } from './Settings';
import type { ContractClause, CoreClauses } from './Settings';

interface ContractPreviewProps {
  booking: Partial<Booking>;
  car?: Car;
  lessorData?: any;
}

export const ContractPreview = forwardRef<HTMLDivElement, ContractPreviewProps>(({ booking, car, lessorData: injectedLessorData }, ref) => {
  const today = new Date();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Load lessor info from Supabase settings if not injected
  const [localLessorData, setLocalLessorData] = useState<any>(null);
  const [customClauses, setCustomClauses] = useState<ContractClause[]>([]);
  const [coreClauses, setCoreClauses] = useState<CoreClauses>(defaultCoreClauses);
  
  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        if (!injectedLessorData) {
          const { data } = await supabase.from('settings').select('*').eq('key', 'lessor_info').single();
          if (data) setLocalLessorData(data.value);
        }
        // Load custom clauses
        const { data: clausesData } = await supabase.from('settings').select('*').eq('key', 'custom_clauses').single();
        if (clausesData) setCustomClauses(clausesData.value || []);
        
        // Load core clauses
        const { data: coreData } = await supabase.from('settings').select('*').eq('key', 'core_clauses').single();
        if (coreData) setCoreClauses({ ...defaultCoreClauses, ...coreData.value });
      } catch { }
    })();
  }, [injectedLessorData]);

  const lessorData = injectedLessorData || localLessorData;
  const lessorName = lessorData?.name || 'HOÀNG BÁ NGUYÊN';
  const lessorYearOfBirth = lessorData?.yearOfBirth || '1991';
  const lessorCccd = lessorData?.cccd || '066091019537';
  const lessorCccdDate = lessorData?.cccdDate || '27/11/2024';
  const lessorCccdPlace = lessorData?.cccdPlace || 'BỘ CÔNG AN';
  const lessorTempAddress = lessorData?.tempAddress || 'tổ 08 ấp nam phường TAM LONG thành phố HCM';
  const lessorPermanentAddress = lessorData?.permanentAddress || 'số nhà 77, Thôn 11, Xã PHÚ XUÂN, tỉnh ĐĂK LĂK';

  // Helper: format date string to dd/mm/yyyy
  const formatViDate = (dateStr?: string) => {
    if (!dateStr) return '....................';
    // If it looks like d/m/yyyy or dd/mm/yyyy (Vietnamese format)
    const viDateMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (viDateMatch) {
      const [, day, month, year] = viDateMatch;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    // Fallback for ISO yyyy-mm-dd or yyyy-mm-ddThh:mm
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  // Helper: format datetime to time + date parts
  const formatViDateTime = (dateStr?: string) => {
    if (!dateStr) return { time: '.... giờ .... phút', date: 'ngày ..../..../........' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { time: '.... giờ .... phút', date: 'ngày ..../..../........' };
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return {
      time: `${hours} giờ ${minutes} phút`,
      date: `ngày ${day}/${month}/${year}`
    };
  };

  const startDt = formatViDateTime(booking.startDate);
  const endDt = formatViDateTime(booking.endDate);

  const lessorSignatureRef = useRef<SignatureCanvas>(null);
  const [lessorSignatureData, setLessorSignatureData] = useState<string | null>(null);

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setSignatureData(null);
  };

  const handleEndDrawing = () => {
    if (signatureRef.current) {
      setSignatureData(signatureRef.current.getTrimmedCanvas().toDataURL('image/png'));
    }
  };

  const handleClearLessorSignature = () => {
    lessorSignatureRef.current?.clear();
    setLessorSignatureData(null);
  };

  const handleEndLessorDrawing = () => {
    if (lessorSignatureRef.current) {
      setLessorSignatureData(lessorSignatureRef.current.getTrimmedCanvas().toDataURL('image/png'));
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '......................';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div ref={ref} className="p-4 sm:p-8 max-w-4xl mx-auto print:p-0 print:m-0 text-sm leading-relaxed" style={{ fontFamily: '"Times New Roman", Times, serif', backgroundColor: '#ffffff', color: '#000000' }}>
      <div className="text-center mb-4 relative">
        <h2 className="font-bold text-base uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
        <h3 className="font-bold text-base underline">Độc lập – Tự do – Hạnh phúc</h3>
        <p className="text-sm mt-1">--------------o0o--------------</p>
      </div>

      <h1 className="text-lg font-bold text-center uppercase mb-1">HỢP ĐỒNG THUÊ XE (KHÔNG BAO GỒM TÀI)</h1>
      <p className="text-center text-sm mb-4">(Số 01/HĐCTXTL)</p>

      <div className="space-y-3 text-justify" style={{ fontSize: '13px', lineHeight: '1.7' }}>
        {/* Căn cứ pháp lý */}
        <div className="pl-2">
          <p>- Căn cứ Bộ Luật Dân sự số 91/2015/QH13 có hiệu lực thi hành từ ngày 01/01/2017;</p>
          <p>- Căn cứ Luật Thương mại số 36/2005/QH11 có hiệu lực thi hành từ ngày 01/01/2006;</p>
          <p>- Căn cứ theo nhu cầu và khả năng cung ứng của hai Bên.</p>
        </div>

        <p>Hôm nay, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}, tại <strong>{booking.contractLocation || '...........................................'}</strong>, chúng tôi gồm:</p>

        {/* BÊN A */}
        <div className="font-bold uppercase mt-3">BÊN CHO THUÊ (sau đây gọi là Bên A)</div>
        <div className="grid grid-cols-2 gap-1 pl-4">
          <div>Ông: <strong>{lessorName}</strong></div>
          <div>Sinh năm: {lessorYearOfBirth}</div>
        </div>
        <div className="pl-4">CMND/CCCD/ Hộ chiếu số: {lessorCccd} do {lessorCccdPlace} cấp ngày {lessorCccdDate}</div>
        <div className="pl-4">Tạm trú tại: {lessorTempAddress}</div>
        <div className="pl-4">Thường trú: {lessorPermanentAddress}</div>

        {/* BÊN B */}
        <div className="font-bold uppercase mt-4">BÊN THUÊ XE (BÊN B)</div>
        <div className="grid grid-cols-2 gap-1 pl-4">
          <div>Ông/Bà: <strong>{booking.customerName || '........................................'}</strong></div>
          <div>Ngày sinh: <strong>{booking.customerYearOfBirth || '..................'}</strong></div>
        </div>
        <div className="pl-4">CCCD số: <strong>{booking.customerCCCD || '......................................'}</strong></div>
        <div className="pl-4">GPLX số: <strong>{booking.customerLicenseNumber || '......................................'}</strong></div>
        <div className="pl-4">Địa chỉ thường trú: {booking.customerAddress || '...................................................................................'}</div>
        <div className="pl-4">Địa chỉ tạm trú: {booking.customerTempAddress || '...................................................................................'}</div>
        <div className="pl-4">Điện thoại: {booking.customerPhone || '......................................'}</div>

        {/* ĐIỀU 1 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG</div>
        <div className="font-bold mt-2">Điều 1. Đặc điểm và thỏa thuận thuê xe</div>
        <p>Bằng hợp đồng này, Bên A đồng ý cho Bên B thuê và bên B đồng ý thuê xe ô tô có đặc điểm sau đây:</p>
        <div className="grid grid-cols-2 gap-1 pl-4">
          <div>Nhãn hiệu: {car?.brand || '.........................'}</div>
          <div>Số loại: {car?.model || '.........................'}</div>
          <div>Loại xe: {car?.type || 'Ô TÔ con'}</div>
          <div>Màu Sơn: {car?.color || '.........................'}</div>
          <div>Số máy: {car?.engineNumber || '.........................'}</div>
          <div>Số khung: {car?.frameNumber || '.........................'}</div>
          <div>Số chỗ ngồi: {car?.seats || '.........'}</div>
        </div>
        <p className="pl-4 mt-2">
          Xe ô tô có biển số <strong>{car?.plate || '.........................'}</strong>, được mang tên {car?.ownerName || lessorName} tại địa chỉ: {car?.ownerAddress || lessorPermanentAddress}
        </p>
        <p className="pl-4">
          Giấy chứng nhận kiểm định số: {car?.inspectionNumber || '.........................'} do {car?.inspectionProvider || '.........................'} cấp ngày {car?.inspectionDate || '.........................'}
        </p>

        {/* ĐIỀU 2 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 2: THỜI GIAN THUÊ, PHỤ PHÍ PHÁT SINH</div>
        <p className="pl-4">
          <strong>2.1</strong> Thời gian thuê: Từ {startDt.time}, {startDt.date} Đến {endDt.time}, {endDt.date}
        </p>
        <div className="pl-4 mt-2">
          <strong>2.2</strong> Phụ phí phát sinh:
          {coreClauses.dieu2_2.split('\n').filter(line => line.trim()).map((line, i) => (
            <p key={i} className="pl-4 mt-1">{line}</p>
          ))}
        </div>

        {/* ĐIỀU 3 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 3: GIÁ TRỊ HỢP ĐỒNG, PHƯƠNG THỨC, HÌNH THỨC THANH TOÁN</div>
        <div className="pl-4 mt-2">
          <p><strong>3.1. Giá trị Hợp đồng:</strong></p>
          <p className="pl-4">- Đơn giá thuê xe: <strong>{car?.pricePerDay ? formatCurrency(car.pricePerDay) + '/ngày' : '......................'}</strong></p>
          <p className="pl-4">- Giá trị Hợp đồng: <strong>{formatCurrency(booking.totalAmount)}</strong></p>
          <p className="pl-4 italic text-xs mt-1">(Giá trị Hợp đồng chưa bao gồm các khoản phụ phí phát sinh. Phụ phí được Bên B thanh toán cho Bên A khi kết thúc chuyến đi)</p>
        </div>
        <div className="pl-4 mt-2">
          {coreClauses.dieu3_2.split('\n').filter(line => line.trim()).map((line, i) => (
            <p key={i}><strong>{i === 0 ? '3.2. ' : ''}</strong>{line}</p>
          ))}
        </div>
        <div className="pl-4 mt-2">
          {coreClauses.dieu3_3.split('\n').filter(line => line.trim()).map((line, i) => (
            <p key={i}><strong>{i === 0 ? '3.3. ' : ''}</strong>{line}</p>
          ))}
        </div>

        {/* ĐIỀU 4 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 4: THẾ CHẤP TÀI SẢN</div>
        <p>Khi Bên B thuê xe của Bên A phải thực hiện việc thế chấp tài sản cho Bên A, cụ thể như sau:</p>
        {coreClauses.dieu4.split('\n').filter(line => line.trim()).map((line, i) => (
          <div key={i} className="pl-4 mt-2"><p>{line}</p></div>
        ))}

        {/* ĐIỀU 5 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</div>
        <div className="mt-2">
          <p className="font-bold">5.1. Quyền của Bên A</p>
          <div className="pl-4">
            {coreClauses.dieu5_1.split('\n').filter(line => line.trim()).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <p className="font-bold">5.2. Nghĩa vụ của Bên A</p>
          <div className="pl-4">
            {coreClauses.dieu5_2.split('\n').filter(line => line.trim()).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {/* ĐIỀU 6 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 6: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</div>
        <div className="mt-2">
          <p className="font-bold">6.1. Quyền của Bên B</p>
          <div className="pl-4">
            {coreClauses.dieu6_1.split('\n').filter(line => line.trim()).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <p className="font-bold">6.2. Nghĩa vụ của Bên B</p>
          <div className="pl-4">
            {coreClauses.dieu6_2.split('\n').filter(line => line.trim()).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {/* ĐIỀU 7 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 7: ĐIỀU KHOẢN CHUNG</div>
        <div className="pl-4 mt-2">
          {coreClauses.dieu7.split('\n').filter(line => line.trim()).map((line, i) => {
            const hasPrefix = /^\d+\.\d+/.test(line);
            return (
              <p key={i} className={i > 0 ? 'mt-2' : ''}>
                {hasPrefix ? (
                  <><strong>{line.split(' ')[0]}</strong> {line.substring(line.indexOf(' ') + 1)}</>
                ) : (
                  line
                )}
              </p>
            );
          })}
        </div>

        {/* ĐIỀU KHOẢN BỔ SUNG (từ Settings) */}
        {customClauses.filter(c => c.enabled).map((clause) => (
          <div key={clause.id} className="mt-6">
            <div className="font-bold uppercase">{clause.title}</div>
            <div className="pl-4 mt-2">
              {clause.content.split('\n').filter(line => line.trim()).map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chữ ký */}
      <div className="flex justify-between mt-12 pt-8">
        <div className="text-center w-1/2 relative flex flex-col items-center">
          <p className="font-bold uppercase">BÊN A – BÊN CHO THUÊ XE</p>
          <p className="text-xs italic mb-2">(Ký, ghi rõ họ và tên)</p>
          <div className="h-40 w-full max-w-[250px] relative flex flex-col items-center justify-center border-b border-dashed print:border-none my-2" style={{ borderColor: '#d1d5db' }}>
            <div className="print:hidden w-full h-full cursor-crosshair touch-none select-none">
              <SignatureCanvas
                ref={lessorSignatureRef}
                canvasProps={{ className: 'w-full h-full' }}
                onEnd={handleEndLessorDrawing}
              />
            </div>
            {/* When printing or has signature data, show the signed image to ensure print compatibility */}
            {lessorSignatureData && (
              <img src={lessorSignatureData} alt="Lessor Signature" className="absolute select-none pointer-events-none w-full h-full object-contain drop-shadow-sm opacity-0 print:opacity-100" />
            )}
            {!lessorSignatureData && <span className="absolute select-none pointer-events-none text-xs print:hidden" style={{ color: '#d1d5db' }}>(Chủ xe ký tại đây)</span>}
          </div>
          {/* Action button hidden during print */}
          <div className="absolute top-16 -right-4 print:hidden">
            <button
              onClick={handleClearLessorSignature}
              title="Xoá chữ ký"
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors shadow-sm"
              style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}
              type="button"
            >
              <Eraser size={16} />
            </button>
          </div>
          <p className="font-bold">{lessorName}</p>
        </div>

        <div className="text-center w-1/2 relative flex flex-col items-center">
          <p className="font-bold uppercase">BÊN B – BÊN THUÊ XE</p>
          <p className="text-xs italic mb-2">(Ký, ghi rõ họ và tên)</p>
          <div className="h-40 w-full max-w-[250px] relative flex flex-col items-center justify-center border-b border-dashed print:border-none my-2" style={{ borderColor: '#d1d5db' }}>
            <div className="print:hidden w-full h-full cursor-crosshair touch-none select-none">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{ className: 'w-full h-full' }}
                onEnd={handleEndDrawing}
              />
            </div>
            {/* When printing or has signature data, show the signed image to ensure print compatibility */}
            {signatureData && (
              <img src={signatureData} alt="Client Signature" className="absolute select-none pointer-events-none w-full h-full object-contain drop-shadow-sm opacity-0 print:opacity-100" />
            )}
            {!signatureData && <span className="absolute select-none pointer-events-none text-xs print:hidden" style={{ color: '#d1d5db' }}>(Khách hàng ký tại đây)</span>}
          </div>
          {/* Action button hidden during print */}
          <div className="absolute top-16 -right-4 print:hidden">
            <button
              onClick={handleClearSignature}
              title="Xoá chữ ký"
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors shadow-sm"
              style={{ backgroundColor: '#f3f4f6', color: '#4b5563' }}
              type="button"
            >
              <Eraser size={16} />
            </button>
          </div>
          <p className="font-bold">{booking.customerName}</p>
        </div>
      </div>
    </div>
  );
});
