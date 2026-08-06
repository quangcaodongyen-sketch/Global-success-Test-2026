import { MatrixItem, SpecificationItem } from '../types';

// Helper to download a blob client-side
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate Excel (as styled HTML Spreadsheet) for MOET Matrix
export function generateMatrixExcel(
  matrix: MatrixItem[],
  schoolName: string,
  examType: string,
  academicYear: string
): Blob {
  const rows = matrix.map((item, idx) => `
    <tr style="height: 25px;">
      <td style="text-align: center; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt;">${idx + 1}</td>
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt;"><b>${item.skill}</b></td>
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt;">${item.subSkill}</td>
      <td style="text-align: center; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt;">${item.cognitionLevel}</td>
      <td style="text-align: center; font-weight: bold; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt;">${item.questionCount}</td>
      <td style="text-align: center; font-weight: bold; color: #1D4ED8; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt;">${item.points.toFixed(1)}đ</td>
    </tr>
  `).join('');

  const totalQuestions = matrix.reduce((sum, item) => sum + item.questionCount, 0);
  const totalPoints = matrix.reduce((sum, item) => sum + item.points, 0);

  const html = `
    <table>
      <thead>
        <tr>
          <th colspan="6" style="font-size: 16pt; font-family: 'Times New Roman'; font-weight: bold; text-align: center; height: 40px;">MA TRẬN ĐỀ KIỂM TRA ĐÁNH GIÁ TIẾNG ANH</th>
        </tr>
        <tr>
          <th colspan="6" style="font-size: 11pt; font-family: 'Times New Roman'; text-align: center; height: 35px; font-style: italic;">
            Trường: ${schoolName} | Loại bài: ${examType} | Năm học: ${academicYear}
          </th>
        </tr>
        <tr style="height: 30px; background-color: #E2E8F0;">
          <th style="width: 50px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">STT</th>
          <th style="width: 180px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">Kỹ Năng / Mạch Kiến Thức</th>
          <th style="width: 250px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">Dạng Bài / Dạng Câu Hỏi</th>
          <th style="width: 140px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">Mức Độ Nhận Thức</th>
          <th style="width: 80px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">Số Câu</th>
          <th style="width: 100px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">Tổng Điểm</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="background-color: #F8FAFC; font-weight: bold; height: 30px;">
          <td colspan="4" style="text-align: right; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; padding-right: 10px;">TỔNG CỘNG:</td>
          <td style="text-align: center; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt;">${totalQuestions} câu</td>
          <td style="text-align: center; color: #1D4ED8; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt;">${totalPoints.toFixed(1)} điểm</td>
        </tr>
      </tbody>
    </table>
  `;

  return buildExcelBlob(html, 'Ma Trận Đề Thi');
}

// Generate Excel for MOET Specification
export function generateSpecificationExcel(
  specifications: SpecificationItem[],
  schoolName: string,
  examType: string,
  academicYear: string
): Blob {
  const rows = specifications.map((item) => `
    <tr style="height: 35px; vertical-align: top;">
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 10.5pt; font-weight: bold; padding: 5px;">${item.skill}</td>
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 10.5pt; padding: 5px;">${item.knowledgeUnit}</td>
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 10.5pt; padding: 5px; text-align: justify;">${item.performanceIndicator}</td>
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 10.5pt; text-align: center; padding: 5px;">${item.recognitionCount > 0 ? `${item.recognitionCount} câu` : '-'}</td>
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 10.5pt; text-align: center; padding: 5px;">${item.comprehensionCount > 0 ? `${item.comprehensionCount} câu` : '-'}</td>
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 10.5pt; text-align: center; padding: 5px;">${item.applicationCount > 0 ? `${item.applicationCount} câu` : '-'}</td>
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 10.5pt; text-align: center; padding: 5px;">${item.highApplicationCount > 0 ? `${item.highApplicationCount} câu` : '-'}</td>
      <td style="border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 10.5pt; text-align: center; font-weight: bold; background-color: #F8FAFC; padding: 5px;">${item.totalQuestions} câu<br>(${item.totalPoints.toFixed(1)}đ)</td>
    </tr>
  `).join('');

  const html = `
    <table>
      <thead>
        <tr>
          <th colspan="8" style="font-size: 16pt; font-family: 'Times New Roman'; font-weight: bold; text-align: center; height: 40px;">BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐÁNH GIÁ MÔN TIẾNG ANH</th>
        </tr>
        <tr>
          <th colspan="8" style="font-size: 11pt; font-family: 'Times New Roman'; text-align: center; height: 35px; font-style: italic;">
            Trường: ${schoolName} | Loại bài: ${examType} | Năm học: ${academicYear}
          </th>
        </tr>
        <tr style="height: 30px; background-color: #E2E8F0;">
          <th style="width: 120px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">Kỹ năng</th>
          <th style="width: 160px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">Chủ đề / Đơn vị kiến thức</th>
          <th style="width: 320px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">Yêu cầu cần đạt</th>
          <th style="width: 90px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center; background-color: #DBEAFE;">Nhận biết</th>
          <th style="width: 90px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center; background-color: #D1FAE5;">Thông hiểu</th>
          <th style="width: 90px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center; background-color: #FEF3C7;">Vận dụng</th>
          <th style="width: 90px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center; background-color: #FEE2E2;">Vận dụng cao</th>
          <th style="width: 100px; border: 1px solid #000000; font-family: 'Times New Roman'; font-size: 11pt; font-weight: bold; text-align: center;">Tổng cộng</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  return buildExcelBlob(html, 'Đặc Tả Đề Thi');
}

// Common function to wrap HTML string into real Excel content
function buildExcelBlob(htmlContent: string, worksheetName: string): Blob {
  const template = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:x="urn:schemas-microsoft-com:office:excel" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${worksheetName}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #000000; padding: 6px; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
  return new Blob([template], { type: 'application/vnd.ms-excel;charset=utf-8' });
}
