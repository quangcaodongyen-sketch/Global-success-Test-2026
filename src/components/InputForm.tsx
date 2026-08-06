import React, { useState, useEffect } from 'react';
import {
  Grade,
  ExamType,
  AdminInfo,
  TemplateFileData,
  FullExamSuite,
} from '../types';
import {
  GLOBAL_SUCCESS_UNITS,
  DEFAULT_ADMIN_INFO,
  EXAM_TYPE_DURATION,
} from '../data/globalSuccessUnits';
import { TemplateUploader } from './TemplateUploader';
import {
  Sparkles,
  CheckSquare,
  Square,
  School,
  Clock,
  User,
  Calendar,
  Layers,
  FileArchive,
  CopyPlus,
  Loader2,
  ListChecks,
  BookOpen,
} from 'lucide-react';

interface InputFormProps {
  onGenerateExam: (config: {
    grade: Grade;
    examType: ExamType;
    selectedUnits: string[];
    adminInfo: AdminInfo;
    customPrompt: string;
    uploadedTemplates: TemplateFileData[];
  }) => Promise<void>;
  onGenerateNextVariant: () => void;
  onExportZip: () => void;
  isGenerating: boolean;
  hasGeneratedSuite: boolean;
  variantCount: number;
}

export const InputForm: React.FC<InputFormProps> = ({
  onGenerateExam,
  onGenerateNextVariant,
  onExportZip,
  isGenerating,
  hasGeneratedSuite,
  variantCount,
}) => {
  const [grade, setGrade] = useState<Grade>('Lớp 8');
  const [examType, setExamType] = useState<ExamType>('Giữa kỳ 1');
  const [adminInfo, setAdminInfo] = useState<AdminInfo>(DEFAULT_ADMIN_INFO['Lớp 8']);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [uploadedTemplates, setUploadedTemplates] = useState<TemplateFileData[]>([]);

  // Units list for current grade
  const currentUnits = GLOBAL_SUCCESS_UNITS[grade] || [];

  // Update defaults when Grade or ExamType changes
  useEffect(() => {
    const defaultInfo = DEFAULT_ADMIN_INFO[grade];
    const duration = EXAM_TYPE_DURATION[examType];
    setAdminInfo((prev) => ({
      ...defaultInfo,
      className: prev.className || defaultInfo.className,
      durationMinutes: duration,
    }));

    // Select recommended default units for exam type (e.g., Units 1-3 for Midterm 1)
    let defaultSelected: string[] = [];
    if (examType === '15 phút') {
      defaultSelected = [currentUnits[0]?.title || ''];
    } else if (examType === 'Giữa kỳ 1') {
      defaultSelected = currentUnits.slice(0, 3).map((u) => u.title);
    } else if (examType === 'Cuối kỳ 1') {
      defaultSelected = currentUnits.slice(0, 6).map((u) => u.title);
    } else if (examType === 'Giữa kỳ 2') {
      defaultSelected = currentUnits.slice(6, 9).map((u) => u.title);
    } else if (examType === 'Cuối kỳ 2') {
      defaultSelected = currentUnits.slice(6, 12).map((u) => u.title);
    }
    setSelectedUnitIds(defaultSelected.filter(Boolean));
  }, [grade, examType]);

  const toggleUnit = (unitTitle: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitTitle)
        ? prev.filter((title) => title !== unitTitle)
        : [...prev, unitTitle]
    );
  };

  const handleSelectAllUnits = () => {
    setSelectedUnitIds(currentUnits.map((u) => u.title));
  };

  const handleDeselectAllUnits = () => {
    setSelectedUnitIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUnitIds.length === 0) {
      alert('Vui lòng chọn ít nhất một Unit bài học để giới hạn phạm vi kiểm tra.');
      return;
    }
    onGenerateExam({
      grade,
      examType,
      selectedUnits: selectedUnitIds,
      adminInfo,
      customPrompt,
      uploadedTemplates,
    });
  };

  const handleAddTemplate = (tpl: TemplateFileData) => {
    setUploadedTemplates((prev) => [...prev, tpl]);
    if (tpl.detectedExamType) {
      setExamType(tpl.detectedExamType);
    }
    if (tpl.detectedGrade) {
      setGrade(tpl.detectedGrade);
    }
  };

  const handleUseStandardMoetTemplate = () => {
    setUploadedTemplates([
      {
        name: 'Mau_TiengAnh_THCS_TuyenQuang.docx',
        type: 'matrix',
        content: 'Mẫu ma trận và bản đặc tả Tiếng Anh THCS Tuyên Quang',
        uploadDate: new Date().toLocaleDateString('vi-VN'),
      },
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md">

      {/* 1. Template Upload Section */}
      <TemplateUploader
        uploadedTemplates={uploadedTemplates}
        onAddTemplate={handleAddTemplate}
        onUseStandardMoetTemplate={handleUseStandardMoetTemplate}
      />

      {/* 2. Grade and Exam Type Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Khối lớp */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <School className="w-4 h-4 text-indigo-600" />
            1. Chọn Khối Lớp (Global Success)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9'] as Grade[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`py-2 text-xs font-semibold rounded-lg transition border text-center ${
                  grade === g
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:bg-slate-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Loại bài kiểm tra */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            2. Loại Bài Kiểm Tra
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { val: 'Kiểm tra 15 phút', label: 'Kiểm tra 15 phút', activeClass: 'bg-emerald-600 text-white border-emerald-600', inactiveClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70' },
              { val: 'Giữa kỳ 1', label: 'Giữa kỳ 1', activeClass: 'bg-sky-600 text-white border-sky-600', inactiveClass: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/70' },
              { val: 'Cuối kỳ 1', label: 'Cuối kỳ 1', activeClass: 'bg-indigo-600 text-white border-indigo-600', inactiveClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70' },
              { val: 'Giữa kỳ 2', label: 'Giữa kỳ 2', activeClass: 'bg-rose-600 text-white border-rose-600', inactiveClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70' },
              { val: 'Cuối kỳ 2', label: 'Cuối kỳ 2', activeClass: 'bg-amber-600 text-white border-amber-600', inactiveClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70' }
            ].map((t) => (
              <button
                key={t.val}
                type="button"
                onClick={() => setExamType(t.val as ExamType)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border cursor-pointer ${
                  examType === t.val ? t.activeClass + ' shadow-sm' : t.inactiveClass
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Checkbox Units Selection */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-5 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Chọn phạm vi kiến thức (Các Unit bài học)
            </h4>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAllUnits}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md transition cursor-pointer"
            >
              Chọn Tất Cả
            </button>
            <button
              type="button"
              onClick={handleDeselectAllUnits}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md transition cursor-pointer"
            >
              Bỏ Chọn Tất Cả
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
          {currentUnits.map((unit) => {
            const isSelected = selectedUnitIds.includes(unit.title);
            return (
              <label
                key={unit.title}
                className={`flex items-start gap-2 p-2.5 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-300 text-indigo-950 font-medium'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleUnit(unit.title)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-[11px] leading-tight select-none">
                  <p className="font-bold text-slate-800">{unit.title}</p>
                  <p className="text-slate-500 mt-0.5 truncate max-w-[170px]" title={unit.topic}>
                    {unit.topic}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Administrative Information */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <User className="w-4 h-4 text-indigo-600" />
          Thông tin
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tên Trường:
            </label>
            <input
              type="text"
              value={adminInfo.schoolName}
              onChange={(e) => setAdminInfo({ ...adminInfo, schoolName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Trường THCS Đồng Yên"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tên Lớp:
            </label>
            <input
              type="text"
              value={adminInfo.className}
              onChange={(e) => setAdminInfo({ ...adminInfo, className: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Lớp 8A1"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Năm Học:
            </label>
            <input
              type="text"
              value={adminInfo.academicYear}
              onChange={(e) => setAdminInfo({ ...adminInfo, academicYear: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. 2026-2027"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Họ Tên Giáo Viên Ra Đề:
            </label>
            <input
              type="text"
              value={adminInfo.teacherName}
              onChange={(e) => setAdminInfo({ ...adminInfo, teacherName: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Đinh Văn Thành"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Thời Gian Làm Bài (Phút):
            </label>
            <input
              type="number"
              value={adminInfo.durationMinutes}
              onChange={(e) => setAdminInfo({ ...adminInfo, durationMinutes: Number(e.target.value) })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
              min={10}
              max={120}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Ngày Kiểm Tra:
            </label>
            <input
              type="text"
              value={adminInfo.examDate}
              onChange={(e) => setAdminInfo({ ...adminInfo, examDate: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        </div>
      </div>

      {/* 5. Teacher Notes & Custom Instructions */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <label className="block text-xs font-semibold text-slate-700">
            Ghi Chú Hoặc Trọng Tâm Bổ Sung Của Giáo Viên (Tuỳ chọn):
          </label>
          <span className="text-[10px] text-indigo-600 font-medium">
            (Bấm gợi ý nhanh bên dưới hoặc nhập thủ công)
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            'Tăng cường từ vựng & ngữ pháp các Unit đã chọn',
            'Nhấn mạnh bài tập Phát âm & Trọng âm',
            'Cho bài đọc chủ đề Bảo vệ môi trường & Cuộc sống',
            'Thêm câu phân hóa học sinh giỏi (Vận dụng cao)',
            'Chú trọng các thì Quá khứ đơn & Hiện tại hoàn thành',
            'Tạo câu hỏi trắc nghiệm 4 lựa chọn (A, B, C, D)',
            'Bám sát ma trận & bản đặc tả chuẩn Bộ GD&ĐT'
          ].map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCustomPrompt((prev) => {
                  if (!prev.trim()) return suggestion;
                  if (prev.includes(suggestion)) return prev;
                  return `${prev}; ${suggestion}`;
                });
              }}
              className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition cursor-pointer"
            >
              + {suggestion}
            </button>
          ))}
        </div>

        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          rows={2}
          className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          placeholder="Ví dụ: Tăng cường bài tập thì Hiện tại hoàn thành, tạo đoạn văn nói về bảo vệ môi trường..."
        />
      </div>

      {/* 6. Interaction Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        {/* Nút chính */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
              <span>Đang Tự Động Sinh Bộ Đề Ma Trận & Bản Đặc Tả...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>TỰ ĐỘNG SINH BỘ ĐỀ CHUẨN</span>
            </>
          )}
        </button>

        {/* Nút phụ: Tạo mã đề tiếp theo */}
        {hasGeneratedSuite && (
          <button
            type="button"
            onClick={onGenerateNextVariant}
            className="w-full sm:w-auto py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
            title="Tự động xáo trộn câu hỏi & đáp án giữ nguyên ma trận"
          >
            <CopyPlus className="w-4 h-4 text-emerald-200" />
            <span>Tạo Mã Đề Tiếp Theo (Đề {variantCount + 1})</span>
          </button>
        )}

        {/* Nút nâng cao: Xuất file nén Nghị định 30 */}
        {hasGeneratedSuite && (
          <button
            type="button"
            onClick={onExportZip}
            className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
            title="Đóng gói tất cả file Word vào tệp .zip chuẩn Nghị định 30"
          >
            <FileArchive className="w-4 h-4 text-amber-400" />
            <span>Xuất File Nén Nghị Định 30</span>
          </button>
        )}
      </div>
    </form>
  );
};
