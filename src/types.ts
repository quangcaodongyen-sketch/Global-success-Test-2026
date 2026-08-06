export type Grade = 'Lớp 6' | 'Lớp 7' | 'Lớp 8' | 'Lớp 9';

export type ExamType = 
  | 'Kiểm tra 15 phút'
  | 'Giữa kỳ 1'
  | 'Cuối kỳ 1'
  | 'Giữa kỳ 2'
  | 'Cuối kỳ 2';

export interface AdminInfo {
  schoolName: string;
  className: string;
  academicYear: string;
  teacherName: string;
  durationMinutes: number;
  examDate: string;
}

export interface UnitInfo {
  id: string;
  unitNumber: number;
  title: string;
  topic: string;
  grammar: string[];
  vocabulary: string[];
}

export interface MatrixItem {
  id: string;
  skill: 'LISTENING' | 'LANGUAGE FOCUS' | 'READING' | 'WRITING';
  subSkill: string; // e.g. "Pronunciation & Stress", "Grammar & Vocab", "Comprehension"
  cognitionLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  questionType: 'Trắc nghiệm' | 'Tự luận';
  questionCount: number;
  points: number;
}

export interface SpecificationItem {
  id: string;
  skill: string;
  knowledgeUnit: string;
  performanceIndicator: string; // Yêu cầu cần đạt
  recognitionCount: number; // Số câu Nhận biết
  comprehensionCount: number; // Số câu Thông hiểu
  applicationCount: number; // Số câu Vận dụng
  highApplicationCount: number; // Số câu Vận dụng cao
  totalQuestions: number;
  totalPoints: number;
}

export interface QuestionOption {
  key: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface Question {
  id: string;
  section: 'LISTENING' | 'LANGUAGE FOCUS' | 'READING' | 'WRITING';
  partTitle?: string; // e.g. "Part 1: Pronunciation"
  cognitionLevel: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  type: 'MCQ' | 'FILL_IN' | 'REWRITE' | 'ESSAY';
  prompt: string;
  options?: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  points: number;
  audioScript?: string;
  readingPassage?: string;
}

export interface ExamSection {
  title: string; // e.g. "SECTION A: LISTENING (2.0 pts)"
  instructions: string;
  readingPassage?: string;
  audioScript?: string;
  questions: Question[];
}

export interface AnswerKeyItem {
  questionNumber: number;
  sectionTitle: string;
  answer: string;
  explanation: string;
  points: number;
}

export interface SpeakingTopic {
  id: string;
  topicName: string;
  description: string;
  guideQuestions: string[];
  suggestedAnswers?: string[];
}

export interface ExamPaper {
  code: string; // e.g. "001", "002"
  adminInfo: AdminInfo;
  grade: Grade;
  examType: ExamType;
  selectedUnits: string[];
  audioScript: string;
  sections: ExamSection[];
  answerKey: AnswerKeyItem[];
  writingMarkScheme?: string;
  speakingTopics?: SpeakingTopic[];
}

export interface FullExamSuite {
  matrix: MatrixItem[];
  specifications: SpecificationItem[];
  papers: ExamPaper[];
  summary: {
    totalQuestions: number;
    totalPoints: number;
    mcqCount: number;
    essayCount: number;
    timeMinutes: number;
    recognitionRatio: number;
    comprehensionRatio: number;
    applicationRatio: number;
    highApplicationRatio: number;
  };
}

export interface TemplateFileData {
  name: string;
  type: 'matrix' | 'specification' | 'sample_exam';
  content: string;
  uploadDate: string;
  detectedExamType?: ExamType;
  detectedGrade?: Grade;
}
