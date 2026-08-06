import React, { useState } from 'react';
import {
  Grade,
  ExamType,
  AdminInfo,
  TemplateFileData,
  FullExamSuite,
  ExamPaper,
} from './types';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { InputForm } from './components/InputForm';
import { MatrixView } from './components/MatrixView';
import { SpecificationView } from './components/SpecificationView';
import { ExamPaperView } from './components/ExamPaperView';
import { AnswerKeyView } from './components/AnswerKeyView';
import { Decree30InfoModal } from './components/Decree30InfoModal';
import { generateNextPaperVariant } from './utils/variantGenerator';
import {
  generateMatrixAndSpecDocx,
  generateExamPaperDocx,
  generateAnswerKeyDocx,
} from './utils/docxExporter';
import { exportExamSuiteZip } from './utils/zipExporter';
import {
  Table,
  FileText,
  CheckCircle2,
  FileArchive,
  Download,
  CopyPlus,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { StudentPracticeView } from './components/StudentPracticeView';
import { GLOBAL_SUCCESS_UNITS } from './data/globalSuccessUnits';
import { generateMatrixExcel, generateSpecificationExcel } from './utils/excelExporter';

export default function App() {
  const [suite, setSuite] = useState<FullExamSuite | null>(null);
  const [activePaperCode, setActivePaperCode] = useState<string>('001');
  const [activeTab, setActiveTab] = useState<'matrix' | 'spec' | 'exam' | 'answer'>('exam');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDecreeModalOpen, setIsDecreeModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [practicePaper, setPracticePaper] = useState<ExamPaper | null>(null);
  const [showCognition, setShowCognition] = useState<boolean>(true);

  // API Key & Model settings states
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [selectedModel, setSelectedModel] = useState<string>(() => localStorage.getItem('gemini_selected_model') || 'gemini-3-flash-preview');
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(() => !localStorage.getItem('gemini_api_key'));

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Generate full Exam Suite via backend Gemini API
  const handleGenerateExam = async (config: {
    grade: Grade;
    examType: ExamType;
    selectedUnits: string[];
    adminInfo: AdminInfo;
    customPrompt: string;
    uploadedTemplates: TemplateFileData[];
  }) => {
    if (!apiKey) {
      setIsApiModalOpen(true);
      return;
    }
    const gradeUnits = GLOBAL_SUCCESS_UNITS[config.grade] || [];
    const unitDetails = config.selectedUnits.map(title => 
      gradeUnits.find(u => u.title === title)
    ).filter(Boolean);

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          ...config,
          unitDetails,
          model: selectedModel,
        }),
      });

      const result = await res.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Lỗi không xác định khi sinh bộ đề.');
      }

      setSuite(result.data);
      setActivePaperCode('001');
      setActiveTab('exam');
      showToast('🎉 Đã tự động sinh bộ đề chuẩn Ma trận, Bản đặc tả & Đề thi Mã 001 thành công!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi kết nối với máy chủ sinh đề. Vui lòng thử lại.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Generate Next Variant (Code 002, 003...)
  const handleGenerateNextVariant = () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;

    const primaryPaper = suite.papers[0];
    const newVariant = generateNextPaperVariant(primaryPaper, suite.papers.length);

    setSuite((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        papers: [...prev.papers, newVariant],
      };
    });

    setActivePaperCode(newVariant.code);
    setActiveTab('exam');
    showToast(`✨ Đã tự động sinh xáo trộn Mã đề ${newVariant.code} thành công!`);
  };

  // 3. Export Single Word Files
  const handleDownloadMatrixSpecDocx = async () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;
    try {
      const blob = await generateMatrixAndSpecDocx(suite, suite.papers[0]);
      downloadBlob(blob, `Matran_Dacta_${suite.papers[0].grade.replace(/\s+/g, '')}.docx`);
      showToast('📥 Đã tải xuống tệp Matran_Dacta.docx!');
    } catch (e: any) {
      alert('Lỗi xuất file Word: ' + e.message);
    }
  };

  const handleDownloadMatrixExcel = async () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;
    const paper = suite.papers[0];
    try {
      const blob = await generateMatrixExcel(
        suite.matrix,
        paper.schoolName || 'TRƯỜNG THCS ĐỒNG YÊN',
        paper.examType,
        paper.academicYear || '2026-2027',
        paper.grade
      );
      downloadBlob(blob, `MaTran_DeKT_${paper.grade.replace(/\s+/g, '')}.xlsx`);
      showToast('📥 Đã tải xuống tệp MaTran.xlsx!');
    } catch (e: any) {
      alert('Lỗi xuất file Excel: ' + e.message);
    }
  };

  const handleDownloadSpecExcel = async () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;
    const paper = suite.papers[0];
    try {
      const blob = await generateSpecificationExcel(
        suite.specifications,
        paper.schoolName || 'TRƯỜNG THCS ĐỒNG YÊN',
        paper.examType,
        paper.academicYear || '2026-2027',
        paper.grade
      );
      downloadBlob(blob, `DacTa_DeKT_${paper.grade.replace(/\s+/g, '')}.xlsx`);
      showToast('📥 Đã tải xuống tệp DacTa.xlsx!');
    } catch (e: any) {
      alert('Lỗi xuất file Excel: ' + e.message);
    }
  };

  const handleDownloadPaperDocx = async (paper: ExamPaper) => {
    try {
      const blob = await generateExamPaperDocx(paper, showCognition);
      downloadBlob(blob, `Detap_MaDe${paper.code}.docx`);
      showToast(`📥 Đã tải xuống tệp Detap_MaDe${paper.code}.docx!`);
    } catch (e: any) {
      alert('Lỗi xuất file Word: ' + e.message);
    }
  };

  const handleDownloadAnswerKeyDocx = async (paper: ExamPaper) => {
    try {
      const blob = await generateAnswerKeyDocx(paper);
      downloadBlob(blob, `DapAn_HuongDanCham_MaDe${paper.code}.docx`);
      showToast(`📥 Đã tải xuống tệp DapAn_HuongDanCham_MaDe${paper.code}.docx!`);
    } catch (e: any) {
      alert('Lỗi xuất file Word: ' + e.message);
    }
  };

  // 4. Export ZIP Package following Decree 30
  const handleExportZip = async () => {
    if (!suite || !Array.isArray(suite.papers) || suite.papers.length === 0) return;
    try {
      const zipBlob = await exportExamSuiteZip(suite, showCognition);
      const paper0 = suite.papers[0];
      const fileName = `BoDe_TiengAnh_${paper0.grade.replace(/\s+/g, '')}_${paper0.examType.replace(/\s+/g, '_')}.zip`;
      downloadBlob(zipBlob, fileName);
      showToast('📦 Đã đóng gói và tải xuống thành công bộ tệp ZIP chuẩn Nghị định 30 & Bộ GDĐT!');
    } catch (e: any) {
      alert('Lỗi đóng gói file ZIP: ' + e.message);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApiKeyModalClose = (key: string, model: string) => {
    setApiKey(key);
    setSelectedModel(model);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    localStorage.setItem('gemini_selected_model', model);
    setIsApiModalOpen(false);
    showToast('🔑 Đã cập nhật cấu hình API Key & Model AI!');
  };

  const currentPaper = Array.isArray(suite?.papers) ? (suite.papers.find((p) => p.code === activePaperCode) || suite.papers[0]) : undefined;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-500/40 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <Header 
        onOpenDecreeModal={() => setIsDecreeModalOpen(true)} 
        onOpenSettings={() => setIsApiModalOpen(true)}
        hasApiKey={!!apiKey}
        selectedModel={selectedModel}
      />

      {/* Main App Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {practicePaper ? (
          <StudentPracticeView
            paper={practicePaper}
            onBack={() => setPracticePaper(null)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Column: Config & Input Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <InputForm
                onGenerateExam={handleGenerateExam}
                onGenerateNextVariant={handleGenerateNextVariant}
                onExportZip={handleExportZip}
                isGenerating={isGenerating}
                hasGeneratedSuite={!!suite}
                variantCount={Array.isArray(suite?.papers) ? suite.papers.length : 0}
              />
            </div>

            {/* Right Column: Output Preview & Tabs (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {suite ? (
                <div className="space-y-4">

                  {/* Tab Navigation Controls */}
                  <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-1 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('exam')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[110px] ${
                        activeTab === 'exam'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>1. Đề Thi ({Array.isArray(suite.papers) ? suite.papers.length : 0} mã)</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('matrix')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[100px] ${
                        activeTab === 'matrix'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Table className="w-4 h-4" />
                      <span>2. Ma Trận</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('spec')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[100px] ${
                        activeTab === 'spec'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>3. Bản Đặc Tả</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('answer')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer min-w-[110px] ${
                        activeTab === 'answer'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>4. Đáp Án</span>
                    </button>
                  </div>

                  {/* Quick ZIP Export Action Bar */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-3.5 rounded-xl border border-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <FileArchive className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">Xuất Trọn Bộ Hồ Sơ Nghị Định 30 (.ZIP)</p>
                        <p className="text-[11px] text-indigo-200">
                          Bao gồm Ma trận, Bản đặc tả, tất cả Đề thi và Đáp án dạng .docx
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleExportZip}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span>Tải File Nén ZIP</span>
                    </button>
                  </div>

                  {/* Tab Render Views */}
                  {activeTab === 'exam' && (
                    <ExamPaperView
                      papers={suite.papers}
                      activePaperCode={activePaperCode}
                      onSelectPaperCode={setActivePaperCode}
                      onGenerateNextVariant={handleGenerateNextVariant}
                      onDownloadPaperDocx={handleDownloadPaperDocx}
                      onPracticeOnline={(paper) => setPracticePaper(paper)}
                      showCognition={showCognition}
                      onToggleCognition={setShowCognition}
                    />
                  )}

                  {activeTab === 'matrix' && (
                    <MatrixView
                      matrix={suite.matrix}
                      summary={suite.summary}
                      onDownloadDocx={handleDownloadMatrixSpecDocx}
                      onDownloadExcel={handleDownloadMatrixExcel}
                    />
                  )}

                  {activeTab === 'spec' && (
                    <SpecificationView
                      specifications={suite.specifications}
                      onDownloadDocx={handleDownloadMatrixSpecDocx}
                      onDownloadExcel={handleDownloadSpecExcel}
                    />
                  )}

                  {activeTab === 'answer' && currentPaper && (
                    <AnswerKeyView
                      paper={currentPaper}
                      onDownloadDocx={() => handleDownloadAnswerKeyDocx(currentPaper)}
                    />
                  )}

                </div>
              ) : (
                /* Empty Placeholder State before generating */
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
                    <Sparkles className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-base font-bold text-slate-800">
                      Sẵn Sàng Tự Động Sinh Bộ Đề Kiểm Tra Tiếng Anh THCS
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Chọn khối lớp, loại bài kiểm tra, tích chọn các Unit kiến thức bên trái và bấm nút{' '}
                      <span className="font-bold text-indigo-700">"Tự động sinh bộ đề chuẩn"</span>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left pt-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-bold text-indigo-900">1. Chuẩn Ma Trận</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Tự động cân bằng 4 mức độ nhận thức 40-30-20-10%</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-bold text-indigo-900">2. Đa Dạng Mã Đề</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Tạo thêm các mã 002, 003... bằng 1 cú nhấp chuột</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-bold text-indigo-900">3. Xuất File Word & ZIP</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Xuất .docx định dạng chuẩn Nghị định 30/2020/NĐ-CP</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Decree 30 Modal */}
      <Decree30InfoModal
        isOpen={isDecreeModalOpen}
        onClose={() => setIsDecreeModalOpen(false)}
      />

      {/* API Key Settings Modal */}
      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={handleApiKeyModalClose}
        initialApiKey={apiKey}
        initialModel={selectedModel}
        isForceInput={!apiKey}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
          <p>© 2026 Hệ Thống Tự Động Sinh Đề Kiểm Tra Tiếng Anh THCS (Global Success)</p>
          <p className="text-[11px] text-slate-500">
            Hỗ trợ giáo viên biên soạn Ma trận, Bản đặc tả, Đề thi và Đáp án tuân thủ Nghị định 30/2020/NĐ-CP & Bộ GDĐT
          </p>
        </div>
      </footer>
    </div>
  );
}
