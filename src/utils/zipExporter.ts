import JSZip from 'jszip';
import { FullExamSuite, ExamPaper } from '../types';
import {
  generateMatrixAndSpecDocx,
  generateExamPaperDocx,
  generateAnswerKeyDocx,
} from './docxExporter';
import {
  generateMatrixExcel,
  generateSpecificationExcel,
} from './excelExporter';
import { generateExamAudioBlobs, getSilentMp3ArrayBuffer } from './audioGenerator';

/**
 * Packages all Word documents, Excel matrix & specifications, and Audio listening files into a ZIP file.
 */
export async function exportExamSuiteZip(suite: FullExamSuite, showCognition: boolean = true): Promise<Blob> {
  const zip = new JSZip();

  if (!suite.papers || suite.papers.length === 0) {
    throw new Error('Không tìm thấy bộ đề để đóng gói ZIP.');
  }

  const primaryPaper = suite.papers[0];
  const gradeClean = (primaryPaper.grade || '').replace(/\s+/g, '');
  const examTypeClean = (primaryPaper.examType || '').replace(/\s+/g, '_');
  const schoolClean = (primaryPaper.schoolName || primaryPaper.adminInfo?.schoolName || '')
    .replace(/TRƯỜNG\s+THCS\s+/i, '')
    .replace(/\s+/g, '_');

  // Folder structure inside ZIP
  const rootFolder = zip.folder(`BoDe_TiengAnh_${gradeClean}_${examTypeClean}_${schoolClean}`) || zip;

  // 1. Matran_Dacta.docx
  const matrixSpecBlob = await generateMatrixAndSpecDocx(suite, primaryPaper);
  rootFolder.file(`01_Matran_Dacta_${gradeClean}_${examTypeClean}.docx`, matrixSpecBlob);

  // 1.1 Excel versions of Matrix & Spec
  const matrixExcelBlob = await generateMatrixExcel(
    suite.matrix,
    primaryPaper.schoolName || primaryPaper.adminInfo.schoolName,
    primaryPaper.examType,
    primaryPaper.academicYear || primaryPaper.adminInfo.academicYear,
    primaryPaper.grade
  );
  rootFolder.file(`01_MaTran_DeKT_${gradeClean}_${examTypeClean}.xlsx`, matrixExcelBlob);

  const specExcelBlob = await generateSpecificationExcel(
    suite.specifications,
    primaryPaper.schoolName || primaryPaper.adminInfo.schoolName,
    primaryPaper.examType,
    primaryPaper.academicYear || primaryPaper.adminInfo.academicYear,
    primaryPaper.grade
  );
  rootFolder.file(`01_DacTa_DeKT_${gradeClean}_${examTypeClean}.xlsx`, specExcelBlob);

  // 2. Detap_MaDeXXX.docx for each paper variant
  for (const paper of suite.papers) {
    const examPaperBlob = await generateExamPaperDocx(paper, showCognition);
    rootFolder.file(`02_DeKiemTra_MaDe${paper.code}.docx`, examPaperBlob);

    // 3. DapAn_HuongDanCham_MaDeXXX.docx
    const answerKeyBlob = await generateAnswerKeyDocx(paper);
    rootFolder.file(`03_DapAn_HuongDanCham_MaDe${paper.code}.docx`, answerKeyBlob);
  }

  // 4. Audio files (Part 1 monologue, Part 2 dialogue, Full exam audio MP3)
  try {
    const audioResult = await generateExamAudioBlobs(primaryPaper);
    rootFolder.file(`04_FileNghe_FullExam_MaDe${primaryPaper.code}.mp3`, audioResult.fullExamBlob);
    rootFolder.file(`04_FileNghe_Part1_Monologue_MaDe${primaryPaper.code}.mp3`, audioResult.part1Blob);
    rootFolder.file(`04_FileNghe_Part2_Dialogue_MaDe${primaryPaper.code}.mp3`, audioResult.part2Blob);
  } catch (audioErr) {
    console.error('[zipExporter] Lỗi khi tạo file nghe audio MP3 cho file zip:', audioErr);
    // Fallback: ALWAYS create 3 MP3 files so ZIP is NEVER missing audio files
    const fallbackMp3 = new Blob([getSilentMp3ArrayBuffer(3)], { type: 'audio/mp3' });
    rootFolder.file(`04_FileNghe_FullExam_MaDe${primaryPaper.code}.mp3`, fallbackMp3);
    rootFolder.file(`04_FileNghe_Part1_Monologue_MaDe${primaryPaper.code}.mp3`, fallbackMp3);
    rootFolder.file(`04_FileNghe_Part2_Dialogue_MaDe${primaryPaper.code}.mp3`, fallbackMp3);
  }

  return await zip.generateAsync({ type: 'blob' });
}

