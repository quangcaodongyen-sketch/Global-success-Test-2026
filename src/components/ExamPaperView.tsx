import React, { useState } from 'react';
import { ExamPaper } from '../types';
import {
  FileText,
  Download,
  CopyPlus,
  Volume2,
  VolumeX,
  Printer,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Loader2,
} from 'lucide-react';
import { generateExamAudioBlobs, GeneratedExamAudioResult } from '../utils/audioGenerator';

interface ExamPaperViewProps {
  papers: ExamPaper[];
  activePaperCode: string;
  onSelectPaperCode: (code: string) => void;
  onGenerateNextVariant: () => void;
  onDownloadPaperDocx: (paper: ExamPaper) => void;
  onPracticeOnline: (paper: ExamPaper) => void;
  showCognition: boolean;
  onToggleCognition: (val: boolean) => void;
}

export const ExamPaperView: React.FC<ExamPaperViewProps> = ({
  papers,
  activePaperCode,
  onSelectPaperCode,
  onGenerateNextVariant,
  onDownloadPaperDocx,
  onPracticeOnline,
  showCognition,
  onToggleCognition,
}) => {
  const safePapers = Array.isArray(papers) ? papers : [];
  const currentPaper = safePapers.find((p) => p.code === activePaperCode) || safePapers[0];
  const [showAudioScript, setShowAudioScript] = useState(false);

  // Audio Player state
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioResult, setAudioResult] = useState<GeneratedExamAudioResult | null>(null);
  const [playingKey, setPlayingKey] = useState<'full' | 'part1' | 'part2' | null>(null);
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null);

  if (!currentPaper) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
        <h3 className="font-bold text-lg">Lỗi tải dữ liệu Đề kiểm tra</h3>
        <p className="text-sm">Hệ thống AI không trả về cấu trúc đề kiểm tra hợp lệ. Vui lòng thử bấm nút "Tạo Bộ Đề Mới" lại một lần nữa.</p>
      </div>
    );
  }

  const admin = currentPaper.adminInfo || {};

  // Generate Audio Blobs on demand
  const handleGenerateOrGetAudio = async (): Promise<GeneratedExamAudioResult | null> => {
    if (audioResult) return audioResult;
    try {
      setIsGeneratingAudio(true);
      const res = await generateExamAudioBlobs(currentPaper);
      setAudioResult(res);
      return res;
    } catch (err) {
      console.error('Failed to generate audio blobs:', err);
      alert('Không thể tạo file nghe âm thanh. Vui lòng kiểm tra kết nối mạng.');
      return null;
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePlayAudioKey = async (key: 'full' | 'part1' | 'part2') => {
    if (playingKey === key && activeAudioObj) {
      activeAudioObj.pause();
      setPlayingKey(null);
      return;
    }

    if (activeAudioObj) {
      activeAudioObj.pause();
    }

    const res = await handleGenerateOrGetAudio();
    if (!res) return;

    let targetBlob: Blob;
    if (key === 'part1') targetBlob = res.part1Blob;
    else if (key === 'part2') targetBlob = res.part2Blob;
    else targetBlob = res.fullExamBlob;

    const audioUrl = URL.createObjectURL(targetBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setPlayingKey(null);
    };
    audio.onerror = () => {
      setPlayingKey(null);
    };

    setActiveAudioObj(audio);
    setPlayingKey(key);
    audio.play();
  };

  const handleDownloadAudioFile = async (key: 'full' | 'part1' | 'part2') => {
    const res = await handleGenerateOrGetAudio();
    if (!res) return;

    let blob: Blob;
    let filename: string;
    if (key === 'part1') {
      blob = res.part1Blob;
      filename = `04_FileNghe_Part1_Monologue_MaDe${currentPaper.code}.wav`;
    } else if (key === 'part2') {
      blob = res.part2Blob;
      filename = `04_FileNghe_Part2_Dialogue_MaDe${currentPaper.code}.wav`;
    } else {
      blob = res.fullExamBlob;
      filename = `04_FileNghe_FullExam_MaDe${currentPaper.code}.wav`;
    }

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">

      {/* Variant Selector Bar & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mr-1">
            Mã Đề:
          </span>
          {safePapers.map((paper) => (
            <button
              key={paper.code}
              onClick={() => {
                if (activeAudioObj) activeAudioObj.pause();
                setPlayingKey(null);
                setAudioResult(null);
                onSelectPaperCode(paper.code);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                paper.code === currentPaper.code
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>MÃ ĐỀ {paper.code}</span>
            </button>
          ))}

          <button
            onClick={onGenerateNextVariant}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            title="Tạo mã đề xáo trộn tiếp theo"
          >
            <CopyPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Tạo Mã Đề {safePapers.length + 1}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPracticeOnline(currentPaper)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-slate-950" />
            <span>Luyện đề trực tuyến</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In / Lưu PDF</span>
          </button>

          <button
            onClick={() => onDownloadPaperDocx(currentPaper)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải Detap_MaDe{currentPaper.code}.docx</span>
          </button>
        </div>
      </div>

      {/* Toggle Cognition Levels Option */}
      <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
        <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showCognition}
            onChange={(e) => onToggleCognition(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
          />
          <span>Hiển thị ghi chú mức độ kiến thức và điểm số câu hỏi kế bên câu hỏi (Ví dụ: <span className="italic text-slate-500 font-normal">[0.2đ - Nhận biết]</span>)</span>
        </label>
      </div>

      {/* Interactive Audio Generator & Script Banner */}
      {currentPaper.audioScript && (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Trình phát & Tạo file nghe âm thanh (Audio Studio)
                </p>
                <p className="text-[11px] text-slate-400">
                  Part 1: Độc thoại Nữ (True/False) | Part 2: Hội thoại Nam & Nữ (Option A, B, C)
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAudioScript(!showAudioScript)}
              className="text-xs font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>{showAudioScript ? 'Ẩn kịch bản chữ' : 'Xem kịch bản chữ'}</span>
              {showAudioScript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Audio Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => handlePlayAudioKey('part1')}
              disabled={isGeneratingAudio}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAudio && playingKey === 'part1' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : playingKey === 'part1' ? (
                <Pause className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{playingKey === 'part1' ? 'Tạm dừng Part 1' : 'Nghe Part 1 (Nữ Độc thoại)'}</span>
            </button>

            <button
              onClick={() => handlePlayAudioKey('part2')}
              disabled={isGeneratingAudio}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAudio && playingKey === 'part2' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : playingKey === 'part2' ? (
                <Pause className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{playingKey === 'part2' ? 'Tạm dừng Part 2' : 'Nghe Part 2 (Nam/Nữ Hội thoại)'}</span>
            </button>

            <button
              onClick={() => handlePlayAudioKey('full')}
              disabled={isGeneratingAudio}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAudio && playingKey === 'full' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : playingKey === 'full' ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{playingKey === 'full' ? 'Tạm dừng Toàn bộ' : 'Nghe Toàn Bộ Bài Nghe'}</span>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>

            <button
              onClick={() => handleDownloadAudioFile('full')}
              disabled={isGeneratingAudio}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 transition cursor-pointer border border-slate-600 text-[11px]"
              title="Tải riêng file âm thanh WAV chất lượng cao"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Tải WAV Bài Nghe</span>
            </button>
          </div>

          {showAudioScript && (
            <div className="mt-3 bg-slate-800 p-3 rounded-lg text-xs text-slate-200 leading-relaxed font-sans border border-slate-700 whitespace-pre-line">
              {currentPaper.audioScript}
            </div>
          )}
        </div>
      )}

      {/* Paper Visual Container (Styled like standard A4 Exam Sheet) */}
      <div className="bg-slate-50 border border-slate-300 p-6 sm:p-8 rounded-xl shadow-inner font-serif text-slate-900 text-sm max-w-4xl mx-auto printable-area">

        {/* Administrative Header according to Decree 30/2020/NĐ-CP & MOET */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b-2 border-slate-900 pb-3 mb-4">
          <div>
            <p className="font-bold uppercase text-xs sm:text-sm text-slate-900">
              {admin.schoolName}
            </p>
            <p className="font-bold text-xs sm:text-sm text-indigo-900 mt-0.5">
              ĐỀ KIỂM TRA {currentPaper.examType?.toUpperCase()} MÔN TIẾNG ANH {currentPaper.grade?.toUpperCase()}
            </p>
            <p className="text-xs italic text-slate-700">
              Năm học: {admin.academicYear} | Thời gian: {admin.durationMinutes} phút
            </p>
          </div>

          <div className="text-left sm:text-right flex flex-col justify-between">
            <div>
              <p className="font-bold text-base sm:text-lg text-slate-900 tracking-wider">
                MÃ ĐỀ: <span className="text-indigo-700">{currentPaper.code}</span>
              </p>
              <p className="text-xs italic text-slate-600">(Đề kiểm tra gồm 02-03 trang)</p>
            </div>
          </div>
        </div>

        {/* Student Info & Score Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-800 rounded-lg overflow-hidden mb-6 text-xs bg-white">
          <div className="sm:col-span-2 p-3 border-b sm:border-b-0 sm:border-r border-slate-800 space-y-1">
            <p className="font-medium">Họ và tên thí sinh: ....................................................................................</p>
            <p className="font-medium">Lớp: ......................... SBD: ............................................................................</p>
          </div>
          {((currentPaper.examType || '').toUpperCase().includes('CUỐI KÌ') || (currentPaper.examType || '').toUpperCase().includes('CUỐI KỲ')) ? (
            <div className="grid grid-cols-4 border-t sm:border-t-0 border-slate-800 text-center font-sans">
              <div className="col-span-2 border-r border-slate-800 flex flex-col">
                <div className="border-b border-slate-800 py-1 bg-slate-50 font-bold uppercase text-[9px]">Mark</div>
                <div className="grid grid-cols-2 flex-1">
                  <div className="border-r border-slate-800 flex flex-col justify-between py-1">
                    <span className="font-semibold text-[9px]">Speak</span>
                    <span className="h-6"></span>
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <span className="font-semibold text-[9px]">Write</span>
                    <span className="h-6"></span>
                  </div>
                </div>
              </div>
              <div className="border-r border-slate-800 flex flex-col justify-between py-1 bg-slate-50">
                <span className="font-bold uppercase text-[9px]">Total</span>
                <span className="h-6"></span>
              </div>
              <div className="flex flex-col p-1 text-[9px] text-left leading-tight text-slate-500 font-serif">
                <span className="font-semibold">Remark:</span>
                <span className="border-b border-dashed border-slate-300 w-full mt-1.5"></span>
                <span className="border-b border-dashed border-slate-300 w-full mt-1.5"></span>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center bg-slate-50 flex flex-col items-center justify-center">
              <p className="font-bold uppercase text-[11px] text-slate-700">Điểm Số / Lời Phê</p>
              <div className="h-10 border-b border-dashed border-slate-300 w-full mt-1"></div>
            </div>
          )}
        </div>

        {/* Exam Sections */}
        <div className="space-y-6">
          {(() => {
            let globalQIdx = 1;
            const safeSections = Array.isArray(currentPaper.sections) ? currentPaper.sections : [];
            const validSections = safeSections.filter(s => {
              if (!s.questions || s.questions.length === 0) return false;
              const titleUpper = (s.title || '').toUpperCase();
              if (
                titleUpper.includes('ĐỀ KIỂM TRA') ||
                titleUpper.includes('BÀI KIỂM TRA') ||
                titleUpper.includes('THỜI GIAN LÀM BÀI') ||
                titleUpper.includes('TRƯỜNG THCS')
              ) {
                return false;
              }
              return true;
            });
            return validSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-3">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
                  {section.title}
                </h3>

                {section.instructions && (
                  <p className="italic text-xs text-slate-700 font-sans font-medium bg-indigo-50/60 p-2 rounded border border-indigo-100">
                    {section.instructions}
                  </p>
                )}

                {section.readingPassage && (
                  <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/80 text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-line font-sans my-2">
                    {section.readingPassage}
                  </div>
                )}

                {/* Questions */}
                <div className="space-y-3 pl-1">
                  {(Array.isArray(section.questions) ? section.questions : []).map((q, qIdx) => {
                    const isEssay = q.type === 'ESSAY';
                    const currentQNum = isEssay ? null : globalQIdx++;

                    let cleanedPrompt = q.prompt || '';
                    if (isEssay) {
                      cleanedPrompt = cleanedPrompt
                        .replace(/^(câu\s*\d+|question\s*\d+|\d+[\.\:]\s*)+/i, '')
                        .trim();
                      if (section.instructions && cleanedPrompt.toLowerCase().startsWith(section.instructions.toLowerCase().slice(0, 20))) {
                        cleanedPrompt = cleanedPrompt.substring(section.instructions.length).trim();
                      }
                    }

                    return (
                      <div key={q.id || qIdx} className="text-xs sm:text-sm text-slate-900">
                        <p className="leading-snug">
                          {!isEssay && <span className="font-bold text-slate-900">{currentQNum}. </span>}
                          {(() => {
                            if (q.type === 'ESSAY') {
                              return (
                                <>
                                  {(cleanedPrompt || q.prompt || '').split('\n').map((pt, idx) => (
                                    <span key={idx} className={idx === 0 && pt.match(/\(\d+-\d+\swords\)/) ? 'font-bold block' : 'block'}>
                                      {pt}
                                    </span>
                                  ))}
                                  {showCognition && (
                                    <span className="text-[11px] text-slate-500 font-sans italic ml-1">
                                      [{q.points}đ - {q.cognitionLevel}]
                                    </span>
                                  )}
                                </>
                              );
                            }
                            return (
                              <>
                                <span>{q.prompt}</span>
                                {showCognition && (
                                  <span className="text-[11px] text-slate-500 font-sans italic ml-1">
                                    [{q.points}đ - {q.cognitionLevel}]
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </p>

                        {/* MCQ Options */}
                        {Array.isArray(q.options) && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-1.5 pl-4 font-sans text-slate-800">
                            {q.options.map((opt, i) => (
                              <div key={opt.key || i} className="flex items-center gap-1.5">
                                <span className="font-bold text-indigo-900">{opt.key}.</span>
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Rewrite or Fill-in prompt line if no dots exist */}
                        {(q.type === 'REWRITE' || q.type === 'FILL_IN') && (!q.options || q.options.length === 0) && !(q.prompt || '').includes('....') && (
                          <div className="mt-1.5 pl-4 text-slate-500 font-mono text-xs">
                            👉 Trả lời: ..........................................................................................................................................................
                          </div>
                        )}

                        {/* Essay prompt space (4 clean lines) */}
                        {q.type === 'ESSAY' && (!q.options || q.options.length === 0) && (
                          <div className="mt-2 pl-4 text-slate-300 font-mono text-xs space-y-1">
                            {Array(4).fill(null).map((_, i) => (
                              <p key={i}>..........................................................................................................................................................................</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>

        {/* Speaking Section if present */}
        {Array.isArray(currentPaper.speakingTopics) && currentPaper.speakingTopics.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-300 space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1">
              SECTION E: SPEAKING (2.0 pts - CHẤM RIÊNG)
            </h3>
            <p className="italic text-xs text-slate-700 font-sans">
              Choose one of the following topics and talk about it. You have 1 minute to prepare and 2 minutes to speak.
            </p>
            <div className="grid grid-cols-1 gap-4 font-sans text-slate-800 text-xs sm:text-sm pl-2">
              {currentPaper.speakingTopics.map((topic, idx) => (
                <div key={topic.id} className="p-3 bg-slate-100 rounded-lg border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-900">Topic {idx + 1}: {topic.topicName}</p>
                  <p className="italic text-slate-600 mb-1">{topic.description}</p>
                  <div className="pl-3 space-y-0.5">
                    <p className="font-semibold text-slate-700">Guide questions:</p>
                    {Array.isArray(topic.guideQuestions) && topic.guideQuestions.map((q, qIdx) => (
                      <p key={qIdx} className="text-slate-600">- {q}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="text-center mt-8 pt-4 border-t border-slate-300 text-xs font-bold font-sans text-slate-600">
          <p>-------------- HẾT --------------</p>
        </div>
      </div>
    </div>
  );
};
