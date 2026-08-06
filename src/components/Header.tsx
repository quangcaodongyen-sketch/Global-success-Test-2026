import React from 'react';
import { BookOpen, FileCheck2, Sparkles, ShieldCheck, GraduationCap, Settings, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenDecreeModal: () => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
  selectedModel: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDecreeModal,
  onOpenSettings,
  hasApiKey,
  selectedModel,
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white border-b border-indigo-900 shadow-xl sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Info Block */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/20 rounded-xl border border-indigo-500/30 backdrop-blur-sm shadow-inner shrink-0">
              <GraduationCap className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Hệ Thống Tự Động Sinh Đề Kiểm Tra Tiếng Anh THCS
                </h1>
                <span className="bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Global Success
                </span>
              </div>
              <p className="text-xs text-indigo-300 mt-0.5 font-medium">
                Chuẩn Ma Trận & Bản Đặc Tả Bộ GDĐT • Thể Thức Văn Bản Hành Chính Nghị Định 30/2020/NĐ-CP
              </p>
            </div>
          </div>

          {/* Action Buttons Block */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 justify-end">
            
            {/* API Key Warning Alert if not set */}
            {!hasApiKey && (
              <a 
                href="https://aistudio.google.com/api-keys" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg hover:bg-red-500/20 transition animate-pulse"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Lấy API key để sử dụng app</span>
              </a>
            )}

            {/* AI Model Badge */}
            {hasApiKey && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-900">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-mono text-[10px] font-semibold">{selectedModel}</span>
              </div>
            )}

            {/* Decree 30 Button */}
            <button
              onClick={onOpenDecreeModal}
              className="px-3 py-1.5 sm:py-2 bg-indigo-900/40 hover:bg-indigo-900/70 border border-indigo-800/60 text-indigo-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Xem thông tin Quy chuẩn Nghị định 30 & Bộ GDĐT"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Chuẩn NĐ 30</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className={`px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer border ${
                !hasApiKey 
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-400' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600'
              }`}
              title="Cài đặt API Key & Model AI"
            >
              <Settings className={`w-4 h-4 ${!hasApiKey ? 'animate-spin' : ''}`} />
              <span>Cấu hình AI</span>
            </button>

            {/* App version info */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-[10px]">2026 PRO</span>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
