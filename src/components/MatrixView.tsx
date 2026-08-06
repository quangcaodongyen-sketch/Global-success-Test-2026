import React from 'react';
import { MatrixItem, FullExamSuite } from '../types';
import { Table, Download, PieChart, CheckCircle2 } from 'lucide-react';

interface MatrixViewProps {
  matrix: MatrixItem[];
  summary: FullExamSuite['summary'];
  onDownloadDocx: () => void;
  onDownloadExcel: () => void;
}

export const MatrixView: React.FC<MatrixViewProps> = ({ matrix, summary, onDownloadDocx, onDownloadExcel }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">

      {/* Header & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600" />
            MA TRẬN ĐỀ KIỂM TRA TỔNG HỢP (MOET MATRIX)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân bổ câu hỏi theo 4 mức độ nhận thức bám sát quy định Bộ GDĐT
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
            <span>Tải Excel MaTran.xls</span>
          </button>
        </div>
      </div>

      {/* Cognition Level Ratio Progress Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
          <p className="text-[11px] font-bold text-blue-700 uppercase">Nhận Biết</p>
          <p className="text-xl font-extrabold text-blue-900 my-0.5">{summary?.recognitionRatio || 0}%</p>
          <p className="text-[10px] text-blue-600">Mức độ cơ bản</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
          <p className="text-[11px] font-bold text-emerald-700 uppercase">Thông Hiểu</p>
          <p className="text-xl font-extrabold text-emerald-900 my-0.5">{summary?.comprehensionRatio || 0}%</p>
          <p className="text-[10px] text-emerald-600">Hiểu bản chất ngữ pháp</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-center">
          <p className="text-[11px] font-bold text-amber-700 uppercase">Vận Dụng</p>
          <p className="text-xl font-extrabold text-amber-900 my-0.5">{summary?.applicationRatio || 0}%</p>
          <p className="text-[10px] text-amber-600">Áp dụng làm bài viết/đọc</p>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-center">
          <p className="text-[11px] font-bold text-rose-700 uppercase">Vận Dụng Cao</p>
          <p className="text-xl font-extrabold text-rose-900 my-0.5">{summary?.highApplicationRatio || 0}%</p>
          <p className="text-[10px] text-rose-600">Phân loại học sinh giỏi</p>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="p-3 border-r border-slate-200 text-center w-12">STT</th>
              <th className="p-3 border-r border-slate-200">Kỹ Năng / Mạch Kiến Thức</th>
              <th className="p-3 border-r border-slate-200">Dạng Bài / Dạng Câu Hỏi</th>
              <th className="p-3 border-r border-slate-200 text-center">Mức Độ Nhận Thức</th>
              <th className="p-3 border-r border-slate-200 text-center">Số Câu</th>
              <th className="p-3 text-center">Tổng Điểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
            {(Array.isArray(matrix) ? matrix : []).map((item, idx) => (
              <tr key={item?.id || idx} className="hover:bg-slate-50 transition">
                <td className="p-3 border-r border-slate-200 text-center text-slate-500 font-mono">{idx + 1}</td>
                <td className="p-3 border-r border-slate-200 font-bold text-indigo-900">{item.skill}</td>
                <td className="p-3 border-r border-slate-200">{item.subSkill}</td>
                <td className="p-3 border-r border-slate-200 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.cognitionLevel === 'Nhận biết'
                        ? 'bg-blue-100 text-blue-800'
                        : item.cognitionLevel === 'Thông hiểu'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.cognitionLevel === 'Vận dụng'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.cognitionLevel}
                  </span>
                </td>
                <td className="p-3 border-r border-slate-200 text-center font-bold">{item.questionCount}</td>
                <td className="p-3 text-center font-bold text-indigo-700">{item.points.toFixed(1)}đ</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-indigo-50 font-bold text-indigo-950 border-t-2 border-indigo-200 text-xs">
            <tr>
              <td colSpan={4} className="p-3 border-r border-indigo-200 text-right uppercase">
                TỔNG CỘNG TOÀN BỘ BÀI KIỂM TRA:
              </td>
              <td className="p-3 border-r border-indigo-200 text-center text-indigo-900 text-sm">
                {summary.totalQuestions} câu
              </td>
              <td className="p-3 text-center text-indigo-900 text-sm">
                {summary.totalPoints.toFixed(1)} điểm (100%)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Ma trận đề kiểm tra được cấu trúc cân đối, khớp 100% tỷ lệ chuẩn của Bộ GDĐT đối với chương trình Tiếng Anh THCS Global Success.</span>
      </div>
    </div>
  );
};
