import React from 'react';
import { ExamPaper } from '../types';
import { CheckCircle2, Download, Volume2, Award, FileSpreadsheet } from 'lucide-react';

interface AnswerKeyViewProps {
  paper: ExamPaper;
  onDownloadDocx: () => void;
}

export const AnswerKeyView: React.FC<AnswerKeyViewProps> = ({ paper, onDownloadDocx }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">

      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ĐÁP ÁN & HƯỚNG DẪN CHẤM CHI TIẾT (MÃ ĐỀ {paper.code})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng đáp án từng câu kèm lời giải thích ngữ pháp/từ vựng & thang điểm chấm bài viết
          </p>
        </div>

        <button
          onClick={onDownloadDocx}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Tải DapAn_HuongDanCham_MaDe{paper.code}.docx</span>
        </button>
      </div>

      {/* Audio Script Section if present */}
      {paper.audioScript && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-600" />
            I. Nội Dung Băng Nghe (Listening Audio Script)
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-mono bg-white p-3 rounded-lg border border-slate-200">
            {paper.audioScript}
          </p>
        </div>
      )}

      {/* Answer Key Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          II. Đáp Án & Thang Điểm Chi Tiết (Mã Đề {paper.code})
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5 border-r border-slate-200 text-center w-12">Câu</th>
                <th className="p-2.5 border-r border-slate-200">Phần Thi</th>
                <th className="p-2.5 border-r border-slate-200 text-center w-28 bg-emerald-100/70 text-emerald-900">
                  Đáp Án Chuẩn
                </th>
                <th className="p-2.5 border-r border-slate-200 text-center w-20">Điểm</th>
                <th className="p-2.5">Giải Thích Chi Tiết & Kiến Thức Cần Nắm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {(Array.isArray(paper.answerKey) ? paper.answerKey : []).map((item) => (
                <tr key={item?.questionNumber || Math.random()} className="hover:bg-slate-50 transition">
                  <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-700">
                    {item.questionNumber}
                  </td>
                  <td className="p-2.5 border-r border-slate-200 font-medium text-indigo-900">
                    {item.sectionTitle}
                  </td>
                  <td className="p-2.5 border-r border-slate-200 text-center font-bold text-emerald-700 bg-emerald-50/40 text-sm">
                    {item.answer}
                  </td>
                  <td className="p-2.5 border-r border-slate-200 text-center font-bold text-indigo-800">
                    {(item?.points || 0).toFixed(2)}đ
                  </td>
                  <td className="p-2.5 text-slate-700 italic leading-relaxed">
                    {item.explanation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Writing Scoring Scheme */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4">
        <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-600" />
          III. Hướng Dẫn Chấm Phận Viết (Writing Mark Scheme)
        </h3>
        <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-line font-sans">
          {paper.writingMarkScheme ||
            `1. Ý tưởng & Bố cục (Task Fulfillment & Organization): 0.5 điểm\n2. Từ vựng & Ngữ pháp (Vocabulary & Grammar Accuracy): 0.5 điểm\n3. Sự mạch lạc & Liên kết (Coherence & Cohesion): 0.5 điểm`}
        </p>
      </div>
    </div>
  );
};
