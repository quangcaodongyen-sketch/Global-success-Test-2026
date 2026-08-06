import mammoth from 'mammoth';
import { TemplateFileData, Grade, ExamType } from '../types';

/**
 * Parses uploaded text or docx files using mammoth to extract clean text and detect metadata.
 */
export async function parseTemplateFile(file: File): Promise<TemplateFileData> {
  const name = file.name;
  let type: 'matrix' | 'specification' | 'sample_exam' = 'sample_exam';

  const lowerName = name.toLowerCase();
  if (lowerName.includes('matran') || lowerName.includes('ma_tran') || lowerName.includes('matrix')) {
    type = 'matrix';
  } else if (lowerName.includes('dacta') || lowerName.includes('dac_ta') || lowerName.includes('spec')) {
    type = 'specification';
  }

  let textContent = '';
  try {
    if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      textContent = result.value || '';
    } else {
      textContent = await file.text();
    }
  } catch (err) {
    console.error('Error parsing file with mammoth:', err);
    try {
      textContent = await file.text();
    } catch {
      textContent = `Tệp tin: ${file.name}`;
    }
  }

  // Auto-detect ExamType from file name and extracted text
  let detectedExamType: ExamType | undefined;
  const combinedText = (lowerName + ' ' + textContent).toLowerCase();

  if (combinedText.includes('15 phút') || combinedText.includes('15phut') || combinedText.includes('15 m') || combinedText.includes('thường xuyên')) {
    detectedExamType = '15 phút';
  } else if (
    combinedText.includes('giữa kỳ 1') ||
    combinedText.includes('giữa học kỳ 1') ||
    combinedText.includes('giữa kỳ i') ||
    combinedText.includes('giữa học kỳ i') ||
    combinedText.includes('midterm 1') ||
    combinedText.includes('gk1')
  ) {
    detectedExamType = 'Giữa kỳ 1';
  } else if (
    combinedText.includes('giữa kỳ 2') ||
    combinedText.includes('giữa học kỳ 2') ||
    combinedText.includes('giữa kỳ ii') ||
    combinedText.includes('giữa học kỳ ii') ||
    combinedText.includes('midterm 2') ||
    combinedText.includes('gk2')
  ) {
    detectedExamType = 'Giữa kỳ 2';
  } else if (
    combinedText.includes('cuối kỳ 1') ||
    combinedText.includes('học kỳ 1') ||
    combinedText.includes('học kỳ i') ||
    combinedText.includes('cuối học kỳ i') ||
    combinedText.includes('ck1')
  ) {
    detectedExamType = 'Cuối kỳ 1';
  } else if (
    combinedText.includes('cuối kỳ 2') ||
    combinedText.includes('học kỳ 2') ||
    combinedText.includes('học kỳ ii') ||
    combinedText.includes('cuối học kỳ ii') ||
    combinedText.includes('ck2')
  ) {
    detectedExamType = 'Cuối kỳ 2';
  }

  // Auto-detect Grade from file name and text
  let detectedGrade: Grade | undefined;
  if (combinedText.includes('lớp 6') || combinedText.includes('tiếng anh 6') || combinedText.includes('grade 6')) {
    detectedGrade = 'Lớp 6';
  } else if (combinedText.includes('lớp 7') || combinedText.includes('tiếng anh 7') || combinedText.includes('grade 7')) {
    detectedGrade = 'Lớp 7';
  } else if (combinedText.includes('lớp 8') || combinedText.includes('tiếng anh 8') || combinedText.includes('grade 8')) {
    detectedGrade = 'Lớp 8';
  } else if (combinedText.includes('lớp 9') || combinedText.includes('tiếng anh 9') || combinedText.includes('grade 9')) {
    detectedGrade = 'Lớp 9';
  }

  return {
    name,
    type,
    content: textContent,
    uploadDate: new Date().toLocaleDateString('vi-VN'),
    detectedExamType,
    detectedGrade,
  };
}
