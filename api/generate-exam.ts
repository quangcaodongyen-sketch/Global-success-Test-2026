import { GoogleGenAI, Type } from '@google/genai';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Helper to execute Gemini API calls with exponential backoff on 429 / RESOURCE_EXHAUSTED rate limits
async function generateContentWithRetry(aiInstance: GoogleGenAI, modelName: string, params: any, maxRetries = 2, initialDelayMs = 2000) {
  let delay = initialDelayMs;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await aiInstance.models.generateContent({
        model: modelName,
        ...params
      });
    } catch (err: any) {
      const isQuotaError =
        err?.status === 'RESOURCE_EXHAUSTED' ||
        err?.code === 429 ||
        (err?.message && (err.message.includes('429') || err.message.includes('Quota exceeded') || err.message.includes('RESOURCE_EXHAUSTED')));

      if (isQuotaError && attempt < maxRetries) {
        console.warn(`[Gemini API] Quota/Rate limit reached for ${modelName}. Retrying attempt ${attempt}/${maxRetries} after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5;
      } else {
        throw err;
      }
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { grade, examType, selectedUnits, adminInfo, customPrompt, uploadedTemplates, model: selectedModel } = req.body;

    if (!grade || !examType || !selectedUnits || selectedUnits.length === 0) {
      return res.status(400).json({
        error: 'Vui lòng chọn khối lớp, loại bài kiểm tra và ít nhất một Unit kiến thức.',
      });
    }
    // Get API Key from Header or Body or Environment
    const apiKey = (req.headers['x-api-key'] as string) || req.body.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp API Key trong phần Cài đặt ở Header để sử dụng ứng dụng.',
      });
    }

    const isFinalTerm = examType.includes('Cuối kỳ');
    const isMidTerm = examType.includes('Giữa kỳ');

    let wordCountRange = '80-100';
    if (grade.includes('6') || grade.includes('7')) {
      wordCountRange = '60-80';
    } else if (grade.includes('8')) {
      wordCountRange = '80-100';
    } else if (grade.includes('9')) {
      wordCountRange = '100-120';
    }

    let examStructureRules = '';
    if (isMidTerm) {
      examStructureRules = `
CẤU TRÚC ĐỀ KIỂM TRA GIỮA KỲ (TỔNG ĐIỂM VIẾT: 10.0 ĐIỂM) - BẮT BUỘC GỒM 8 PHẦN:
- Part 1. Listen and decide if each statement is True (T) or False (F). You will listen TWICE. (1.25 pts) -> Gồm 5 câu (1-5), mỗi câu 0.25 điểm. Đáp án: A. T, B. F. Lời thoại bài nghe: Bài ĐỘC THOẠI GIỌNG NỮ (Monologue) dễ nghe.
- Part 2. Listen to the conversation and choose the best answer A, B, or C. You will listen TWICE. (1.25 pts) -> Gồm 5 câu (6-10), mỗi câu 0.25 điểm. Đáp án: A, B, C. Lời thoại bài nghe: Bài HỘI THOẠI giữa 2 người (1 Nam, 1 Nữ, ví dụ: Tom & Mary), có ghi rõ nhân vật (Male/Female) để phát sinh giọng đọc luân phiên.
- Part 3. Choose A, B, or C to complete the following sentences. (3.0 pts) -> Gồm 12 câu (11-22), mỗi câu 0.25 điểm. Đáp án: A, B, C.
- Part 4. Read the text. Then choose the best answer. (1.25 pts) -> Gồm 5 câu (23-27), mỗi câu 0.25 điểm. Đáp án: A, B, C.
- Part 5. Read the passage and choose the best answer for each question. (1.25 pts) -> Gồm 5 câu (28-32), mỗi câu 0.25 điểm. Đáp án: A, B, C.
- Part 6. Choose the sentence that has the closest meaning to the root. (0.5 pt) -> Gồm 2 câu (33-34), mỗi câu 0.25 điểm. Đáp án: A, B, C.
- Part 7. Reorder the words/phrases to make completed sentences. (0.5 pts) -> Gồm 2 câu (35-36), mỗi câu 0.25 điểm. Đáp án: A, B, C.
- Part 8. Write a short paragraph (${wordCountRange} words) about [specific topic]. (1.0 pt) -> 1 câu tự luận viết đoạn văn. TRƯỜNG type BẮT BUỘC LÀ "ESSAY". Tiêu đề section 'title' ghi gộp tên chủ đề cụ thể. Trường 'instructions' BẮT BUỘC ĐỂ TRỐNG (""). Trường 'prompt' CHỈ BẮT ĐẦU BẰNG "You should include:" và các câu gợi ý dàn ý, KHÔNG đánh số câu 37, KHÔNG ghi lặp "Write a paragraph...".
`;
    } else if (isFinalTerm) {
      examStructureRules = `
CẤU TRÚC ĐỀ KIỂM TRA CUỐI KỲ (TỔNG ĐIỂM VIẾT: 8.0 ĐIỂM - TỔNG ĐIỂM TOÀN BÀI CẢ NÓI LÀ 10.0 ĐIỂM) - BẮT BUỘC GỒM 8 PHẦN:
- Part 1. Listen and decide if each statement is True (T) or False (F). You will listen TWICE. (1.0 pt) -> Gồm 5 câu (1-5), mỗi câu 0.2 điểm. Đáp án: A. T, B. F. Lời thoại bài nghe: Bài ĐỘC THOẠI GIỌNG NỮ (Monologue) dễ nghe.
- Part 2. Listen to the conversation and choose the best answer A, B, or C. You will listen TWICE. (1.0 pt) -> Gồm 5 câu (6-10), mỗi câu 0.2 điểm. Đáp án: A, B, C. Lời thoại bài nghe: Bài HỘI THOẠI giữa 2 người (1 Nam, 1 Nữ, ví dụ: Tom & Mary), có ghi rõ nhân vật (Male/Female) để phát sinh giọng đọc luân phiên.
- Part 3. Choose A, B, or C to complete the following sentences. (2.4 pts) -> Gồm 12 câu (11-22), mỗi câu 0.2 điểm. Đáp án: A, B, C.
- Part 4. Read the passage and choose the best answer. (1.0 pt) -> Gồm 5 câu (23-27), mỗi câu 0.2 điểm. Đáp án: A, B, C.
- Part 5. Read the passage and choose the best answer for each question. (1.0 pt) -> Gồm 5 câu (28-32), mỗi câu 0.2 điểm. Đáp án: A, B, C.
- Part 6. Choose the sentence that has the closest meaning to the root. (0.4 pt) -> Gồm 2 câu (33-34), mỗi câu 0.2 điểm. Đáp án: A, B, C.
- Part 7. Reorder the words/phrases to make completed sentences. (0.2 pt) -> Gồm 1 câu (câu 35), 0.2 điểm. Đáp án: A, B, C.
- Part 8. Write a paragraph (${wordCountRange} words) about [specific topic]. (1.0 pt) -> 1 câu tự luận viết đoạn văn. TRƯỜNG type BẮT BUỘC LÀ "ESSAY". Tiêu đề section 'title' ghi gộp tên chủ đề cụ thể. Trường 'instructions' BẮT BUỘC ĐỂ TRỐNG (""). Trường 'prompt' CHỈ BẮT ĐẦU BẰNG "You should include:" và các câu gợi ý dàn ý, KHÔNG đánh số câu 36/37, KHÔNG ghi lặp "Write a paragraph...".
`;
    } else {
      examStructureRules = `
CẤU TRÚC ĐỀ KIỂM TRA 15 PHÚT (TỔNG ĐIỂM: 10.0 ĐIỂM):
- Gồm 10 câu trắc nghiệm khách quan (1-10), mỗi câu 1.0 điểm. Lựa chọn đáp án A, B hoặc C.
`;
    }

    const systemPrompt = `Bạn là một Chuyên gia Biên soạn Đề kiểm tra và Khảo thí Tiếng Anh THCS uy tín theo chương trình sách giáo khoa Global Success của Bộ Giáo dục và Đào tạo Việt Nam.
Nhiệm vụ của bạn là sinh BỘ ĐỀ KIỂM TRA CHUẨN ĐẦY ĐỦ gồm:
1. Bảng Ma trận đề kiểm tra (Matrix) phân bổ đúng các mức độ: Nhận biết (40%), Thông hiểu (30%), Vận dụng (20%), Vận dụng cao (10%). Tổng điểm của ma trận phải khớp với tổng điểm viết của đề kiểm tra (${isFinalTerm ? '8.0' : '10.0'} điểm).
2. Bảng Bản đặc tả đề kiểm tra (Specifications) chi tiết chuẩn Bộ GDĐT.
3. Đề kiểm tra Mã đề 001 gồm đầy đủ các phần theo cấu trúc chi tiết bên dưới. TUYỆT ĐỐI KHÔNG tạo bất kỳ section nào rỗng hoặc không chứa câu hỏi. TUYỆT ĐỐI KHÔNG đưa tên trường hoặc tiêu đề bài kiểm tra (như "TRƯỜNG THCS...", "ĐỀ KIỂM TRA GIỮA KỲ...", "MID-TERM TEST...", "FINAL-TERM TEST...", "GRADE 6/7/8/9...", "GLOBAL SUCCESS...", "Time allowed:...", "THỜI GIAN LÀM BÀI...", "MÃ ĐỀ: 001...") vào bất kỳ trường title, instructions, readingPassage hay prompt nào của bất kỳ section nào. Các section BẮT BUỘC chỉ được bắt đầu bằng tiêu đề Part (như "Part 1. Listen...", "Part 2. Listen...", "Part 3. Choose...").
4. Kịch bản bài nghe (audioScript): BẮT BUỘC ghi đầy đủ kịch bản 2 phần. Phần Part 1 ghi "--- PART 1: MONOLOGUE ---" (Bài độc thoại giọng nữ), Phần Part 2 ghi "--- PART 2: DIALOGUE ---" (Bài hội thoại 1 Nam 1 Nữ, ví dụ: Tom (Male): ..., Mary (Female): ...).
5. Đáp án và Hướng dẫn chấm chi tiết kèm biểu điểm cho từng câu. Đặc biệt: đối với phần nghe phải có đầy đủ đáp án chuẩn trong bảng key; đối với phần tự luận viết đoạn văn (Writing paragraph) ở câu viết cuối cùng, bạn BẮT BUỘC phải viết một bài văn/đoạn văn mẫu (Sample Essay) hoàn chỉnh khoảng ${wordCountRange} từ và đặt trong trường 'explanation' của câu hỏi đó để làm đáp án mẫu cho học sinh tham khảo.
6. Luôn sinh ra 3 chủ đề nói (speakingTopics) bám sát các Unit học sinh đã học, mỗi chủ đề gồm: tên chủ đề (topicName), mô tả tình huống bằng tiếng Anh (description), 3 câu hỏi gợi ý bằng tiếng Anh (guideQuestions) và 3 câu trả lời mẫu gợi ý tương ứng (suggestedAnswers).

YÊU CẦU BẮT BUỘC VỀ SỐ LƯỢNG VÀ ĐỊNH DẠNG ĐÁP ÁN TRẮC NGHIỆM:
- Tất cả các câu hỏi trắc nghiệm trong đề kiểm tra chỉ được phép có từ 2 đến 3 đáp án lựa chọn (True/False là 2 đáp án A/B; các câu MCQ khác là 3 đáp án A/B/C).
- TUYỆT ĐỐI KHÔNG ĐƯỢC có đáp án thứ 4 (không có đáp án D).
- Đối với câu hỏi Đúng/Sai (True/False), hai lựa chọn đáp án bắt buộc phải để dưới dạng viết tắt:
  + Lựa chọn A: "T" (ví dụ: {"key": "A", "text": "T"})
  (Tức là không viết nguyên chữ "True"/"False" hay "Đúng"/"Sai" ở phần text của options).

Yêu cầu cấu trúc và biểu điểm bắt buộc:
${examStructureRules}

Yêu cầu nội dung:
- Các câu hỏi từ vựng phải thật ngắn gọn để toàn bộ câu hỏi và đáp án có thể hiển thị trên cùng 1 dòng.
- Khối lớp: ${grade} (Global Success)
- Loại đề: ${examType}
- Thời gian làm bài: ${adminInfo?.durationMinutes || 45} phút
- Phạm vi kiến thức kiểm tra (Units): ${selectedUnits.join(', ')}
- Trường: ${adminInfo?.schoolName || 'TRƯỜNG THCS NGUYỄN DU'}
- Giáo viên ra đề: ${adminInfo?.teacherName || 'Giáo viên Tiếng Anh'}
${customPrompt ? `- Yêu cầu bổ sung của giáo viên: ${customPrompt}` : ''}
${templateContext}

Tất cả câu hỏi Tiếng Anh phải chuẩn ngữ pháp, tự nhiên, bám sát các từ vựng và chủ điểm ngữ pháp của các Unit được chọn. Hướng dẫn chấm bằng Tiếng Việt rõ ràng.`;

    // Response Schema Definition
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        matrix: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              skill: { type: Type.STRING },
              subSkill: { type: Type.STRING },
              cognitionLevel: { type: Type.STRING },
              questionType: { type: Type.STRING },
              questionCount: { type: Type.NUMBER },
              points: { type: Type.NUMBER },
            },
            required: ['id', 'skill', 'subSkill', 'cognitionLevel', 'questionType', 'questionCount', 'points'],
          },
        },
        specifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              skill: { type: Type.STRING },
              knowledgeUnit: { type: Type.STRING },
              performanceIndicator: { type: Type.STRING },
              recognitionCount: { type: Type.NUMBER },
              comprehensionCount: { type: Type.NUMBER },
              applicationCount: { type: Type.NUMBER },
              highApplicationCount: { type: Type.NUMBER },
              totalQuestions: { type: Type.NUMBER },
              totalPoints: { type: Type.NUMBER },
            },
            required: ['id', 'skill', 'knowledgeUnit', 'performanceIndicator', 'recognitionCount', 'comprehensionCount', 'applicationCount', 'highApplicationCount', 'totalQuestions', 'totalPoints'],
          },
        },
        audioScript: { type: Type.STRING },
        sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              instructions: { type: Type.STRING },
              readingPassage: { type: Type.STRING },
              audioScript: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    section: { type: Type.STRING },
                    partTitle: { type: Type.STRING },
                    cognitionLevel: { type: Type.STRING },
                    type: { type: Type.STRING },
                    prompt: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          key: { type: Type.STRING },
                          text: { type: Type.STRING },
                        },
                        required: ['key', 'text'],
                      },
                    },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    points: { type: Type.NUMBER },
                  },
                  required: ['id', 'section', 'cognitionLevel', 'type', 'prompt', 'correctAnswer', 'explanation', 'points'],
                },
              },
            },
            required: ['title', 'instructions', 'questions'],
          },
        },
        writingMarkScheme: { type: Type.STRING },
      },
      required: ['matrix', 'specifications', 'audioScript', 'sections', 'writingMarkScheme'],
    };

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const preferredModel = selectedModel || 'gemini-3-flash-preview';
    const fallbackModels = [
      'gemini-2.5-flash',
      'gemini-3-flash-preview',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro'
    ];
    const modelsToTry = [preferredModel, ...fallbackModels.filter(m => m !== preferredModel)];

    let response = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Vercel Serverless] Attempting generation with model: ${modelName}`);
        response = await generateContentWithRetry(ai, modelName, {
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.2,
          },
        });
        if (response) {
          console.log(`[Vercel Serverless] Generation succeeded with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.error(`[Vercel Serverless] Failed with model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      const isQuotaError =
        lastError?.status === 'RESOURCE_EXHAUSTED' ||
        lastError?.code === 429 ||
        (lastError?.message && (lastError.message.includes('429') || lastError.message.includes('Quota exceeded') || lastError.message.includes('RESOURCE_EXHAUSTED')));

      let errMessage = lastError?.message || 'Không nhận được phản hồi từ hệ thống AI.';
      if (isQuotaError) {
        errMessage = 'API Key của bạn đã hết hạn ngạch (Quota Exceeded) hoặc bị giới hạn lượt dùng trong ngày. Vui lòng lấy một API key của tài khoản Gmail khác tại https://aistudio.google.com/api-keys để thay thế hoặc thử lại sau.';
      }
      return res.status(500).json({ success: false, error: errMessage });
    }

    const generatedData = JSON.parse(response.text);

    // Assemble Code 001 Exam Paper
    let qNum = 1;
    const answerKey = generatedData.sections.flatMap((sec: any) =>
      sec.questions.map((q: any) => ({
        questionNumber: qNum++,
        sectionTitle: sec.title,
        answer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
      }))
    );

    const paperCode001 = {
      code: '001',
      adminInfo: {
        schoolName: adminInfo?.schoolName || 'TRƯỜNG THCS NGUYỄN DU',
        className: adminInfo?.className || `${grade}A1`,
        academicYear: adminInfo?.academicYear || '2025 - 2026',
        teacherName: adminInfo?.teacherName || 'Giáo viên Tiếng Anh',
        durationMinutes: adminInfo?.durationMinutes || 45,
        examDate: adminInfo?.examDate || new Date().toLocaleDateString('vi-VN'),
      },
      grade,
      examType,
      selectedUnits,
      audioScript: generatedData.audioScript,
      sections: generatedData.sections,
      answerKey,
      writingMarkScheme: generatedData.writingMarkScheme,
    };

    const totalQuestions = answerKey.length;
    const totalPoints = generatedData.matrix.reduce((acc: number, m: any) => acc + (m.points || 0), 0) || 10.0;
    const mcqCount = answerKey.filter((a: any) => a.answer && a.answer.length <= 2).length;
    const essayCount = totalQuestions - mcqCount;

    const fullSuite = {
      matrix: generatedData.matrix,
      specifications: generatedData.specifications,
      papers: [paperCode001],
      summary: {
        totalQuestions,
        totalPoints: Number(totalPoints.toFixed(1)),
        mcqCount,
        essayCount,
        timeMinutes: adminInfo?.durationMinutes || 45,
        recognitionRatio: 40,
        comprehensionRatio: 30,
        applicationRatio: 20,
        highApplicationRatio: 10,
      },
    };

    return res.status(200).json({ success: true, data: fullSuite });

  } catch (error: any) {
    console.error('[Vercel Serverless] Top level error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Lỗi xử lý serverless. Vui lòng thử lại.',
    });
  }
}
