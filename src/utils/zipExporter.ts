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

/**
 * Packages all Word documents into a ZIP file following Decree 30/2020/NĐ-CP
 * administrative formatting and MOET exam filing rules.
 */
export async function exportExamSuiteZip(suite: FullExamSuite): Promise<Blob> {
  const zip = new JSZip();

  if (!suite.papers || suite.papers.length === 0) {
    throw new Error('Không tìm thấy bộ đề để đóng gói ZIP.');
  }

  const primaryPaper = suite.papers[0];
  const gradeClean = primaryPaper.grade.replace(/\s+/g, '');
  const examTypeClean = primaryPaper.examType.replace(/\s+/g, '_');
  const schoolClean = primaryPaper.adminInfo.schoolName
    .replace(/TRƯỜNG\s+THCS\s+/i, '')
    .replace(/\s+/g, '_');

  // Folder structure inside ZIP
  const rootFolder = zip.folder(`BoDe_TiengAnh_${gradeClean}_${examTypeClean}_${schoolClean}`) || zip;

  // 1. Matran_Dacta.docx
  const matrixSpecBlob = await generateMatrixAndSpecDocx(suite, primaryPaper);
  rootFolder.file(`01_Matran_Dacta_${gradeClean}_${examTypeClean}.docx`, matrixSpecBlob);

  // 1.1 Excel versions of Matrix & Spec
  const matrixExcelBlob = generateMatrixExcel(
    suite.matrix,
    primaryPaper.schoolName || primaryPaper.adminInfo.schoolName,
    primaryPaper.examType,
    primaryPaper.academicYear || primaryPaper.adminInfo.academicYear
  );
  rootFolder.file(`01_MaTran_DeKT_${gradeClean}_${examTypeClean}.xls`, matrixExcelBlob);

  const specExcelBlob = generateSpecificationExcel(
    suite.specifications,
    primaryPaper.schoolName || primaryPaper.adminInfo.schoolName,
    primaryPaper.examType,
    primaryPaper.academicYear || primaryPaper.adminInfo.academicYear
  );
  rootFolder.file(`01_DacTa_DeKT_${gradeClean}_${examTypeClean}.xls`, specExcelBlob);

  // 2. Detap_MaDeXXX.docx for each paper variant
  for (const paper of suite.papers) {
    const examPaperBlob = await generateExamPaperDocx(paper);
    rootFolder.file(`02_DeKiemTra_MaDe${paper.code}.docx`, examPaperBlob);

    // 3. DapAn_HuongDanCham_MaDeXXX.docx
    const answerKeyBlob = await generateAnswerKeyDocx(paper);
    rootFolder.file(`03_DapAn_HuongDanCham_MaDe${paper.code}.docx`, answerKeyBlob);
  }

  // 4. Decree 30 Compliance Certificate / Cover Metadata
  const readmeContent = `====================================================================
HỒ SƠ BỘ ĐỀ KIỂM TRA MÔN TIẾNG ANH THCS (GLOBAL SUCCESS)
ĐÓNG GÓI CHUẨN NGHỊ ĐỊNH 30/2020/NĐ-CP & QUY ĐỊNH BỘ GIÁO DỤC VÀ ĐÀO TẠO
====================================================================

1. THÔNG TIN CHUNG:
- Đơn vị ra đề: ${primaryPaper.adminInfo.schoolName}
- Lớp: ${primaryPaper.adminInfo.className} (${primaryPaper.grade})
- Loại đề kiểm tra: ${primaryPaper.examType}
- Thời gian làm bài: ${primaryPaper.adminInfo.durationMinutes} phút
- Các Unit kiểm tra: ${primaryPaper.selectedUnits.join(', ')}
- Giáo viên ra đề: ${primaryPaper.adminInfo.teacherName}
- Năm học: ${primaryPaper.adminInfo.academicYear}
- Số lượng mã đề đã tạo: ${suite.papers.length} (Mã đề: ${suite.papers.map((p) => p.code).join(', ')})

2. THÀNH PHẦN HỒ SƠ TỆP NÉN:
- 01_Matran_Dacta_${gradeClean}_${examTypeClean}.docx : Bảng Ma trận & Bản đặc tả chi tiết dạng Word.
- 01_MaTran_DeKT_${gradeClean}_${examTypeClean}.xls : Ma trận đề kiểm tra dạng Excel.
- 01_DacTa_DeKT_${gradeClean}_${examTypeClean}.xls : Bản đặc tả đề kiểm tra dạng Excel.
${suite.papers.map((p) => `- 02_DeKiemTra_MaDe${p.code}.docx : Đề kiểm tra học sinh Mã đề ${p.code}.\n- 03_DapAn_HuongDanCham_MaDe${p.code}.docx : Đáp án & Hướng dẫn chấm Mã đề ${p.code}.`).join('\n')}

3. TIÊU CHUẨN THỂ THỨC VĂN BẢN (NGHỊ ĐỊNH 30/2020/NĐ-CP):
- Phông chữ: Times New Roman, cỡ chữ 14pt (hoặc 12-13pt đối với bảng biểu).
- Lề trang: Trên 20mm, Dưới 20mm, Trái 30mm, Phải 15mm.
- Quốc hiệu, Tiêu ngữ, Tên cơ quan ban hành, Tiêu đề đề thi & Khung điểm lời phê đúng quy chuẩn hành chính.
- Ma trận phân bổ tỷ lệ Nhận biết (${suite.summary.recognitionRatio}%), Thông hiểu (${suite.summary.comprehensionRatio}%), Vận dụng (${suite.summary.applicationRatio}%), Vận dụng cao (${suite.summary.highApplicationRatio}%).

Ngày đóng gói: ${new Date().toLocaleString('vi-VN')}
Ứng dụng: Công Cụ Sinh Đề Kiểm Tra Tiếng Anh THCS Global Success
`;

  rootFolder.file('DANH_MUC_HO_SO_NGHI_DINH_30.txt', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}
