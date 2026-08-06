import React, { useState, useRef } from 'react';
import { ExamPaper, Question, ExamSection, SpeakingTopic } from '../types';
import { Play, Pause, RefreshCw, CheckCircle, HelpCircle, Award, Volume2, ArrowLeft, Send } from 'lucide-react';

interface StudentPracticeViewProps {
  paper: ExamPaper;
  onBack: () => void;
}

export const StudentPracticeView: React.FC<StudentPracticeViewProps> = ({ paper, onBack }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.9);
  
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Play audio using Web Speech API
  const handlePlayAudio = (text: string) => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      return;
    }

    synthRef.current.cancel();
    const cleanText = text.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, ''); // Clean cues
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = playbackRate;
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    setIsPlaying(true);
    synthRef.current.speak(utterance);
  };

  const handleStopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  // Grade check
  const handleSelectAnswer = (qId: string, value: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  // Submit and calculate score
  const handleSubmit = () => {
    handleStopAudio();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    handleStopAudio();
  };

  // Score statistics
  let totalMcq = 0;
  let correctMcq = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  paper.sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      totalPoints += q.points;
      const isMcq = q.options && q.options.length > 0;
      if (isMcq) {
        totalMcq++;
        if (answers[q.id] === q.correctAnswer) {
          correctMcq++;
          earnedPoints += q.points;
        }
      } else {
        // For essays, we don't auto-grade fully, but we can give student self-evaluation or count if not empty
        if (answers[q.id]?.trim()) {
          // Just for presentation, write questions are marked as submitted
        }
      }
    });
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang đề thi</span>
        </button>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 uppercase">Mã Đề: {paper.code}</span>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">{paper.examType} - {paper.grade}</h2>
        </div>
      </div>

      {/* Main Info */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-lg border border-indigo-950">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-400/20">
            <Volume2 className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">Phòng Luyện Đề Trực Tuyến</h1>
            <p className="text-xs text-indigo-200 mt-1">Luyện kỹ năng nghe, đọc, viết trực quan và tự động chấm điểm.</p>
          </div>
        </div>
      </div>

      {/* Play Audio Script Bar */}
      {paper.audioScript && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Volume2 className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">File Nghe Tiếng Anh (Audio Player)</h3>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Nhấn nút phát để nghe giọng đọc máy AI đọc đoạn hội thoại / bài nói tiếng Anh.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Tốc độ:</label>
            <select
              value={playbackRate}
              onChange={(e) => {
                setPlaybackRate(parseFloat(e.target.value));
                if (isPlaying) handlePlayAudio(paper.audioScript);
              }}
              disabled={isPlaying}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs p-1 font-semibold"
            >
              <option value="0.7">Chậm (0.7x)</option>
              <option value="0.8">Hơi chậm (0.8x)</option>
              <option value="0.9">Bình thường (0.9x)</option>
              <option value="1.0">Chuẩn (1.0x)</option>
            </select>

            <button
              onClick={() => handlePlayAudio(paper.audioScript)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Dừng phát' : 'Phát Audio'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Result Card if submitted */}
      {isSubmitted && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 p-6 rounded-3xl shadow-sm text-slate-800 dark:text-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
              <Award className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300">Kết quả luyện tập của bạn</h2>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">Đã chấm điểm các câu trắc nghiệm tự động.</p>
            </div>
          </div>
          <div className="text-center md:text-right bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase">Điểm Số Trắc Nghiệm</span>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {earnedPoints.toFixed(2)} / {totalPoints.toFixed(1)} <span className="text-sm text-slate-500 font-normal">được chấm</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">Đúng {correctMcq}/{totalMcq} câu hỏi trắc nghiệm</p>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-6">
        {paper.sections.map((sec, sIdx) => (
          <div
            key={sIdx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
          >
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-indigo-950 dark:text-white border-b pb-2">
                {sec.title}
              </h2>
              {sec.instructions && (
                <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed italic">
                  💡 Hướng dẫn: {sec.instructions}
                </p>
              )}
            </div>

            {/* Reading Passage if exists */}
            {sec.readingPassage && (
              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm italic leading-relaxed text-slate-700 dark:text-slate-300">
                {sec.readingPassage}
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-5 pt-2">
              {sec.questions.map((q, qIdx) => {
                const isSelected = answers[q.id] !== undefined;
                const isCorrect = answers[q.id] === q.correctAnswer;
                const isMcq = q.options && q.options.length > 0;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/10'
                          : isMcq
                          ? 'bg-red-50/40 border-red-200 dark:bg-red-950/10'
                          : 'bg-slate-50/50 border-slate-200'
                        : isSelected
                        ? 'border-indigo-400 bg-indigo-50/10'
                        : 'border-slate-100 hover:border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Câu {qIdx + 1}. {q.prompt}
                          <span className="text-xs font-semibold text-indigo-500 ml-2">({q.points} pt)</span>
                        </p>

                        {/* MCQ Options */}
                        {isMcq ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                            {q.options?.map((opt) => {
                              const isOptSelected = answers[q.id] === opt.key;
                              const isOptCorrect = q.correctAnswer === opt.key;

                              let btnStyle = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                              if (isSubmitted) {
                                if (isOptCorrect) {
                                  btnStyle = 'bg-emerald-500 text-white border-emerald-500';
                                } else if (isOptSelected) {
                                  btnStyle = 'bg-red-500 text-white border-red-500';
                                }
                              } else if (isOptSelected) {
                                btnStyle = 'bg-indigo-600 text-white border-indigo-600';
                              }

                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  onClick={() => handleSelectAnswer(q.id, opt.key)}
                                  disabled={isSubmitted}
                                  className={`px-4 py-2.5 rounded-xl border text-xs font-semibold text-left transition flex items-center gap-2 cursor-pointer ${btnStyle}`}
                                >
                                  <span className="bg-slate-100 dark:bg-slate-900/60 text-slate-800 dark:text-slate-300 w-5 h-5 rounded-full inline-flex items-center justify-center shrink-0 font-bold">
                                    {opt.key}
                                  </span>
                                  <span>{opt.text}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          // Free Text / Essay Input
                          <div className="space-y-2 pt-2">
                            <textarea
                              rows={q.type === 'ESSAY' ? 5 : 2}
                              value={answers[q.id] || ''}
                              onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                              disabled={isSubmitted}
                              placeholder={
                                q.type === 'ESSAY'
                                  ? 'Nhập đoạn văn trả lời của bạn tại đây...'
                                  : 'Nhập câu trả lời của bạn...'
                              }
                              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        )}

                        {/* Explanations & Answers after submit */}
                        {isSubmitted && (
                          <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-300">
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                              <span>Đáp án chính xác: {q.correctAnswer}</span>
                            </div>
                            {q.explanation && (
                              <p className="text-slate-500 dark:text-slate-400 italic">
                                💡 Giải thích: {q.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Speaking Topics if any */}
      {paper.speakingTopics && paper.speakingTopics.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-indigo-950 dark:text-white border-b pb-2">
              SECTION E: SPEAKING (2.0 pts - Luyện Nói)
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed italic">
              💡 Học sinh chọn 1 trong các chủ đề dưới đây để thực hành bài thi nói.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paper.speakingTopics.map((topic, tIdx) => (
              <div key={topic.id} className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-400 font-bold text-[10px] px-2 py-0.5 rounded-full">
                  Topic {tIdx + 1}
                </span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{topic.topicName}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">{topic.description}</p>
                
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Guide Questions:</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-500">
                    {topic.guideQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </div>

                {isSubmitted && topic.suggestedAnswers && topic.suggestedAnswers.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                    <p className="font-bold text-emerald-800 dark:text-emerald-400">Suggested Answers:</p>
                    <ul className="list-decimal pl-4 space-y-1 text-slate-500 italic">
                      {topic.suggestedAnswers.map((ans, i) => (
                        <li key={i}>{ans}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {isSubmitted ? (
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Làm lại bài thi</span>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Nộp bài & Chấm điểm</span>
          </button>
        )}
      </div>
    </div>
  );
};
