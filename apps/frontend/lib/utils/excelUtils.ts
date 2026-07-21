import * as XLSX from "xlsx";
import type { GetLogExcelData, GetTodosType } from "@/types/api";

const TODO_LISTS: Array<{
  key: keyof Pick<
    GetTodosType,
    "todayList" | "weekList" | "monthList" | "yearList" | "breakLimitList"
  >;
  label: string;
}> = [
  { key: "todayList", label: "오늘 할 일" },
  { key: "weekList", label: "이번 주 할 일" },
  { key: "monthList", label: "이번 달 할 일" },
  { key: "yearList", label: "올해 할 일" },
  { key: "breakLimitList", label: "한계돌파/정화의식" },
];

export const downloadExcel = (data: GetLogExcelData, filename?: string) => {
  try {
    // 엑셀에 표시할 데이터 형식으로 변환
    const excelData = data.logs.map((log, index) => ({
      번호: index + 1,
      날짜: log.logDate,
      제목: log.title,
      점수: log.score ?? "-",
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
      { wch: 8 }, // 점수
      ...Object.keys(data.logs[0]?.todayLog || {}).map(() => ({ wch: 50 })), // todayLog의 각 키에 대한 너비
    ];
    worksheet["!cols"] = columnWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, "일일 로그");

    const todoData = TODO_LISTS.flatMap(({ key, label }) =>
      (data.todos?.[key] ?? []).map((todo, index) => {
        const isSection = todo.type === "section";

        return {
          목록: label,
          순서: index + 1,
          유형: isSection ? "구분" : "할 일",
          내용: todo.text,
          완료: isSection ? "-" : todo.isDone ? "완료" : "미완료",
          잠금: isSection ? "-" : todo.isDisabled ? "잠금" : "활성",
        };
      }),
    );
    const todoWorksheet = XLSX.utils.json_to_sheet(todoData, {
      header: ["목록", "순서", "유형", "내용", "완료", "잠금"],
    });
    todoWorksheet["!cols"] = [
      { wch: 20 },
      { wch: 8 },
      { wch: 10 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(workbook, todoWorksheet, "투두 목록");

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
