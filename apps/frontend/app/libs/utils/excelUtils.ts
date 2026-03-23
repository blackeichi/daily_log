import * as XLSX from "xlsx";
import { GetLogsType } from "@/app/types/data";

export const downloadExcel = (data: GetLogsType[], filename?: string) => {
  try {
    // 엑셀에 표시할 데이터 형식으로 변환
    const excelData = data.map((log, index) => ({
      번호: index + 1,
      날짜: log.logDate,
      제목: log.title,
      ...log.todayLog,
    }));

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 8 }, // 번호
      { wch: 12 }, // 날짜
      { wch: 50 }, // 제목
      ...Object.keys(data[0]?.todayLog || {}).map(() => ({ wch: 50 })), // todayLog의 각 키에 대한 너비
    ];
    worksheet["!cols"] = columnWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, "일일 로그");

    // 파일명 생성 (기본값: 현재 날짜)
    const defaultFilename = `로그_${new Date().toISOString().split("T")[0]}`;
    const finalFilename = filename || defaultFilename;

    // 파일 다운로드
    XLSX.writeFile(workbook, `${finalFilename}.xlsx`);

    return true;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("엑셀 다운로드 중 오류 발생:", error);
    }
    return false;
  }
};
