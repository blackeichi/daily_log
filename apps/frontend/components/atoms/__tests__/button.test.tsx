import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../button";

describe("Button 컴포넌트 테스트", () => {
  const mockOnClick = jest.fn();

  // beforeEach 훅을 추가하여 각 테스트마다 mock을 초기화
  beforeEach(() => {
    mockOnClick.mockClear();
  });

  // 1. 기본 렌더링 테스트
  it("텍스트와 아이콘이 올바르게 렌더링되어야 한다", () => {
    render(
      <Button
        text="확인"
        icon={<span data-testid="icon" />}
        onClick={mockOnClick}
      />,
    );

    expect(screen.getByText("확인")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  // 2. 클릭 이벤트 테스트
  it("클릭 시 onClick 함수가 호출되어야 한다", () => {
    render(<Button text="클릭" onClick={mockOnClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // 3. 비활성화 상태 테스트
  it("disabled 상태일 때 클릭되지 않아야 한다", () => {
    render(<Button text="비활성" onClick={mockOnClick} disabled />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  // 4. 로딩 상태 테스트
  it("isLoading이 true일 때 로더가 보이고 버튼이 비활성화되어야 한다", () => {
    render(<Button text="저장" isLoading onClick={mockOnClick} />);

    // 로더 확인 (ClipLoader의 aria-label 기준)
    expect(screen.getByLabelText("Loading Button")).toBeInTheDocument();
    // 텍스트는 보이지 않아야 함
    expect(screen.queryByText("저장")).not.toBeInTheDocument();
    // 버튼은 비활성화 상태여야 함
    expect(screen.getByRole("button")).toBeDisabled();
  });

  // 5. 동적 스타일 적용 테스트
  it("전달된 width와 height가 스타일에 적용되어야 한다", () => {
    render(
      <Button text="스타일" width={200} height={50} onClick={mockOnClick} />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveStyle({
      width: "200px",
      height: "50px",
    });
  });
});
