import JSZip from 'jszip';
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

// Helper to convert column index (0-based) to Excel letter
function getColumnLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

// Escape special XML characters
function escapeXml(unsafe: string): string {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Fallback basic sheet generator
async function buildXlsxFile(sheetDataRows: string[][]): Promise<Blob> {
  const zip = new JSZip();

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`;
  zip.file('[Content_Types].xml', contentTypesXml);

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  zip.file('_rels/.rels', relsXml);

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
  zip.file('xl/workbook.xml', workbookXml);

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;
  zip.file('xl/_rels/workbook.xml.rels', workbookRelsXml);

  let rowXml = '';
  sheetDataRows.forEach((row, rIdx) => {
    const rowNum = rIdx + 1;
    rowXml += `<row r="${rowNum}">`;
    row.forEach((val, cIdx) => {
      const colLetter = getColumnLetter(cIdx);
      const cellRef = `${colLetter}${rowNum}`;
      
      const isNum = val !== '' && !isNaN(Number(val)) && isFinite(Number(val));
      if (isNum) {
        rowXml += `<c r="${cellRef}" t="n"><v>${val}</v></c>`;
      } else {
        rowXml += `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
      }
    });
    rowXml += `</row>`;
  });

  const sheet1Xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${rowXml}
  </sheetData>
</worksheet>`;
  zip.file('xl/worksheets/sheet1.xml', sheet1Xml);

  return await zip.generateAsync({ type: 'blob' });
}

// Fallback Matrix
async function buildFallbackMatrixExcel(matrix: MatrixItem[], schoolName: string, examType: string, academicYear: string): Promise<Blob> {
  const data: string[][] = [
    [`MA TRẬN ĐỀ KIỂM TRA ĐÁNH GIÁ MÔN TIẾNG ANH`],
    [`Trường: ${schoolName} | Loại bài: ${examType} | Năm học: ${academicYear}`],
    [],
    [`STT`, `Kỹ Năng / Mạch Kiến Thức`, `Dạng Bài / Dạng Câu Hỏi`, `Mức Độ Nhận Thức`, `Số Câu`, `Tổng Điểm`]
  ];
  matrix.forEach((item, idx) => {
    data.push([String(idx + 1), item.skill, item.subSkill, item.cognitionLevel, String(item.questionCount), `${item.points.toFixed(1)}đ`]);
  });
  return await buildXlsxFile(data);
}

// Fallback Spec
async function buildFallbackSpecExcel(specifications: SpecificationItem[], schoolName: string, examType: string, academicYear: string): Promise<Blob> {
  const data: string[][] = [
    [`BẢN ĐẶC TẢ ĐỀ KIỂM TRA ĐÁNH GIÁ MÔN TIẾNG ANH`],
    [`Trường: ${schoolName} | Loại bài: ${examType} | Năm học: ${academicYear}`],
    [],
    [`Kỹ năng`, `Chủ đề / Đơn vị kiến thức`, `Yêu cầu cần đạt`, `Nhận biết`, `Thông hiểu`, `Vận dụng`, `Vận dụng cao`, `Tổng cộng`]
  ];
  specifications.forEach((item) => {
    data.push([item.skill, item.knowledgeUnit, item.performanceIndicator, item.recognitionCount > 0 ? `${item.recognitionCount} câu` : '-', item.comprehensionCount > 0 ? `${item.comprehensionCount} câu` : '-', item.applicationCount > 0 ? `${item.applicationCount} câu` : '-', item.highApplicationCount > 0 ? `${item.highApplicationCount} câu` : '-', `${item.totalQuestions} câu (${item.totalPoints.toFixed(1)}đ)`]);
  });
  return await buildXlsxFile(data);
}

// Generate real XLSX for Matrix by modifying the official Excel template directly
export async function generateMatrixExcel(
  matrix: MatrixItem[],
  schoolName: string,
  examType: string,
  academicYear: string,
  grade: string
): Promise<Blob> {
  const isFinal = examType.includes('Cuối kỳ');
  const templatePath = isFinal
    ? '/Tai lieu/Ma trận Đề KT CK môn TA cấp THCS.xlsx'
    : '/Tai lieu/Ma trận Đề KT GK  môn TA cấp THCS.xlsx';

  try {
    const res = await fetch(templatePath);
    if (!res.ok) throw new Error(`Không thể tải template: ${templatePath}`);
    const arrayBuffer = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Read and edit sharedStrings.xml
    let sharedStrings = await zip.file('xl/sharedStrings.xml')!.async('text');
    
    sharedStrings = sharedStrings
      .replace(/TRƯỜNG THCS ĐỒNG YÊN/g, schoolName.toUpperCase())
      .replace(/2026-2027/g, academicYear)
      .replace(/LỚP 8/g, grade.toUpperCase())
      .replace(/Giữa kì I/gi, examType)
      .replace(/GIỮA HỌC KÌ I/gi, examType.toUpperCase());

    zip.file('xl/sharedStrings.xml', sharedStrings);
    return await zip.generateAsync({ type: 'blob' });
  } catch (e) {
    console.error('Lỗi khi sửa template Excel Matrix:', e);
    return buildFallbackMatrixExcel(matrix, schoolName, examType, academicYear);
  }
}

// Generate real XLSX for Specification by modifying the official Excel template directly
export async function generateSpecificationExcel(
  specifications: SpecificationItem[],
  schoolName: string,
  examType: string,
  academicYear: string,
  grade: string
): Promise<Blob> {
  const isFinal = examType.includes('Cuối kỳ');
  const templatePath = isFinal
    ? '/Tai lieu/Đặc tả Đề KT CUỐI KỲ II TA 8. 2026.xlsx'
    : '/Tai lieu/Đặc tả Đề KT GKI TA 8.xlsx';

  try {
    const res = await fetch(templatePath);
    if (!res.ok) throw new Error(`Không thể tải template: ${templatePath}`);
    const arrayBuffer = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Read and edit sharedStrings.xml
    let sharedStrings = await zip.file('xl/sharedStrings.xml')!.async('text');
    
    sharedStrings = sharedStrings
      .replace(/TRƯỜNG THCS ĐỒNG YÊN/g, schoolName.toUpperCase())
      .replace(/2026-2027/g, academicYear)
      .replace(/LỚP 8/g, grade.toUpperCase())
      .replace(/Giữa kì I/gi, examType)
      .replace(/GIỮA HỌC KÌ I/gi, examType.toUpperCase());

    zip.file('xl/sharedStrings.xml', sharedStrings);
    return await zip.generateAsync({ type: 'blob' });
  } catch (e) {
    console.error('Lỗi khi sửa template Excel Spec:', e);
    return buildFallbackSpecExcel(specifications, schoolName, examType, academicYear);
  }
}
