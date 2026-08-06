import React from 'react';
import { SpecificationItem } from '../types';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

interface SpecificationViewProps {
  specifications: SpecificationItem[];
  onDownloadDocx: () => void;
  onDownloadExcel: () => void;
}

export const SpecificationView: React.FC<SpecificationViewProps> = ({
  specifications,
  onDownloadDocx,
  onDownloadExcel,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">

      {/* Header & Download */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            BẢN ĐẶC TẢ ĐỀ KIỂM TRA MÔN TIẾNG ANH (SPECIFICATIONS)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô tả chi tiết chuẩn đầu ra, yêu cầu cần đạt và phân bổ mức độ nhận thức
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDownloadDocx}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Tải File Word Matran_Dacta.docx</span>
          </button>
          
          <button
            onClick={onDownloadExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Tải Excel DacTa.xls</span>
          </button>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-2.5 border-r border-slate-200">Kỹ Năng</th>
              <th className="p-2.5 border-r border-slate-200 min-w-[140px]">Chủ Đề / Đơn Vị Kiến Thức</th>
              <th className="p-2.5 border-r border-slate-200 min-w-[220px]">Yêu Cầu Cần Đạt (Mô Tả Năng Lực)</th>
              <th className="p-2 border-r border-slate-200 text-center w-16 bg-blue-50/80 text-blue-900">Nhận Biết</th>
              <th className="p-2 border-r border-slate-200 text-center w-16 bg-emerald-50/80 text-emerald-900">Thông Hiểu</th>
              <th className="p-2 border-r border-slate-200 text-center w-16 bg-amber-50/80 text-amber-900">Vận Dụng</th>
              <th className="p-2 border-r border-slate-200 text-center w-16 bg-rose-50/80 text-rose-900">Vận Dụng Cao</th>
              <th className="p-2.5 text-center min-w-[90px] bg-indigo-100 text-indigo-950">Tổng Điểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {(Array.isArray(specifications) ? specifications : []).map((item, idx) => (
              <tr key={item?.id || idx} className="hover:bg-slate-50 transition">
                <td className="p-2.5 border-r border-slate-200 font-bold text-indigo-900 align-top">
                  {item.skill}
                </td>
                <td className="p-2.5 border-r border-slate-200 font-medium align-top">
                  {item.knowledgeUnit}
                </td>
                <td className="p-2.5 border-r border-slate-200 leading-relaxed text-slate-700 align-top">
                  {item.performanceIndicator}
                </td>
                <td className="p-2 border-r border-slate-200 text-center font-semibold text-blue-800 bg-blue-50/30 align-top">
                  {item.recognitionCount > 0 ? `${item.recognitionCount} câu` : '-'}
                </td>
                <td className="p-2 border-r border-slate-200 text-center font-semibold text-emerald-800 bg-emerald-50/30 align-top">
                  {item.comprehensionCount > 0 ? `${item.comprehensionCount} câu` : '-'}
                </td>
                <td className="p-2 border-r border-slate-200 text-center font-semibold text-amber-800 bg-amber-50/30 align-top">
                  {item.applicationCount > 0 ? `${item.applicationCount} câu` : '-'}
                </td>
                <td className="p-2 border-r border-slate-200 text-center font-semibold text-rose-800 bg-rose-50/30 align-top">
                  {item.highApplicationCount > 0 ? `${item.highApplicationCount} câu` : '-'}
                </td>
                <td className="p-2.5 text-center font-bold text-indigo-900 bg-indigo-50/40 align-top">
                  {item.totalQuestions} câu <br />
                  <span className="text-[11px] text-indigo-700">({item.totalPoints.toFixed(1)}đ)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Bản đặc tả làm căn cứ chính xác để giáo viên đối chiếu với mục tiêu cần đạt của chương trình giáo dục phổ thông môn Tiếng Anh.</span>
      </div>
    </div>
  );
};
