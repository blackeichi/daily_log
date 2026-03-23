"use client";

import IconButton from "@/app/components/molecules/iconButton";
import { DateRange } from "@/app/components/organisms/dateRange";
import TableComponent from "@/app/components/organisms/table";
import { COLOR_THEME } from "@/app/constants/system";
import { GetLogsType } from "@/app/types/data";
import { FaRegCalendarPlus } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { AiOutlineFileExcel } from "react-icons/ai";
import { Input } from "@/app/components/atoms/input";
import { useLog } from "./useLog";

const headers = [
  { id: "logDate", label: "날짜", width: 110 },
  { id: "title", label: "제목", width: 300 },
];

const ITEMS_PER_PAGE = 50;

export const LogUI = () => {
  const {
    loading,
    displayedData,
    allData,
    isLoadingMore,
    hasMoreData,
    loadMoreRef,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    searchTitle,
    setSearchTitle,
    searchedTitle,
    excelLoading,
    onGetExcelData,
    handleSearch,
    handleAddLog,
    handleDeleteLog,
    handleEditLog,
  } = useLog();

  return (
    <div className="flex flex-col gap-5 w-full pt-2" style={{ height: 'calc(100vh - 200px)' }}>
      <div className="flex justify-between gap-2">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex gap-2 items-center flex-wrap"
        >
          <DateRange
            fromPlaceholder="시작일"
            toPlaceholder="종료일"
            fromValue={startDate}
            setFromValue={setStartDate}
            toValue={endDate}
            setToValue={setEndDate}
          />
          <Input
            id="title-search"
            placeholder="제목을 검색해주세요."
            value={searchTitle}
            setValue={setSearchTitle}
            label="제목 검색"
            width={"200px"}
          />
          <IconButton
            icon={IoIosSearch}
            onClick={handleSearch}
            className="rounded-full w-6 h-6"
            bgColor={COLOR_THEME.BG_COLOR}
            color={COLOR_THEME.DARK_GRAY}
            tooltip="검색"
            type="submit"
          />
        </form>
        <div className="flex gap-2">
          <IconButton
            icon={AiOutlineFileExcel}
            onClick={() => onGetExcelData()}
            className="rounded-full w-8 h-8"
            tooltip={excelLoading ? "다운로드 중..." : "엑셀 다운로드"}
            size={17}
            bgColor={excelLoading ? "#6b7280" : "#10b981"}
            color="white"
            disabled={excelLoading}
          />
          <IconButton
            icon={FaRegCalendarPlus}
            onClick={handleAddLog}
            className="rounded-full w-8 h-8"
            tooltip="새 로그추가"
            size={17}
          />
        </div>
      </div>

      {/* 검색 결과 및 데이터 로딩 상태 표시 */}
      <div className="text-sm text-gray-500 mb-2 flex gap-4">
        <span>
          표시 중: {displayedData?.length || 0} / {allData?.length || 0} 개
        </span>
        {searchedTitle && searchedTitle.trim() && (
          <span className="text-blue-500 text-sm">
            &quot;{searchedTitle}&quot; 검색 결과
          </span>
        )}
      </div>
      <div className="flex-1 overflow-hidden min-h-0">
        <TableComponent<GetLogsType>
          data={displayedData}
          isLoading={loading}
          headers={headers}
          onDelete={handleDeleteLog}
          onClick={handleEditLog}
        />
      </div>

      {/* 무한 스크롤 트리거 및 로딩 표시 */}
      {hasMoreData && (
        <div
          ref={loadMoreRef}
          className="flex justify-center items-center py-8"
        >
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              <span>더 많은 데이터 로딩 중...</span>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">
              스크롤하여 더 많은 데이터 보기
            </div>
          )}
        </div>
      )}

      {/* 모든 데이터 로딩 완료 표시 */}
      {!hasMoreData &&
        displayedData &&
        displayedData.length > ITEMS_PER_PAGE && (
          <div className="text-center text-gray-400 text-sm py-4">
            모든 데이터를 불러왔습니다.
          </div>
        )}
    </div>
  );
};
