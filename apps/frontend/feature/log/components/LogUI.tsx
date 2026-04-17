"use client";

import { AiOutlineFileExcel } from "react-icons/ai";
import { FaRegCalendarPlus } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { Input } from "@/components/atoms/input";
import IconButton from "@/components/molecules/iconButton";
import { DateRange } from "@/components/organisms/dateRange";
import TableComponent from "@/components/organisms/table";
import { COLOR_THEME } from "@/constants/system";
import { GetLogsType } from "@/types/data";
import { LOG_ITEMS_PER_PAGE, LOG_TABLE_HEADERS } from "../constants";
import { LogUIProps } from "../types";
import { useLogPage } from "../hooks/useLogPage";

export const LogUI = ({ initialData }: LogUIProps) => {
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
    handleGetExcelData,
    handleSearch,
    handleAddLog,
    handleDeleteLog,
    handleEditLog,
    handleViewLog,
  } = useLogPage(initialData);

  return (
    <div
      className="flex h-full w-full flex-col gap-5 pt-2"
      style={{ height: "calc(100vh - 140px)" }}
    >
      <div className="flex justify-between gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-wrap items-center gap-2"
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
            width="200px"
          />

          <IconButton
            icon={IoIosSearch}
            onClick={handleSearch}
            className="h-6 w-6 rounded-full"
            bgColor={COLOR_THEME.BG_COLOR}
            color={COLOR_THEME.DARK_GRAY}
            tooltip="검색"
            type="submit"
          />
        </form>

        <div className="flex gap-2">
          <div className="hidden sm:block">
            <IconButton
              icon={AiOutlineFileExcel}
              onClick={handleGetExcelData}
              className="h-8 w-8 rounded-full"
              tooltip={excelLoading ? "다운로드 중..." : "엑셀 다운로드"}
              size={17}
              bgColor={excelLoading ? "#6b7280" : "#10b981"}
              color="white"
              disabled={excelLoading}
            />
          </div>

          <IconButton
            icon={FaRegCalendarPlus}
            onClick={handleAddLog}
            className="h-8 w-8 rounded-full"
            tooltip="새 로그추가"
            size={17}
          />
        </div>
      </div>

      <div className="mb-2 flex gap-4 text-sm text-gray-500">
        <span>
          표시 중: {displayedData?.length || 0} / {allData?.length || 0} 개
        </span>

        {searchedTitle.trim() && (
          <span className="text-sm text-blue-500">
            &quot;{searchedTitle}&quot; 검색 결과
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <TableComponent<GetLogsType>
          data={displayedData}
          isLoading={loading}
          headers={LOG_TABLE_HEADERS}
          onDelete={handleDeleteLog}
          onEdit={handleEditLog}
          onClick={handleViewLog}
        />
      </div>

      {hasMoreData && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-gray-500" />
              <span>더 많은 데이터 로딩 중...</span>
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              스크롤하여 더 많은 데이터 보기
            </div>
          )}
        </div>
      )}

      {!hasMoreData &&
        displayedData &&
        displayedData.length > LOG_ITEMS_PER_PAGE && (
          <div className="py-4 text-center text-sm text-gray-400">
            모든 데이터를 불러왔습니다.
          </div>
        )}
    </div>
  );
};
