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
                text: `MA TRẬN ĐỀ KIỂM TRA MÔN TIẾNG ANH ${paper.grade.toUpperCase()} - ${paper.examType.toUpperCase()}`,
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
                text: `BẢN ĐẶC TẢ ĐỀ KIỂM TRA MÔN TIẾNG ANH ${paper.grade.toUpperCase()} - ${paper.examType.toUpperCase()}`,
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
 * Creates Detap_MaDe[Code].docx
 */
export async function generateExamPaperDocx(paper: ExamPaper): Promise<Blob> {
  const admin = paper.adminInfo;

  const children: (Paragraph | Table)[] = [
    // Header block
    createExamHeaderTable(admin.schoolName, paper.examType, paper.grade, admin.academicYear, paper.code, admin.durationMinutes),

    new Paragraph({ spacing: { after: 150 } }),

    // Student Info Box
    createStudentInfoTable(),

    new Paragraph({ spacing: { after: 250 } }),
  ];

  // Render Sections
  paper.sections.forEach((section) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: 28, // 14pt
            font: FONT_FAMILY,
          }),
        ],
      })
    );

    if (section.instructions) {
      children.push(
        new Paragraph({
          spacing: { after: 150 },
          children: [
            new TextRun({
              text: section.instructions,
              italics: true,
              size: 26, // 13pt
              font: FONT_FAMILY,
            }),
          ],
        })
      );
    }

    if (section.readingPassage) {
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
                          text: section.readingPassage,
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
    section.questions.forEach((q, qIdx) => {
      const qNumText = `Câu ${qIdx + 1}: `;
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
            new TextRun({
              text: ` [${q.points}đ - ${q.cognitionLevel}]`,
              italics: true,
              size: 22, // 11pt
              font: FONT_FAMILY,
            }),
          ],
        })
      );

      // Render Options if MCQ
      if (q.type === 'MCQ' && q.options && q.options.length > 0) {
        const optionRuns = q.options.map(
          (opt) => `${opt.key}. ${opt.text}`
        );

        // Display 2x2 or 4 across
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
      } else if (q.type === 'ESSAY') {
        children.push(
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `..........................................................................................................................................................................\n..........................................................................................................................................................................\n..........................................................................................................................................................................`,
                size: 26,
                italics: true,
                font: FONT_FAMILY,
              }),
            ],
          })
        );
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

    paper.speakingTopics.forEach((topic, idx) => {
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
              text: `Guide questions:\n` + topic.guideQuestions.map((q) => `- ${q}`).join('\n'),
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
          text: `-------------- HẾT --------------\n(Cán bộ coi thi không giải thích gì thêm)`,
          bold: true,
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
          text: `ĐÁP ÁN & HƯỚNG DẪN CHẤM ĐỀ KIỂM TRA MÔN TIẾNG ANH ${paper.grade.toUpperCase()}`,
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
          text: paper.writingMarkScheme || (paper.examType.includes('Cuối kỳ') 
            ? `1. Topic sentence: 0.4 pts.\n2. Supporting sentences: 0.2 pts.\n3. Range of vocabulary use: 0.2 pts.\n4. Accuracy (Grammar, spelling, punctuation): 0.2 pts.`
            : `1. Ý tưởng & Bố cục (Task Fulfillment & Organization): 0.5 điểm\n2. Từ vựng & Ngữ pháp (Vocabulary & Grammar Accuracy): 0.5 điểm\n3. Sự mạch lạc & Liên kết (Coherence & Cohesion): 0.5 điểm`),
          size: 26,
          font: FONT_FAMILY,
        }),
      ],
    }),

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
                  text: `Suggested Answers:\n` + (topic.suggestedAnswers || topic.guideQuestions.map(() => 'N/A')).map((ans, aIdx) => `Q${aIdx+1}: ${ans}`).join('\n'),
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
                    text: schoolName.toUpperCase(),
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
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: schoolName.toUpperCase(),
                    bold: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `ĐỀ KIỂM TRA ${examType.toUpperCase()} MÔN TIẾNG ANH ${grade.toUpperCase()}`,
                    bold: true,
                    size: 26,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Năm học: ${academicYear} | Thời gian: ${durationMinutes} phút`,
                    italics: true,
                    size: 24,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `MÃ ĐỀ KIỂM TRA: ${code}`,
                    bold: true,
                    size: 32, // 16pt
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `(Đề thi gồm 02-03 trang)`,
                    italics: true,
                    size: 22,
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

function createStudentInfoTable(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Họ và tên thí sinh: .........................................................................',
                    size: 26,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Lớp: ......................... SBD: .....................................................',
                    size: 26,
                    font: FONT_FAMILY,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'ĐIỂM SỐ / LỜI PHÊ',
                    bold: true,
                    size: 22,
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

  const rows = matrix.map((item, idx) => {
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
                  text: `${item.points.toFixed(1)}đ`,
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

  const rows = specs.map((item) => {
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
                  text: `${item.totalQuestions} câu\n(${item.totalPoints.toFixed(1)}đ)`,
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
  const limit = paper.examType.includes('Cuối kỳ') ? 35 : 36;
  const mcqAnswers = paper.answerKey.filter(item => item.questionNumber <= limit);
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
  const headers = ['Câu', 'Phần thi', 'Đáp án chuẩn', 'Điểm', 'Giải thích chi tiết'];

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

  const rows = paper.answerKey.map((item) => {
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
                  text: `${item.points.toFixed(2)}đ`,
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
