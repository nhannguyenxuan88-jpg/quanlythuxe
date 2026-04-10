import { forwardRef, useRef, useState, useEffect } from 'react';
import { Booking, Car } from '../data/mock';
import { format } from 'date-fns';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';
import type { ContractClause } from './Settings';

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
      time: `${hours}h giờ ${minutes} phút`,
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
        <div className="pl-4">Ông/Bà: <strong>{booking.customerName || '........................................'}</strong></div>
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
          <p className="pl-4 mt-1"><strong>Phí cầu đường:</strong> Trong thời gian thuê xe, Bên B phải chịu toàn bộ chi phí cầu đường phát sinh cho Bên A.</p>
          <p className="pl-4 mt-1">Trong trường hợp bên B trả xe trễ quá 6 tiếng thì phải chịu phí 01 ngày thuê.</p>
          <p className="pl-4 mt-1"><strong>Phí khử mùi:</strong> 200.000 đồng, phát sinh khi xe được hoàn trả bị ám mùi hôi khó chịu (mùi thuốc lá, thực phẩm nặng mùi).</p>
          <p className="pl-4 mt-1"><strong>Phí sạc pin:</strong> Bên B được miễn phí sạc.</p>
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
          <p><strong>3.2. Phương thức thanh toán:</strong> Ngay khi ký hợp đồng, Bên B thanh toán trước cho Bên A 50% giá trị hợp đồng. Bên B thanh toán 50% giá trị hợp đồng còn lại và các khoản phụ phí phát sinh (nếu có) khi Bên B hoàn trả xe cho bên A.</p>
        </div>
        <div className="pl-4 mt-2">
          <p><strong>3.3. Hình thức thanh toán:</strong> Do các bên thỏa thuận.</p>
        </div>

        {/* ĐIỀU 4 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 4: THẾ CHẤP TÀI SẢN</div>
        <p>Khi Bên B thuê xe của Bên A phải thực hiện việc thế chấp tài sản cho Bên A, cụ thể như sau:</p>
        <div className="pl-4 mt-2">
          <p>+ Trường hợp Bên B có địa chỉ thường trú tại Vũng Tàu, Bên B thực hiện việc thế chấp xe máy của mình (kèm theo cà vẹt) hoặc 10.000.000 đồng cho Bên A. Khi Bên B hoàn trả lại tài sản thuê cho Bên A, Bên A sẽ hoàn trả lại tài sản thế chấp cho Bên B.</p>
        </div>
        <div className="pl-4 mt-2">
          <p>+ Trường hợp Bên B không có địa chỉ thường trú tại Vũng Tàu, khi thuê xe Bên B thực hiện thế chấp xe máy của mình (kèm theo cà vẹt) và 5.000.000 đồng hoặc 15.000.000 đồng cho Bên A. Khi Bên B hoàn trả lại tài sản thuê cho Bên A, Bên A sẽ hoàn trả lại tài sản thế chấp cho Bên B nhưng sẽ giữ lại số tiền 5.000.000 đồng. Trong thời hạn 5 ngày, Bên A sẽ hoàn trả cho Bên B số tiền giữ lại nếu tài sản thuê không phát sinh phạt nguội trong thời gian Bên B thuê.</p>
        </div>

        {/* ĐIỀU 5 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 5: QUYỀN VÀ NGHĨA VỤ CỦA BÊN A</div>
        <div className="mt-2">
          <p className="font-bold">5.1. Quyền của Bên A</p>
          <div className="pl-4">
            <p>- Nhận đủ tiền thuê và tài sản thế chấp theo như thỏa thuận.</p>
            <p>- Khi hết hạn Hợp đồng có quyền nhận lại tài sản thuê như tình trạng thỏa thuận ban đầu, trừ hao mòn tự nhiên.</p>
            <p>- Trường hợp xe có phát sinh sự cố trong chuyến đi dẫn đến phải đưa xe đi kiểm tra, sửa chữa, Bên A có quyền yêu cầu Bên B cùng tham gia vào quá trình bao gồm nhưng không giới hạn: liên hệ bảo hiểm, cùng đi giám định và sửa chữa,… Trường hợp các Bên có thỏa thuận khác, phải ghi nhận thông tin ở Biên bản bàn giao xe.</p>
            <p>- Có quyền đơn phương chấm dứt Hợp đồng và yêu cầu bồi thường thiệt hại nếu Bên B có các hành vi sử dụng tài sản thuê không đúng mục đích như đã thỏa thuận, làm hư hỏng, mất mát tài sản thuê, giao xe cho người khác sử dụng mà không có sự đồng ý của Bên A.</p>
            <p>- Báo cho Cơ quan Công an khi Bên A không liên lạc được với Bên B hoặc Bên B tắt/tháo thiết bị định vị trên xe hoặc quá thời gian thuê xe tại Hợp đồng này mà Bên B không hoàn trả xe cho Bên A.</p>
            <p>- Yêu cầu Bên B thực hiện nộp phạt vi phạm hành chính trong thời gian Bên B thuê xe (phạt nguội). Trường hợp Bên B không thể đi nộp phạt thì phải cung cấp giấy phép lái xe của Bên B và thanh toán trước chi phí phạt theo lỗi vi phạm, chi phí đi lại (nếu có) cho Bên A để Bên A hỗ trợ thực hiện.</p>
            <p>- Đối với trường hợp các Bên có thỏa thuận về việc đặt cọc tài sản, Bên A có quyền giữ tài sản đặt cọc của Bên B từ lúc nhận xe đến khi Bên B hoàn tất việc trả xe và các khoản chi phí phát sinh (nếu có).</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="font-bold">5.2. Nghĩa vụ của Bên A</p>
          <div className="pl-4">
            <p>- Chịu trách nhiệm pháp lý về nguồn gốc và quyền sở hữu của xe.</p>
            <p>- Hoàn trả tài sản thế chấp cho Bên B theo thỏa thuận tại Điều 4 khi Bên B hoàn trả tài sản thuê.</p>
            <p>- Giao toàn bộ giấy tờ liên quan đến xe trong tình trạng xe an toàn, vệ sinh sạch sẽ nhằm đảm bảo chất lượng dịch vụ khi Bên B sử dụng. Các giấy tờ xe liên quan bao gồm: giấy đăng ký xe ô tô, giấy kiểm định xe ô tô (bản photo), giấy bảo hiểm xe ô tô bắt buộc (bản chính).</p>
            <p>- Giao xe tại địa điểm bàn giao xe và đúng thời gian theo Hợp đồng này, trước khi giao xe cho Bên B, phải kiểm tra, đối chiếu thông tin khách thuê, sao chụp lại các giấy tờ nhân thân cần thiết để phục vụ nhu cầu liên hệ sau này.</p>
            <p>- Hỗ trợ Bên B khi xe gặp sự cố, hư hỏng cần sửa chữa trong thời gian thuê xe.</p>
          </div>
        </div>

        {/* ĐIỀU 6 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 6: QUYỀN VÀ NGHĨA VỤ CỦA BÊN B</div>
        <div className="mt-2">
          <p className="font-bold">6.1. Quyền của Bên B</p>
          <div className="pl-4">
            <p>- Nhận đúng xe và các giấy tờ liên quan đến xe theo Hợp đồng này.</p>
            <p>- Trường hợp cấp thiết cần phải sửa chữa xe, Bên B có quyền được thực hiện việc sửa chữa nhưng phải thông báo trước cho Bên A về tình trạng xe đang gặp phải và những vấn đề cần khắc phục trước khi tiến hành sửa chữa.</p>
            <p>- Yêu cầu Bên A sửa chữa nếu xe có hư hỏng do lỗi của Bên A hoặc do hao mòn tự nhiên của xe; và bồi thường thiệt hại nếu Bên A chậm giao hoặc giao xe không đúng như thỏa thuận.</p>
            <p>- Yêu cầu Bên A cung cấp hóa đơn, giấy tờ thể hiện chi phí sửa chữa trong trường hợp Bên A thay mặt Bên B làm việc với nhà bảo hiểm, gara để sửa chữa xe hư hỏng do lỗi của Bên B.</p>
            <p>- Đơn phương chấm dứt Hợp đồng và yêu cầu bồi thường thiệt hại nếu Bên A thực hiện các hành vi sau:</p>
            <div className="pl-4">
              <p>+ Bên A giao xe không đúng thời hạn như thỏa thuận, trừ trường hợp bất khả kháng (Trường hợp bất khả kháng được hiểu là một Bên cố gắng thực hiện bằng mọi biện pháp để thực hiện nghĩa vụ của mình nhưng không thể thực hiện được vì trở ngại khách quan: mưa bão, dịch bệnh…). Bên nào viện dẫn trường hợp bất khả kháng thì Bên đó có nghĩa vụ chứng minh. Trường hợp giao xe chậm gây thiệt hại cho Bên B thì phải bồi thường.</p>
              <p>+ Xe có khuyết tật dẫn đến Bên B không đạt được mục đích thuê mà Bên B không biết.</p>
              <p>+ Xe có tranh chấp về quyền sở hữu giữa Bên A với Bên thứ ba mà Bên B không biết dẫn đến Bên B không xác lập được mục đích sử dụng xe trong quá trình thuê như đã thỏa thuận.</p>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <p className="font-bold">6.2. Nghĩa vụ của Bên B</p>
          <div className="pl-4">
            <p>- Cung cấp và tự chịu trách nhiệm về các thông tin nhân thân cần thiết theo nội dung ở phần đầu Hợp đồng và Giấy phép lái xe của mình.</p>
            <p>- Kiểm tra kỹ xe trước khi nhận và trước khi hoàn trả xe. Quay chụp tình trạng xe để làm căn cứ đồng thời ký xác nhận tình trạng xe khi nhận và khi hoàn trả.</p>
            <p>- Thanh toán cho Bên A tiền thuê xe theo thỏa thuận và toàn bộ phụ phí phát sinh trong chuyến đi ngay tại thời điểm hoàn trả xe. Bàn giao tài sản thế chấp ngay khi ký hợp đồng cho Bên A.</p>
            <p>- Kiểm tra kỹ và tự chịu trách nhiệm đối với tư trang, tài sản cá nhân của mình trước khi trả xe, đảm bảo không để quên, thất lạc đồ trên xe.</p>
            <p>- Tuân thủ quy định trả xe như đã được ký kết trong Hợp đồng. Nếu trả xe không đúng thời hạn, Bên B sẽ phải trả thêm tiền phụ trội, và số tiền trả thêm sẽ được tính theo giờ/ngày như quy định tại Điều 2 Hợp đồng này.</p>
            <p>- Bên B chịu trách nhiệm đền bù mọi thất thoát về phụ tùng, phụ kiện của xe: đền bù 100% theo giá phụ tùng chính hãng nếu tráo đổi linh kiện, phụ tùng; chịu 100% chi phí sửa chữa xe nếu có xảy ra hỏng hóc được xác định do lỗi của Bên B, địa điểm sửa chữa theo sự chỉ định của Bên A hoặc 2 Bên tự thỏa thuận. Các ngày xe nghỉ không chạy được do lỗi của Bên B thì Bên B phải trả tiền hoàn toàn trong các ngày đó, giá được tính bằng giá thuê trong Hợp đồng (hoặc các bên có thỏa thuận khác).</p>
            <p>- Nghiêm túc chấp hành đúng luật lệ giao thông đường bộ. Tự chịu trách nhiệm dân sự, hình sự, hành chính trong suốt thời gian thuê xe. Có nghĩa vụ thực hiện nộp phạt vi phạm hành chính trong lĩnh vực giao thông đường bộ căn cứ vào thời gian thuê xe của Hợp đồng này và thông báo phạt vi phạm từ cơ quan nhà nước có thẩm quyền.</p>
            <p>- Tuyệt đối không cho người khác thuê lại và không sử dụng xe cho các hành vi trái pháp luật: cầm cố, đua xe, chở hàng lậu, hàng cấm, … Không giao tay lái cho người không đủ năng lực hành vi, không có GPLX từ B1 trở lên. Trường hợp Bên A có căn cứ thấy rằng Bên B có dấu hiệu vi phạm thì Bên A có quyền đơn phương chấm dứt Hợp đồng, đồng thời sẽ thông báo với Cơ quan Công an và thực hiện biện pháp thu hồi xe. Bên B phải hoàn toàn chịu trách nhiệm hình sự trước pháp luật và chịu các phí tổn phát sinh khác.</p>
          </div>
        </div>

        {/* ĐIỀU 7 */}
        <div className="font-bold mt-6 uppercase">ĐIỀU 7: ĐIỀU KHOẢN CHUNG</div>
        <div className="pl-4 mt-2">
          <p><strong>7.1</strong> Hợp đồng này, Biên bản bàn giao và các phụ lục bổ sung Hợp đồng (nếu có) là bộ phận không tách rời của Hợp đồng, các Bên phải có nghĩa vụ thực hiện, cam kết thi hành đúng các điều khoản của Hợp đồng, không Bên nào tự ý đơn phương sửa đổi, đình chỉ hoặc hủy bỏ Hợp đồng. Mọi sự vi phạm phải được xử lý theo pháp luật.</p>
          <p className="mt-2"><strong>7.2</strong> Trong quá trình thực hiện Hợp đồng, nếu có vấn đề phát sinh các Bên sẽ cùng bàn bạc giải quyết trên tinh thần hợp tác và tôn trọng lợi ích của cả hai Bên và được thể hiện bằng văn bản. Nếu không giải quyết được thì đưa ra Tòa án nhân dân có thẩm quyền để giải quyết. Bên thua kiện sẽ chịu toàn bộ chi phí.</p>
          <p className="mt-2"><strong>7.3</strong> Hợp đồng này tự động chấm dứt khi Bên B hoàn trả xe cho Bên A và hai Bên hoàn tất mọi nghĩa vụ phát sinh từ Hợp đồng này.</p>
          <p className="mt-2"><strong>7.4</strong> Hợp đồng có hiệu lực kể từ thời điểm ký kết và được lập thành 02 (hai) bản, mỗi Bên giữ 01 (một) bản.</p>
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
