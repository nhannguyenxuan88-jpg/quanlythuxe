import { forwardRef, useRef, useState, useEffect } from 'react';
import { Booking, Car } from '../data/mock';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';

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
  useEffect(() => {
    if (injectedLessorData) return;
    (async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data } = await supabase.from('settings').select('*').eq('key', 'lessor_info').single();
        if (data) setLocalLessorData(data.value);
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

  return (
    <div ref={ref} className="p-4 sm:p-8 max-w-4xl mx-auto print:p-0 print:m-0 text-sm leading-relaxed" style={{ fontFamily: '"Times New Roman", Times, serif', backgroundColor: '#ffffff', color: '#000000' }}>
      <div className="text-center mb-6 relative">
        <h2 className="font-bold text-lg uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h2>
        <h3 className="font-bold text-base underline">Độc lập – Tự do – Hạnh phúc</h3>
      </div>

      <h1 className="text-xl font-bold text-center uppercase mb-6">HỢP ĐỒNG THUÊ XE (KHÔNG BAO GỒM TÀI)</h1>

      <div className="space-y-4 text-justify">
        <p>Hôm nay, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}, tại <strong>{booking.contractLocation || '...........................................'}</strong>, chúng tôi gồm:</p>

        <div className="font-bold uppercase mt-2">BÊN CHO THUÊ (sau đây gọi là Bên A)</div>
        <div className="grid grid-cols-2 gap-2 pl-4">
          <div>Ông: <strong>{lessorName}</strong></div>
          <div>Sinh năm: {lessorYearOfBirth}</div>
        </div>
        <div className="pl-4">CMND/CCCD/ Hộ chiếu số: {lessorCccd} do {lessorCccdPlace} cấp ngày {lessorCccdDate}</div>
        <div className="pl-4">Tạm trú tại: {lessorTempAddress}</div>
        <div className="pl-4">Thường trú: {lessorPermanentAddress}</div>

        <div className="font-bold uppercase mt-4">BÊN THUÊ (Sau đây gọi tắt là Bên B)</div>
        <div className="grid grid-cols-2 gap-2 pl-4">
          <div>Ông/Bà: <strong>{booking.customerName || '........................................'}</strong></div>
          <div>Sinh năm: <strong>{formatViDate(booking.customerYearOfBirth)}</strong></div>
        </div>
        <div className="pl-4">CMND/CCCD/Hộ chiếu số: <strong>{booking.customerCCCD || '......................................'}</strong> do <strong>{booking.customerCccdPlace || '....................'}</strong> cấp ngày <strong>{formatViDate(booking.customerCccdDate)}</strong></div>
        <div className="pl-4">Hộ khẩu thường trú tại: {booking.customerAddress || '...................................................................................'}</div>
        <div className="pl-4">Điện thoại: {booking.customerPhone || '......................................'}</div>

        <p className="mt-4 italic">Hai bên đã thỏa thuận và thống nhất ký kết Hợp đồng thuê xe ô tô với những điều khoản cụ thể như sau:</p>

        <div className="font-bold mt-2">Điều 1. Đặc điểm và thỏa thuận thuê xe</div>
        <p>Bằng hợp đồng này, Bên A đồng ý cho Bên B thuê và bên B đồng ý thuê xe ô tô có đặc điểm sau đây:</p>
        <div className="grid grid-cols-2 gap-2 pl-4">
          <div>Nhãn hiệu: {car?.brand || '.........................'}</div>
          <div>Số loại: {car?.model || '.........................'}</div>
          <div>Loại xe: {car?.type || '.........................'}</div>
          <div>Màu Sơn: {car?.color || '.........................'}</div>
          <div>Số máy: {car?.engineNumber || '.........................'}</div>
          <div>Số khung: {car?.frameNumber || '.........................'}</div>
          <div>Số chỗ ngồi: {car?.seats || '.........'}</div>
        </div>
        <p className="pl-4 mt-2">
          Xe ô tô có biển số <strong>{car?.plate || '.........................'}</strong>, được mang tên {car?.ownerName || '.........................'} tại địa chỉ: {car?.ownerAddress || '..................................................'}.<br />
          Giấy chứng nhận kiểm định số: {car?.inspectionNumber || '.........................'} do {car?.inspectionProvider || '.........................'} cấp ngày {car?.inspectionDate || '.........................'}.
        </p>
        <div className="pl-4 mt-2">
          - Bên A cam đoan trước khi ký bản Hợp đồng này, xe ô tô nêu trên:<br />
          &nbsp;&nbsp;+ Không có tranh chấp về quyền sở hữu/sử dụng;<br />
          &nbsp;&nbsp;+ Không bị ràng buộc bởi bất kỳ Hợp đồng thuê xe ô tô nào đang có hiệu lực.<br />
          - Bên B cam đoan: Bên B được cấp giấy phép lái xe hạng <strong>{booking.customerLicenseClass || '...........'}</strong> số <strong>{booking.customerLicenseNumber || '....................'}</strong> có giá trị đến ngày <strong>{formatViDate(booking.customerLicenseExpiry)}</strong> (nếu bên B với tư cách cá nhân)
        </div>

        <div className="font-bold mt-4">Điều 2. Thời hạn thuê xe ô tô</div>
        <p>
          Thời hạn thuê là từ ngày {booking.startDate ? format(new Date(booking.startDate), 'dd/MM/yyyy HH:mm') : '......................'} đến ngày {booking.endDate ? format(new Date(booking.endDate), 'dd/MM/yyyy HH:mm') : '......................'}
        </p>

        <div className="font-bold mt-4">Điều 3. Mục đích thuê</div>
        <p>Bên B sử dụng tài sản thuê nêu trên vào mục đích đi <strong>{booking.rentalPurpose || '..............................................................'}</strong></p>

        <div className="font-bold mt-4">Điều 4: Giá thuê và phương thức thanh toán</div>
        <p>1. Giá thuê tài sản nêu trên là: <strong>{booking.totalAmount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount) : '......................'}</strong></p>
        <p>2. Phương thức thanh toán: Thanh toán bằng <strong>{booking.paymentMethod || '........................'}</strong> và Bên B phải thanh toán cho Bên A số tiền thuê xe ô tô nêu trên vào ngày <strong>{formatViDate(booking.paymentDate)}</strong></p>
        <p>3. Việc giao và nhận số tiền nêu trên do hai bên tự thực hiện và chịu trách nhiệm trước pháp luật.</p>
        <p>4. Bên B cọc là <strong>{booking.depositAmount || '......................'}</strong> thế chấp, Bên A phải hoàn trả số tiền này ngay khi nhận lại xe.</p>

        <div className="font-bold mt-4">Điều 5: Phương thức giao, trả lại tài sản thuê</div>
        <p>Hết thời hạn thuê nêu trên, Bên B phải giao trả chiếc xe ô tô trên cho Bên A.</p>

        <div className="font-bold mt-4">Điều 6: Nghĩa vụ và quyền của Bên A</div>
        <p>1. Bên A có các nghĩa vụ sau đây:<br />
          a) Chuyển giao xe cho thuê đúng thỏa thuận ghi trong Hợp đồng;<br />
          b) Bảo đảm giá trị sử dụng của tài sản cho thuê;<br />
          c) Bảo đảm quyền sử dụng xe cho Bên B;</p>
        <p>2. Bên A có quyền sau đây:<br />
          a) Nhận đủ tiền thuê tài sản theo phương thức đã thỏa thuận;<br />
          b) Nhận lại xe thuê khi hết hạn Hợp đồng;<br />
          c) Đơn phương đình chỉ thực hiện Hợp đồng và yêu cầu bồi thường thiệt hại nếu Bên B có một trong các hành vi sau đây:<br />
          - Không trả tiền thuê trong ngày<br />
          - Sử dụng xe thuê không đúng công dụng; mục đích của tài sản;<br />
          - Làm tài sản thuê mất mát, hư hỏng;<br />
          - Sửa chữa, đổi hoặc cho người khác thuê lại mà không có sự đồng ý của Bên A;</p>

        <div className="font-bold mt-4">Điều 7: Nghĩa vụ và quyền của Bên B</div>
        <p>1. Bên B có các nghĩa vụ sau đây:<br />
          a) Bảo quản tài sản thuê như tài sản của chính mình, không được thay đổi tình trạng tài sản, không được cho thuê lại tài sản nếu không có sự đồng ý của Bên A;<br />
          b) Sử dụng tài sản thuê đúng công dụng, mục đích của tài sản;<br />
          c) Trả đủ tiền thuê tài sản theo phương thức đã thỏa thuận;<br />
          d) Trả lại tài sản thuê đúng thời hạn và phương thức đã thỏa thuận;<br />
          e) Chịu toàn bộ chi phí liên quan đến chiếc xe trong quá trình thuê. Trong quá trình thuê xe mà Bên B gây ra tai nạn, hỏng hóc xe thì Bên B phải có trách nhiệm thông báo ngay cho Bên A và chịu trách nhiệm sửa chữa, phục hồi nguyên trạng xe cho Bên A.</p>
        <p>2. Bên B có các quyền sau đây:<br />
          a) Nhận tài sản thuê theo đúng thỏa thuận;<br />
          b) Được sử dụng tài sản thuê theo đúng công dụng, mục đích của tài sản;<br />
          c) Đơn phương đình chỉ thực hiện Hợp đồng thuê tài sản và yêu cầu bồi thường thiệt hại nếu:<br />
          - Bên A chậm giao tài sản theo thỏa thuận gây thiệt hại cho Bên B;<br />
          - Bên A giao tài sản thuê không đúng đặc điểm, tình trạng như mô tả tại Điều 1 Hợp đồng;</p>

        <div className="font-bold mt-4">Điều 8: Cam đoan của các bên</div>
        <p>Bên A và Bên B chịu trách nhiệm trước pháp luật về những lời cam đoan sau đây:</p>
        <p>1. Bên A cam đoan:<br />
          - Những thông tin về nhân thân, về chiếc xe ô tô nêu trên này là hoàn toàn đúng sự thật;<br />
          - Không bỏ sót thành viên nào cùng có quyền sở hữu xe ô tô nêu trên để ký Hợp đồng này; Nếu có bất kỳ một khiếu kiện nào của thành viên cùng có quyền sở hữu xe ô tô trên bị bỏ sót thì Bên A ký tên/điểm chỉ trong Hợp đồng này xin hoàn toàn chịu trách nhiệm trước pháp luật, kể cả việc phải mang tài sản chung, riêng của mình để đảm bảo cho trách nhiệm đó;<br />
          - Xe ô tô nêu trên hiện tại thuộc quyền sở hữu, sử dụng hợp pháp của Bên A, không có tranh chấp, không bị ràng buộc dưới bất cứ hình thức nào bởi các giao dịch đang tồn tại như: Cầm cố, thế chấp, bảo lãnh, mua bán, trao đổi, tặng cho, cho thuê, cho mượn, góp vốn vào doanh nghiệp hay bất kỳ một quyết định nào của cơ quan nhà nước có thẩm quyền nhằm hạn chế quyền định đoạt của Bên A;<br />
          - Việc giao kết Hợp đồng này là hoàn toàn tự nguyện, dứt khoát, không bị lừa dối hoặc ép buộc;<br />
          - Thực hiện đúng và đầy đủ tất cả các thỏa thuận đã ghi trong bản Hợp đồng này;<br />
          - Không vận hành kinh doanh vận tải.</p>
        <p>2. Bên B cam đoan:<br />
          a. Những thông tin pháp nhân, nhân thân đã ghi trong Hợp đồng này là đúng sự thật;<br />
          b. Đã xem xét kỹ, biết rõ về tài sản thuê;<br />
          c. Việc giao kết Hợp đồng này hoàn toàn tự nguyện, không bị lừa dối hoặc ép buộc;<br />
          d. Thực hiện đúng và đầy đủ tất cả các thoả thuận đã ghi trong Hợp đồng này;<br />
          e. Nếu trong quá trình sử dụng xe, có phát sinh những lỗi vi phạm giao thông sẽ phải bồi thường thiệt hại cho chủ xe (những vấn đề về phạt nguội, …)<br />
          f. Bên B phải đảm bảo khi trả xe cho bên A thì mức pin phải luôn trên 20% để bên A có thể di chuyển. (Mức phạt 500k nếu mức pin dưới 20%)</p>
        <p>3. Hai bên cam đoan:<br />
          - Các bên cam kết mọi giấy tờ về nhân thân và tài sản đều là giấy tờ thật, cấp đúng thẩm quyền, còn nguyên giá trị pháp lý và không bị tẩy xóa, sửa chữa. Nếu sai các bên hoàn toàn chịu trách nhiệm trước pháp luật kể cả việc mang tài sản chung, riêng để đảm bảo cho lời cam đoan trên. <br />
          - Nếu có thắc mắc, khiếu nại, khiếu kiện dẫn đến Hợp đồng vô hiệu (kể cả vô hiệu một phần) thì các bên tự chịu trách nhiệm trước pháp luật. <br />
          - Tại thời điểm ký kết, các bên hoàn toàn minh mẫn, sáng suốt, có đầy đủ năng lực hành vi dân sự, cam đoan đã biết rõ về nhân thân và thông tin về những người có tên trong Hợp đồng này.</p>
      </div>

      <div className="flex justify-between mt-12 pt-8">
        <div className="text-center w-1/2 relative flex flex-col items-center">
          <p className="font-bold uppercase">BÊN CHO THUÊ</p>
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
          <div className="absolute top-10 -right-4 print:hidden">
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
          <p className="font-bold">HOÀNG BÁ NGUYÊN</p>
        </div>

        <div className="text-center w-1/2 relative flex flex-col items-center">
          <p className="font-bold uppercase">BÊN THUÊ</p>
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
          <div className="absolute top-10 -right-4 print:hidden">
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
