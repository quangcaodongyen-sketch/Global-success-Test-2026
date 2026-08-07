import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  Packer,
} from 'docx';
import { FullExamSuite, ExamPaper, MatrixItem, SpecificationItem } from '../types';

// Standard Decree 30/2020/NĐ-CP Page Margins (in dxa: 1 mm = 56.7 dxa)
// Top: 20mm (1134 dxa), Bottom: 20mm (1134 dxa), Left: 30mm (1701 dxa), Right: 15mm (850 dxa)
const MARGINS = {
  top: 1134,
  bottom: 1134,
  left: 1701,
  right: 850,
};

const FONT_FAMILY = 'Times New Roman';

/**
 * Creates Matran_Dacta_[Grade]_[ExamType].docx
 */
export async function generateMatrixAndSpecDocx(suite: FullExamSuite, paper: ExamPaper): Promise<Blob> {
  const admin = paper.adminInfo;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: MARGINS,
          },
        },
        children: [
          // Header administrative block
          createHeaderBlock(admin.schoolName, `MA TRẬN VÀ BẢN ĐẶC TẢ ĐỀ KIỂM TRA`),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200, before: 200 },
            children: [
              new TextRun({
                text: `MA TRẬN ĐỀ KIỂM TRA MÔN TIẾNG ANH ${(paper.grade || '').toUpperCase()} - ${(paper.examType || '').toUpperCase()}`,
                bold: true,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `Năm học: ${admin.academicYear} | Thời gian làm bài: ${admin.durationMinutes} phút`,
                italics: true,
                size: 24, // 12pt
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Matrix Table
          createMatrixTable(suite.matrix),

          new Paragraph({ spacing: { after: 300 } }),

          // Specification Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200, before: 200 },
            children: [
              new TextRun({
                text: `BẢN ĐẶC TẢ ĐỀ KIỂM TRA MÔN TIẾNG ANH ${(paper.grade || '').toUpperCase()} - ${(paper.examType || '').toUpperCase()}`,
                bold: true,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
            ],
          }),

          // Specification Table
          createSpecTable(suite.specifications),

          // Signatures Footer according to Decree 30
          createSignatureBlock(admin.teacherName),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Utility to strip out redundant administrative header lines (e.g. TRƯỜNG THCS..., ĐỀ KIỂM TRA...)
 * that Gemini AI or uploaded Word templates mistakenly put inside section titles, instructions, or passages.
 */
export function cleanHeaderLines(text: string): string {
  if (!text) return '';
  const lines = text.split('\n');
  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    const upper = trimmed.toUpperCase();

    // Preserve actual Part or Section headers like "Part 1. Listen..." or "SECTION A: LISTENING"
    const isPartHeader = /^(part|section|phần|bài)\s*(\d+|[a-z])[\.\:\s]/i.test(trimmed);
    if (isPartHeader) {
      return true;
    }

    // Identify administrative header keyword patterns (Vietnamese & English)
    const isHeaderLine =
      upper.startsWith('UBND') ||
      upper.startsWith('SỞ GIÁO DỤC') ||
      upper.startsWith('PHÒNG GIÁO DỤC') ||
      upper.startsWith('TRƯỜNG THCS') ||
      upper.startsWith('TRƯỜNG THPT') ||
      upper.startsWith('SCHOOL:') ||
      upper.includes('BÀI KIỂM TRA') ||
      upper.includes('ĐỀ KIỂM TRA') ||
      upper.includes('GIỮA KỲ') ||
      upper.includes('CUỐI KỲ') ||
      upper.includes('KIỂM TRA 15') ||
      upper.includes('MID-TERM TEST') ||
      upper.includes('MID TERM TEST') ||
      upper.includes('FINAL-TERM TEST') ||
      upper.includes('FINAL TERM TEST') ||
      upper.includes('SEMESTER TEST') ||
      upper.includes('ENGLISH TEST') ||
      upper.includes('ENGLISH 6') ||
      upper.includes('ENGLISH 7') ||
      upper.includes('ENGLISH 8') ||
      upper.includes('ENGLISH 9') ||
      upper.includes('GRADE 6') ||
      upper.includes('GRADE 7') ||
      upper.includes('GRADE 8') ||
      upper.includes('GRADE 9') ||
      upper.includes('GLOBAL SUCCESS') ||
      upper.includes('NĂM HỌC:') ||
      upper.includes('MÔN: TIẾNG ANH') ||
      upper.includes('THỜI GIAN LÀM BÀI') ||
      upper.includes('KHÔNG KỂ THỜI GIAN') ||
      upper.includes('TIME ALLOWED') ||
      upper.includes('DURATION:') ||
      upper.includes('TIME:') ||
      upper.includes('MÃ ĐỀ:') ||
      upper.includes('CODE:') ||
      upper.includes('TEST CODE:') ||
      upper.includes('HỌ VÀ TÊN') ||
      upper.includes('FULL NAME:') ||
      upper.includes('CLASS:');

    if (isHeaderLine) {
      return false;
    }
    return true;
  });

  return filtered.join('\n').trim();
}

/**
 * Creates Detap_MaDe[Code].docx
 */
export async function generateExamPaperDocx(paper: ExamPaper, showCognition: boolean = true): Promise<Blob> {
  const admin = paper.adminInfo || {};

  const children: (Paragraph | Table)[] = [
    // Header block
    createExamHeaderTable(admin.schoolName || paper.schoolName || 'TRƯỜNG THCS', paper.examType, paper.grade, admin.academicYear, paper.code, admin.durationMinutes),

    new Paragraph({ spacing: { after: 150 } }),

    // Student Info & Score Box
    createStudentInfoTable(paper.examType),

    new Paragraph({ spacing: { after: 250 } }),
  ];

  // Render Sections
  let globalQuestionIndex = 1;
  const safeSections = Array.isArray(paper.sections) ? paper.sections : [];

  safeSections.forEach((section, sIdx) => {
    const rawQuestions = Array.isArray(section.questions) ? section.questions : [];
    let cleanTitle = cleanHeaderLines(section.title || '');
    let cleanInstructions = cleanHeaderLines(section.instructions || '');
    const cleanPassage = cleanHeaderLines(section.readingPassage || '');

    const hasEssay = rawQuestions.some((q) => q.type === 'ESSAY');
    if (hasEssay) {
      // Suppress instructions if it just repeats title or says "Write a paragraph..."
      const lowerInst = cleanInstructions.toLowerCase();
      if (lowerInst.includes('write a paragraph') || lowerInst.includes('following topic')) {
        cleanInstructions = '';
      }

      // Extract specific topic from essay prompt if cleanTitle is generic ("a given topic")
      const essayQ = rawQuestions.find((q) => q.type === 'ESSAY');
      if (essayQ && essayQ.prompt) {
        const cleanedEssayPrompt = essayQ.prompt.replace(/^(câu\s*\d+|question\s*\d+|\d+[\.\:]\s*)+/i, '').trim();
        const topicMatch = cleanedEssayPrompt.match(/about\s+([^.\n]+)/i);
        if (topicMatch) {
          let topicStr = topicMatch[1].trim();
          topicStr = topicStr.split(/\byou\s+should\b|\binclude\b/i)[0].trim();
          if (topicStr && cleanTitle.toLowerCase().includes('a given topic')) {
            cleanTitle = cleanTitle.replace(/a given topic/i, topicStr);
          }
        }
      }
    }

    // Completely skip empty section or header-only section without questions
    if (rawQuestions.length === 0 && !cleanTitle && !cleanInstructions) {
      return;
    }

    // Determine displayed section title
    const displayTitle = cleanTitle || (rawQuestions.length > 0 ? `PART ${sIdx + 1}` : '');

    if (displayTitle) {
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: displayTitle,
              bold: true,
              size: 28, // 14pt
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }

    if (cleanInstructions) {
      children.push(
        new Paragraph({
          spacing: { after: 150 },
          children: [
            new TextRun({
              text: cleanInstructions,
              italics: true,
              size: 26, // 13pt
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }

    if (cleanPassage) {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cleanPassage,
                          size: 26,
                          font: FONT_FAMILY,
                        }),
                      ],
                    }),
                  ],
                  shading: { fill: 'F8FAFC' },
                  margins: { top: 150, bottom: 150, left: 150, right: 150 },
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ spacing: { after: 150 } })
      );
    }

    // Questions
    rawQuestions.forEach((q) => {
      const isEssay = q.type === 'ESSAY';
      const qNumText = isEssay ? "" : `${globalQuestionIndex}. `;
      const cleanedPromptRaw = cleanHeaderLines(q.prompt || '');

      if (isEssay) {
        // Strip question numbers like "37. ", "Question 37:", or duplicate title sentences
        let cleanedPrompt = (q.prompt || '')
          .replace(/^(câu\s*\d+|question\s*\d+|\d+[\.\:]\s*)+/i, '')
          .trim();

        // Extract topic name if present (e.g. "about your favorite hobby")
        let topicName = '';
        const topicMatch = cleanedPrompt.match(/about\s+([^.\n]+)/i);
        if (topicMatch) {
          topicName = topicMatch[1].trim();
        }

        // If section.title contains "a given topic", replace it with the specific topic name
        if (topicName && section.title && section.title.toLowerCase().includes('a given topic')) {
          const updatedTitle = section.title.replace(/a given topic/i, topicName);
          // Update the last paragraph in children (which was displayTitle) if possible, or print clean guide lines
        }

        // Split guide lines (e.g., "You should include:", "What your hobby is.", etc.)
        const promptLines = cleanedPrompt.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // Filter out line if it just repeats "Write a paragraph..." title
        const guideLines = promptLines.filter(line => {
          const lower = line.toLowerCase();
          return !lower.startsWith('write a paragraph') && !lower.startsWith('write a short paragraph');
        });

        // Render guide lines indented & italicized
        guideLines.forEach((gLine) => {
          children.push(
            new Paragraph({
              spacing: { before: 40, after: 40 },
              indent: { left: 400 },
              children: [
                new TextRun({
                  text: gLine,
                  italics: true,
                  size: 26, // 13pt
                  font: FONT_FAMILY,
                }),
              ],
            })
          );
        });

        if (showCognition) {
          children.push(
            new Paragraph({
              indent: { left: 400 },
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: `[${q.points}đ - ${q.cognitionLevel}]`,
                  italics: true,
                  size: 22, // 11pt
                  font: FONT_FAMILY,
                }),
              ],
            })
          );
        }
      } else {
        children.push(
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({
                text: qNumText,
                bold: true,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: q.prompt,
                size: 28, // 14pt
                font: FONT_FAMILY,
              }),
              ...(showCognition
                ? [
                    new TextRun({
                      text: ` [${q.points}đ - ${q.cognitionLevel}]`,
                      italics: true,
                      size: 22, // 11pt
                      font: FONT_FAMILY,
                    }),
                  ]
                : []),
            ],
          })
        );
      }
      if (!isEssay) {
        globalQuestionIndex++;
      }

      // Render Options if question has options
      if (q.options && q.options.length > 0) {
        const optionRuns = (q.options || []).map(
          (opt) => `${opt.key || ''}. ${opt.text || ''}`
        );

        // Display 2x2 or 3/4 across
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            indent: { left: 400 },
            children: [
              new TextRun({
                text: optionRuns.join('       '),
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          })
        );
      } else if (q.type === 'REWRITE' || q.type === 'FILL_IN') {
        const promptHasDots = (q.prompt || '').includes('....');
        if (!promptHasDots) {
          children.push(
            new Paragraph({
              spacing: { after: 150 },
              children: [
                new TextRun({
                  text: `👉 Trả lời: ..........................................................................................................................................................`,
                  size: 26,
                  italics: true,
                  font: FONT_FAMILY,
                }),
              ],
            })
          );
        }
      } else if (q.type === 'ESSAY' && (!q.options || q.options.length === 0)) {
        // Render 8 clean dotted lines for essay writing area
        for (let i = 0; i < 8; i++) {
          children.push(
            new Paragraph({
              spacing: { before: 100, after: 100 },
              children: [
                new TextRun({
                  text: '..........................................................................................................................................................................',
                  size: 24,
                  color: '94A3B8',
                  font: FONT_FAMILY,
                }),
              ],
            })
          );
        }
      }
    });
  });

  // Render Speaking Topics
  if (paper.speakingTopics && paper.speakingTopics.length > 0) {
    children.push(
      new Paragraph({
        spacing: { before: 250, after: 100 },
        children: [
          new TextRun({
            text: `SECTION E: SPEAKING (2.0 pts - CHẤM RIÊNG)`,
            bold: true,
            size: 28, // 14pt
            font: FONT_FAMILY,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 150 },
        children: [
          new TextRun({
            text: `Choose one of the following topics and talk about it. You have 1 minute to prepare and 2 minutes to speak.`,
            italics: true,
            size: 26, // 13pt
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    (Array.isArray(paper.speakingTopics) ? paper.speakingTopics : []).forEach((topic, idx) => {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 50 },
          children: [
            new TextRun({
              text: `Topic ${idx + 1}: ${topic.topicName}`,
              bold: true,
              size: 26,
              font: FONT_FAMILY,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 50 },
          children: [
            new TextRun({
              text: topic.description,
              italics: true,
              size: 24,
              font: FONT_FAMILY,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 100 },
          indent: { left: 200 },
          children: [
            new TextRun({
              text: `Guide questions:\n` + (topic.guideQuestions || []).map((q) => `- ${q}`).join('\n'),
              size: 24,
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    });
  }

  // End of test note
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 200 },
      children: [
        new TextRun({
          text: `-------- The end --------`,
          bold: false,
          italics: true,
          size: 24,
          font: FONT_FAMILY,
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: MARGINS },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Creates DapAn_HuongDanCham_[ExamType].docx
 */
export async function generateAnswerKeyDocx(paper: ExamPaper): Promise<Blob> {
  const admin = paper.adminInfo;

  const children: (Paragraph | Table)[] = [
    createHeaderBlock(admin.schoolName, `ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM`),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, before: 150 },
      children: [
        new TextRun({
          text: `ĐÁP ÁN & HƯỚNG DẪN CHẤM ĐỀ KIỂM TRA MÔN TIẾNG ANH ${(paper.grade || '').toUpperCase()}`,
          bold: true,
          size: 28,
          font: FONT_FAMILY,
        }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `MÃ ĐỀ KIỂM TRA: ${paper.code} | Loại bài: ${paper.examType} | Năm học: ${admin.academicYear}`,
          italics: true,
          size: 24,
          font: FONT_FAMILY,
        }),
      ],
    }),

    // Audio script if Listening section exists
    ...(paper.audioScript
      ? [
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: `I. NỘI DUNG BĂNG NGHE (LISTENING AUDIO SCRIPT):`,
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: paper.audioScript,
                            italics: true,
                            size: 26,
                            font: FONT_FAMILY,
                          }),
                        ],
                      }),
                    ],
                    shading: { fill: 'F1F5F9' },
                    margins: { top: 150, bottom: 150, left: 150, right: 150 },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { after: 200 } }),
        ]
      : []),

    // Compact MCQ Answer Grid Table
    new Paragraph({
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: `II. BẢNG ĐÁP ÁN TRẮC NGHIỆM KHÁCH QUAN (MÃ ĐỀ ${paper.code}):`,
          bold: true,
          size: 28,
          font: FONT_FAMILY,
        }),
      ],
    }),

    createCompactAnswerGridTable(paper),

    new Paragraph({ spacing: { after: 200 } }),

    // Detailed Answer Table
    new Paragraph({
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: `III. ĐÁP ÁN CHI TIẾT KÈM GIẢI THÍCH & BIỂU ĐIỂM:`,
          bold: true,
          size: 28,
          font: FONT_FAMILY,
        }),
      ],
    }),

    createAnswerKeyTable(paper),

    new Paragraph({ spacing: { after: 200 } }),

    // Writing Scoring Criteria
    new Paragraph({
      spacing: { before: 150, after: 100 },
      children: [
        new TextRun({
          text: `IV. HƯỚNG DẪN CHẤM PHẦN VIẾT (WRITING MARK SCHEME):`,
          bold: true,
          size: 28,
          font: FONT_FAMILY,
        }),
      ],
    }),

    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: paper.writingMarkScheme || ((paper.examType || '').includes('Cuối kỳ') 
            ? `1. Topic sentence: 0.4 pts.\n2. Supporting sentences: 0.2 pts.\n3. Range of vocabulary use: 0.2 pts.\n4. Accuracy (Grammar, spelling, punctuation): 0.2 pts.`
            : `1. Ý tưởng & Bố cục (Task Fulfillment & Organization): 0.5 điểm\n2. Từ vựng & Ngữ pháp (Vocabulary & Grammar Accuracy): 0.5 điểm\n3. Sự mạch lạc & Liên kết (Coherence & Cohesion): 0.5 điểm`),
          size: 26,
          font: FONT_FAMILY,
        }),
      ],
    }),

    // Dynamically print sample essay from the last question in answer key (Writing Question)
    ...(() => {
      const lastQ = paper.answerKey[paper.answerKey.length - 1];
      if (lastQ && lastQ.explanation) {
        return [
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [
              new TextRun({
                text: `* Bài viết mẫu gợi ý (Sample Writing Essay):`,
                bold: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: lastQ.explanation,
                italics: true,
                size: 26,
                font: FONT_FAMILY,
              }),
            ],
          })
        ];
      }
      return [];
    })(),

    // Speaking Suggested Answers
    ...(paper.speakingTopics && paper.speakingTopics.length > 0
      ? [
          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: `V. HƯỚNG DẪN CHẤM VÀ GỢI Ý ĐÁP ÁN PHẦN NÓI (SPEAKING GUIDELINES):`,
                bold: true,
                size: 28,
                font: FONT_FAMILY,
              }),
            ],
          }),
          ...paper.speakingTopics.flatMap((topic, idx) => [
            new Paragraph({
              spacing: { before: 100, after: 50 },
              children: [
                new TextRun({
                  text: `Chủ đề nói ${idx + 1}: ${topic.topicName}`,
                  bold: true,
                  size: 26,
                  font: FONT_FAMILY,
                }),
              ],
            }),
            new Paragraph({
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: `Suggested Answers:\n` + (topic.suggestedAnswers || (topic.guideQuestions || []).map(() => 'N/A')).map((ans, aIdx) => `Q${aIdx+1}: ${ans}`).join('\n'),
                  size: 24,
                  italics: true,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ]),
        ]
      : []),

    createSignatureBlock(admin.teacherName),
  ];

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: MARGINS } },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// Helpers for Administrative Layout according to Decree 30/2020/NĐ-CP
function createHeaderBlock(schoolName: string, subTitle: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (schoolName || '').toUpperCase(),
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: subTitle,
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Độc lập - Tự do - Hạnh phúc',
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createExamHeaderTable(
  schoolName: string,
  examType: string,
  grade: string,
  academicYear: string,
  code: string,
  durationMinutes: number
): Table {
  const schoolUpper = (schoolName || '').toUpperCase();
  const ubndText = schoolUpper.includes('ĐỒNG YÊN') ? 'UBND XÃ ĐỒNG YÊN' : 'UBND XÃ .............';
  const gradeNum = (grade || '').replace(/[^0-9]/g, '');

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: ubndText,
                    bold: true,
                    size: 24, // 12pt
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: schoolUpper,
                    bold: true,
                    color: 'FF0000', // RED
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 50 },
                children: [
                  new TextRun({
                    text: '_________________',
                    bold: true,
                    size: 20,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `BÀI KIỂM TRA ĐÁNH GIÁ ${(examType || '').toUpperCase()}`,
                    bold: true,
                    size: 26, // 13pt
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `NĂM HỌC: ${academicYear}`,
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Môn: Tiếng Anh `,
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    text: gradeNum,
                    bold: true,
                    color: 'FF0000', // RED
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Thời gian: ${durationMinutes} phút`,
                    italics: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createStudentInfoTable(examType: string): Table {
  const isFinal = (examType || '').toUpperCase().includes('CUỐI KÌ') || (examType || '').toUpperCase().includes('CUỐI KỲ');

  const marksTableRows = isFinal
    ? [
        // Row 1: Headers
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              columnSpan: 2,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: 'Mark',
                      bold: true,
                      size: 26,
                      font: FONT_FAMILY,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              rowSpan: 2,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                  children: [
                    new TextRun({
                      text: 'Total',
                      bold: true,
                      size: 26,
                      font: FONT_FAMILY,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              rowSpan: 2,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                  children: [
                    new TextRun({
                      text: "Teacher's remark",
                      bold: true,
                      size: 26,
                      font: FONT_FAMILY,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // Row 2: Sub-headers for Mark
        new TableRow({
          children: [
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: 'Speak',
                      bold: true,
                      size: 24,
                      font: FONT_FAMILY,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: 'Write',
                      bold: true,
                      size: 24,
                      font: FONT_FAMILY,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // Row 3: Empty spacing for values and remarks
        new TableRow({
          children: [
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ spacing: { before: 400, after: 400 } }),
              ],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ spacing: { before: 400, after: 400 } }),
              ],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ spacing: { before: 400, after: 400 } }),
              ],
            }),
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: '.......................................................................................\n\n.......................................................................................',
                      size: 22,
                      font: FONT_FAMILY,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ]
    : [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: 'Marks',
                      bold: true,
                      size: 26,
                      font: FONT_FAMILY,
                    }),
                  ],
                }),
                new Paragraph({ spacing: { before: 300, after: 300 } }),
              ],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: "Teacher's remarks",
                      bold: true,
                      size: 26,
                      font: FONT_FAMILY,
                    }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 100, after: 100 },
                  children: [
                    new TextRun({
                      text: '____________________________________________________________________\n\n____________________________________________________________________',
                      size: 22,
                      font: FONT_FAMILY,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { before: 150, after: 150 },
                children: [
                  new TextRun({
                    text: 'Full name: ',
                    size: 26,
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    text: '____________________________________',
                    size: 26,
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    text: ', class: ',
                    size: 26,
                    font: FONT_FAMILY,
                  }),
                  new TextRun({
                    text: '... ____',
                    size: 26,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: marksTableRows,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function createMatrixTable(matrix: MatrixItem[]): Table {
  const headers = [
    'STT',
    'Kỹ năng / Dạng bài',
    'Mức độ Cognition',
    'Số câu',
    'Tổng điểm',
  ];

  const headerCells = headers.map(
    (h) =>
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: h, bold: true, size: 24, font: FONT_FAMILY }),
            ],
          }),
        ],
        shading: { fill: 'E2E8F0' },
      })
  );

  const rows = (matrix || []).map((item, idx) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${idx + 1}`,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${item.skill} - ${item.subSkill}`,
                  bold: true,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: item.cognitionLevel,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.questionCount}`,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${(item?.points || 0).toFixed(1)}đ`,
                  bold: true,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...rows],
  });
}

function createSpecTable(specs: SpecificationItem[]): Table {
  const headers = [
    'Kỹ năng',
    'Chủ đề / Đơn vị kiến thức',
    'Yêu cầu cần đạt',
    'Nhận biết',
    'Thông hiểu',
    'Vận dụng',
    'Vận dụng cao',
    'Tổng',
  ];

  const headerCells = headers.map(
    (h) =>
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: h, bold: true, size: 22, font: FONT_FAMILY }),
            ],
          }),
        ],
        shading: { fill: 'E2E8F0' },
      })
  );

  const rows = (specs || []).map((item) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.skill,
                  bold: true,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.knowledgeUnit,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.performanceIndicator,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.recognitionCount}`,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.comprehensionCount}`,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.applicationCount}`,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.highApplicationCount}`,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.totalQuestions} câu\n(${(item?.totalPoints || 0).toFixed(1)}đ)`,
                  bold: true,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...rows],
  });
}

function createCompactAnswerGridTable(paper: ExamPaper): Table {
  const limit = (paper.examType || '').includes('Cuối kỳ') ? 35 : 36;
  const mcqAnswers = (paper.answerKey || []).filter(item => item.questionNumber <= limit);
  const rows: TableRow[] = [];
  const colsCount = 6;
  
  for (let i = 0; i < mcqAnswers.length; i += colsCount) {
    const chunk = mcqAnswers.slice(i, i + colsCount);
    const rowCells = chunk.map(item => 
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${item.questionNumber}. `, bold: true, size: 24, font: FONT_FAMILY }),
              new TextRun({ text: `${item.answer}`, bold: true, size: 24, color: '1D4ED8', font: FONT_FAMILY }),
            ]
          })
        ],
        margins: { top: 120, bottom: 120, left: 100, right: 100 }
      })
    );
    while (rowCells.length < colsCount) {
      rowCells.push(new TableCell({ children: [] }));
    }
    rows.push(new TableRow({ children: rowCells }));
  }
  
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows
  });
}

function createAnswerKeyTable(paper: ExamPaper): Table {
  const headers = ['Câu', 'Phần kiểm tra', 'Đáp án chuẩn', 'Điểm', 'Giải thích chi tiết'];

  const headerCells = headers.map(
    (h) =>
      new TableCell({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: h, bold: true, size: 24, font: FONT_FAMILY }),
            ],
          }),
        ],
        shading: { fill: 'E2E8F0' },
      })
  );

  const rows = (paper.answerKey || []).map((item) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${item.questionNumber}`,
                  bold: true,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.sectionTitle,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: item.answer,
                  bold: true,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${(item?.points || 0).toFixed(2)}đ`,
                  size: 24,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: item.explanation,
                  italics: true,
                  size: 22,
                  font: FONT_FAMILY,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...rows],
  });
}

function createSignatureBlock(teacherName: string): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'DUYỆT CỦA BẢN GIÁM HIỆU / TỔ TRƯỞNG',
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Ký và ghi rõ họ tên)',
                    italics: true,
                    size: 22,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'GIÁO VIÊN RA ĐỀ',
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: '(Ký và ghi rõ họ tên)',
                    italics: true,
                    size: 22,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({ spacing: { before: 600 } }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: teacherName,
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
