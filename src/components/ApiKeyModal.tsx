import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, Cpu, ShieldAlert, Check, HelpCircle } from 'lucide-react';
import { Grade } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: (apiKey: string, model: string) => void;
  initialApiKey: string;
  initialModel: string;
  isForceInput?: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  initialApiKey,
  initialModel,
  isForceInput = false,
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [model, setModel] = useState(initialModel || 'gemini-3-flash-preview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setApiKey(initialApiKey);
    if (initialModel) {
      setModel(initialModel);
    }
  }, [initialApiKey, initialModel, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API Key để tiếp tục sử dụng ứng dụng.');
      return;
    }
    setError(null);
    onClose(apiKey.trim(), model);
  };

  const models = [
    {
      id: 'gemini-3-flash-preview',
      name: 'Gemini 3 Flash Preview',
      desc: 'Mô hình thế hệ mới mặc định. Tốc độ cực nhanh, suy luận xuất sắc và xử lý dữ liệu lớn rất tốt.',
      badge: 'Khuyên dùng',
      isDefault: true,
    },
    {
      id: 'gemini-3-pro-preview',
      name: 'Gemini 3 Pro Preview',
      desc: 'Chất lượng cao nhất. Phù hợp với các đề thi phức tạp hoặc yêu cầu tùy chỉnh rất chi tiết.',
      badge: 'Chuyên sâu',
      isDefault: false,
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      desc: 'Tính ổn định cao, phản hồi nhanh và tối ưu hóa tốt cho các cấu trúc ma trận tiêu chuẩn.',
      badge: 'Ổn định',
      isDefault: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/30 rounded-xl border border-indigo-400/20 backdrop-blur-sm">
              <Key className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Cấu Hình API Key & Model AI</h2>
              <p className="text-xs text-indigo-200 mt-0.5">Nhập khóa API cá nhân của bạn để kích hoạt hệ thống sinh đề</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {isForceInput && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <span className="font-bold">Yêu cầu bắt buộc:</span> Bạn cần thiết lập Gemini API Key để khởi động ứng dụng. Key của bạn sẽ được lưu trực tiếp trên thiết bị (LocalStorage) để chạy trực tiếp từ trình duyệt mà không thông qua server trung gian.
              </div>
            </div>
          )}

          {/* API Key Input Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Nhập Gemini API Key</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Lưu tại trình duyệt</span>
              </label>
              
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="AIzaSy..."
                  className={`w-full bg-slate-50 dark:bg-slate-950/50 border ${
                    error ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/50'
                  } rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 font-mono shadow-sm`}
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                  <span>⚠️</span> {error}
                </p>
              )}
            </div>

            {/* Instruction block */}
            <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Hướng dẫn lấy API Key miễn phí:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                <li>Truy cập vào trang quản lý khóa của Google: 
                  <a 
                    href="https://aistudio.google.com/api-keys" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1"
                  >
                    <span>Google AI Studio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Đăng nhập bằng tài khoản Gmail của bạn.</li>
                <li>Nhấn nút <span className="font-bold text-slate-800 dark:text-slate-200">"Create API key"</span> và sao chép mã khóa.</li>
                <li>Dán mã khóa vào ô nhập phía trên và bấm <span className="font-bold text-slate-800 dark:text-slate-200">"Lưu & Kích Hoạt"</span>.</li>
              </ol>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                💡 <span className="font-semibold">Mẹo:</span> Nếu key bị hết lượt dùng (Quota Exceeded), hãy tạo thêm API Key từ một tài khoản Gmail khác rồi dán vào đây để tiếp tục sử dụng ngay lập tức mà không phải chờ đợi!
              </div>
            </div>

            {/* AI Model Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Chọn Model AI Mặc Định
              </label>

              <div className="grid grid-cols-1 gap-3">
                {models.map((m) => {
                  const isSelected = model === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setModel(m.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition relative flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-500 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white">{m.name}</span>
                          {m.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.isDefault ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              {!isForceInput && (
                <button
                  type="button"
                  onClick={() => onClose(initialApiKey, initialModel)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Đóng
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center gap-2 cursor-pointer"
              >
                <span>Lưu & Kích Hoạt</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
