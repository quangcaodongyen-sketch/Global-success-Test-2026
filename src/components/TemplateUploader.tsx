import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, FileSpreadsheet, Layers, Sparkles } from 'lucide-react';
import { TemplateFileData } from '../types';
import { parseTemplateFile } from '../utils/fileParser';

interface TemplateUploaderProps {
  uploadedTemplates: TemplateFileData[];
  onAddTemplate: (template: TemplateFileData) => void;
  onUseStandardMoetTemplate: () => void;
}

export const TemplateUploader: React.FC<TemplateUploaderProps> = ({
  uploadedTemplates,
  onAddTemplate,
  onUseStandardMoetTemplate,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const parsed = await parseTemplateFile(file);
      onAddTemplate(parsed);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            Tải Lên Mẫu Chuẩn (Ma trận / Bản đặc tả / Đề thi)
          </h3>
        </div>
        <button
          type="button"
          onClick={onUseStandardMoetTemplate}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Dùng Mẫu Chuẩn Bộ GDĐT</span>
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          id="template-file-input"
          multiple
          accept=".docx,.doc,.txt,.pdf"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <label htmlFor="template-file-input" className="cursor-pointer block">
          <Upload className="w-7 h-7 mx-auto text-indigo-500 mb-1.5" />
          <p className="text-xs font-medium text-slate-700">
            Kéo thả hoặc <span className="text-indigo-600 underline">bấm để tải lên</span> tệp mẫu (.docx, .doc)
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Mẫu Ma trận, Bản đặc tả hoặc Mẫu Đề kiểm tra mẫu chuẩn
          </p>
        </label>
      </div>

      {uploadedTemplates.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Tệp mẫu đã áp dụng:
          </p>
          <div className="flex flex-wrap gap-2">
            {uploadedTemplates.map((item, idx) => (
              <div
                key={idx}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1.5 rounded-md flex flex-wrap items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium truncate max-w-[180px]">{item.name}</span>
                <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded font-mono">
                  {item.type}
                </span>
                {(item.detectedExamType || item.detectedGrade) && (
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                    Tự nhận diện: {item.detectedGrade ? `${item.detectedGrade} - ` : ''}{item.detectedExamType || ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
