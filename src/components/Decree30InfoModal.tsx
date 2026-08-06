import React from 'react';
import { X, ShieldCheck, FileCheck, CheckCircle2, Award, BookOpen } from 'lucide-react';

interface Decree30InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Decree30InfoModal: React.FC<Decree30InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in duration-200">

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/30 rounded-lg border border-indigo-400/30">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">Quy Định Kỹ Thuật Thể Thức Văn Bản Hành Chính</h2>
              <p className="text-xs text-indigo-200">Theo Nghị định 30/2020/NĐ-CP & Quy định Biên soạn đề thi Bộ GDĐT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-xs text-slate-700 max-h-[75vh] overflow-y-auto custom-scrollbar">

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Tự động áp dụng chuẩn 100% khi xuất tệp Word & ZIP</p>
              <p className="mt-0.5 text-xs text-emerald-800 leading-relaxed">
                Tất cả tệp tin xuất ra từ hệ thống đều tự động tuân thủ nguyên tắc trình bày thể thức văn bản hành chính chính thức của Chính phủ và Bộ Giáo dục & Đào tạo.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              1. Tiêu Chuẩn Trình Bày Trang Văn Bản (Phụ lục I - NĐ 30/2020/NĐ-CP):
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium">
              <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">Phông chữ:</span> Times New Roman
              </li>
              <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">Cỡ chữ nội dung:</span> 14pt (Nội dung chính) / 12-13pt (Bảng)
              </li>
              <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">Lề trái:</span> 30 mm (3 cm)
              </li>
              <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">Lề phải:</span> 15 mm (1.5 cm)
              </li>
              <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">Lề trên:</span> 20 mm (2 cm)
              </li>
              <li className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900">Lề dưới:</span> 20 mm (2 cm)
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              2. Tiêu Chuẩn Cấu Trúc Đề Kiểm Tra Môn Tiếng Anh THCS (Bộ GDĐT):
            </h3>
            <div className="space-y-2 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-indigo-900 mb-1">Khung Tiêu Đề Hành Chính:</p>
                <p>Cột trái ghi Tên Trường & Tên Đề kiểm tra. Cột phải ghi Mã đề thi & khung Thời gian làm bài.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-indigo-900 mb-1">Tỷ Lệ Nhận Thức Chuẩn (Ma Trận Đề):</p>
                <p>Nhận biết (40%) • Thông hiểu (30%) • Vận dụng (20%) • Vận dụng cao (10%). Tổng điểm vừa tròn 10.0 điểm.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-bold text-indigo-900 mb-1">Cấu Trúc Đóng Gói Hồ Sơ Đề Thi (.ZIP):</p>
                <p>Gồm đầy đủ 3 thành phần tệp văn bản độc lập: Matran_Dacta.docx, các file Detap_MaDeXXX.docx và DapAn_HuongDanCham.docx kèm Danh mục hồ sơ kiểm tra theo quy định.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
