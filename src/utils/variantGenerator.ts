import { ExamPaper, Question, ExamSection, AnswerKeyItem } from '../types';

/**
 * Generates a new exam paper variant (e.g., Code 002, 003...) from an existing paper (e.g. Code 001)
 * by shuffling questions within sections and shuffling MCQ choices,
 * while preserving the underlying test matrix and specifications.
 */
export function generateNextPaperVariant(sourcePaper: ExamPaper, existingCodesCount: number): ExamPaper {
  const nextCodeNum = existingCodesCount + 1;
  const newCode = nextCodeNum < 10 ? `00${nextCodeNum}` : nextCodeNum < 100 ? `0${nextCodeNum}` : `${nextCodeNum}`;

  // Seeded random helper to make variations reproducible per code if needed, or using Math.random
  const shuffleArray = <T>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const updatedSections: ExamSection[] = sourcePaper.sections.map((section) => {
    // Keep section title and instruction
    // Listening audio script & Reading passages remain intact
    // Shuffle questions within section (except keep passage-tied questions grouped)
    const shuffledQuestions: Question[] = [];

    // Group questions by passage or keep individually
    const passageGroups: Record<string, Question[]> = {};
    const standaloneQuestions: Question[] = [];

    section.questions.forEach((q) => {
      if (q.readingPassage) {
        if (!passageGroups[q.readingPassage]) {
          passageGroups[q.readingPassage] = [];
        }
        passageGroups[q.readingPassage].push(q);
      } else {
        standaloneQuestions.push(q);
      }
    });

    // Shuffle standalone questions
    const shuffledStandalone = shuffleArray(standaloneQuestions);

    // Process standalone
    shuffledStandalone.forEach((q) => {
      shuffledQuestions.push(processQuestion(q, shuffleArray));
    });

    // Process passage groups (keep passage questions together, but shuffle choices inside)
    Object.keys(passageGroups).forEach((passageText) => {
      const groupQs = passageGroups[passageText];
      groupQs.forEach((q) => {
        shuffledQuestions.push(processQuestion(q, shuffleArray));
      });
    });

    return {
      ...section,
      questions: shuffledQuestions,
    };
  });

  // Re-build answer key with sequential item numbering 1, 2, 3...
  let itemNum = 1;
  const newAnswerKey: AnswerKeyItem[] = [];

  updatedSections.forEach((sec) => {
    sec.questions.forEach((q) => {
      newAnswerKey.push({
        questionNumber: itemNum++,
        sectionTitle: sec.title,
        answer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
      });
    });
  });

  return {
    ...sourcePaper,
    code: newCode,
    sections: updatedSections,
    answerKey: newAnswerKey,
  };
}

function processQuestion<T>(q: Question, shuffleArray: (arr: any[]) => any[]): Question {
  if (q.type !== 'MCQ' || !q.options || q.options.length < 2) {
    return { ...q };
  }

  // Find current correct text
  const currentCorrectOption = (q.options || []).find((opt) => opt.key === q.correctAnswer || opt.key + '.' === q.correctAnswer);
  const correctText = currentCorrectOption ? currentCorrectOption.text : '';

  // Shuffle option contents
  const optionTexts = q.options.map((opt) => opt.text);
  const shuffledTexts = shuffleArray(optionTexts);

  const keys = ['A', 'B', 'C', 'D', 'E'];
  let newCorrectKey = q.correctAnswer;

  const newOptions = shuffledTexts.map((text, idx) => {
    const key = keys[idx] || `${idx + 1}`;
    if (text === correctText) {
      newCorrectKey = key;
    }
    return {
      key,
      text,
    };
  });

  return {
    ...q,
    options: newOptions,
    correctAnswer: newCorrectKey,
  };
}
