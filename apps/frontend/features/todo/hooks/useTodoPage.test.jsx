import { act, renderHook } from "@testing-library/react";
import { useTodo } from "./useTodoPage";

const mockConfirm = jest.fn();
const mockError = jest.fn();
const mockAlert = jest.fn();
const mockRefetch = jest.fn();
const mockMutate = jest.fn();
jest.mock("jotai", () => ({
  useSetAtom: (atom) =>
    atom === "confirm" ? mockConfirm : atom === "error" ? mockError : mockAlert,
}));
jest.mock("@/lib/atom", () => ({
  confirmAtom: "confirm",
  errorAtom: "error",
  alertAtom: "alert",
}));
jest.mock("@/lib/hooks/useTodos", () => ({
  useTodoVersion: () => ({ isFetchedAfterMount: false }),
  useServerTodos: () => ({ refetch: mockRefetch, isFetching: false }),
  useSyncTodos: () => ({ mutate: mockMutate, isPending: false }),
}));
const original = {
  id: 1,
  revision: 3,
  updatedAt: "2026-11-12T00:00:00Z",
  todayList: [{ id: 10, text: "task", isDone: false }],
  weekList: [],
  monthList: [],
  yearList: [],
  breakLimitList: [],
};
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem(
    "DAILY_LOG_TODOS_V1",
    JSON.stringify({ data: original, updatedAt: original.updatedAt }),
  );
});
it("persists pending deletions before upload and retains them on failure", () => {
  const { result } = renderHook(() => useTodo());
  act(() => result.current.handleUpdateList("todayList", []));
  act(() => result.current.handleUploadTodos());
  act(() => mockConfirm.mock.calls[0][0].confirmEvent());
  expect(
    JSON.parse(localStorage.getItem("DAILY_LOG_TODOS_V1")).data.todayList,
  ).toEqual([]);
  act(() => {
    mockMutate.mock.calls[0][1].onError(new Error("offline"));
    mockMutate.mock.calls[0][1].onSettled();
  });
  expect(result.current.data?.todayList).toEqual([]);
  expect(mockError).toHaveBeenCalledWith("offline");
});
it("does not let edits or duplicate requests race an upload", () => {
  const { result } = renderHook(() => useTodo());
  act(() => result.current.handleUploadTodos());
  act(() => mockConfirm.mock.calls[0][0].confirmEvent());
  act(() => {
    result.current.handleUpdateList("todayList", []);
    mockConfirm.mock.calls[0][0].confirmEvent();
  });
  expect(result.current.data?.todayList).toEqual(original.todayList);
  expect(mockMutate).toHaveBeenCalledTimes(1);
});
it("never restores stale cached data after a failed server fetch", async () => {
  mockRefetch.mockResolvedValue({
    isError: true,
    error: new Error("offline"),
    data: { ...original, todayList: [] },
  });
  const { result } = renderHook(() => useTodo());
  act(() => result.current.handleDownloadTodos());
  await act(async () => {
    mockConfirm.mock.calls[0][0].confirmEvent();
  });
  expect(result.current.data?.todayList).toEqual(original.todayList);
  expect(mockError).toHaveBeenCalledWith("offline");
});
it("keeps a recoverable local copy when downloading server data", async () => {
  mockRefetch.mockResolvedValue({
    isError: false,
    data: { ...original, revision: 4, todayList: [] },
  });
  const { result } = renderHook(() => useTodo());
  act(() => result.current.handleDownloadTodos());
  await act(async () => {
    mockConfirm.mock.calls[0][0].confirmEvent();
  });
  expect(result.current.data?.revision).toBe(4);
  act(() => result.current.handleRestoreLocalTodos());
  expect(result.current.data?.todayList).toEqual(original.todayList);
  expect(result.current.data?.revision).toBe(3);
});
