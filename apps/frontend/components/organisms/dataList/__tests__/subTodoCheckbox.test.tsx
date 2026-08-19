import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import CheckBox from "@/components/atoms/checkBox";
import { DataList } from "..";
import { TodoDetailsModal } from "../DataListItem";
import { setChildTodoDone, type DataListItemType } from "../dataList";

const initialTodo: DataListItemType = {
  id: 1,
  text: "parent",
  isDone: false,
  description: "parent description",
  children: [
    { id: 2, text: "first child", isDone: false },
    { id: 3, text: "second child", isDone: false },
  ],
};

function SubTodoCheckboxes() {
  const [todo, setTodo] = useState(initialTodo);

  return (
    <>
      <output data-testid="parent-state">{String(todo.isDone)}</output>
      <output data-testid="parent-description">{todo.description}</output>
      {todo.children?.map((child, childIndex) => (
        <CheckBox
          key={child.id}
          id={`child-${child.id}`}
          value={child.isDone ?? false}
          setValue={(isDone) =>
            setTodo(setChildTodoDone(todo, childIndex, isDone))
          }
        >
          {child.text}
        </CheckBox>
      ))}
    </>
  );
}

describe("sub-todo checkbox interactions", () => {
  it("keeps earlier child changes when siblings are checked in sequence", () => {
    render(<SubTodoCheckboxes />);

    const firstChild = screen.getByLabelText("first child");
    const secondChild = screen.getByLabelText("second child");

    fireEvent.click(firstChild);
    fireEvent.click(secondChild);

    expect(firstChild).toBeChecked();
    expect(secondChild).toBeChecked();
    expect(screen.getByTestId("parent-state")).toHaveTextContent("true");
    expect(screen.getByTestId("parent-description")).toHaveTextContent(
      "parent description",
    );
  });

  it("unchecks the parent when one checked child is unchecked", () => {
    render(<SubTodoCheckboxes />);

    const firstChild = screen.getByLabelText("first child");
    const secondChild = screen.getByLabelText("second child");

    fireEvent.click(firstChild);
    fireEvent.click(secondChild);
    fireEvent.click(firstChild);

    expect(firstChild).not.toBeChecked();
    expect(secondChild).toBeChecked();
    expect(screen.getByTestId("parent-state")).toHaveTextContent("false");
  });
});

describe("todo details modal", () => {
  it("saves a parent description, title, and child description together", () => {
    const handleSave = jest.fn();

    render(
      <TodoDetailsModal
        item={initialTodo}
        isEditing
        onClose={jest.fn()}
        onSave={handleSave}
      />,
    );

    fireEvent.change(screen.getByLabelText("투두 내용"), {
      target: { value: "updated parent" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("상세한 설명, 참고 링크, 메모 등을 입력하세요."),
      { target: { value: "updated parent description" } },
    );
    fireEvent.change(screen.getByLabelText("first child 설명"), {
      target: { value: "first child description" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "updated parent",
        description: "updated parent description",
        children: expect.arrayContaining([
          expect.objectContaining({
            text: "first child",
            description: "first child description",
          }),
        ]),
      }),
      "current",
    );
  });

  it("allows description and child completion changes while keeping a locked todo otherwise read-only", () => {
    const handleSave = jest.fn();

    render(
      <TodoDetailsModal
        item={{ ...initialTodo, isDisabled: true }}
        isEditing={false}
        canEditDescription
        onClose={jest.fn()}
        onSave={handleSave}
      />,
    );

    expect(screen.queryByLabelText("투두 내용")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("하위 투두를 입력하세요")).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText("상세한 설명, 참고 링크, 메모 등을 입력하세요."),
      { target: { value: "locked todo description" } },
    );
    fireEvent.change(screen.getByLabelText("first child 설명"), {
      target: { value: "locked child description" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        text: initialTodo.text,
        description: "locked todo description",
        children: expect.arrayContaining([
          expect.objectContaining({
            text: "first child",
            description: "locked child description",
          }),
        ]),
      }),
      "current",
    );

    handleSave.mockClear();

    fireEvent.click(screen.getByLabelText("first child 완료 여부"));
    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        isDone: false,
        children: expect.arrayContaining([
          expect.objectContaining({ text: "first child", isDone: true }),
        ]),
      }),
      "current",
    );
  });

  it("moves a child todo with the ordering controls before saving", () => {
    const handleSave = jest.fn();

    render(
      <TodoDetailsModal
        item={initialTodo}
        isEditing
        onClose={jest.fn()}
        onSave={handleSave}
      />,
    );

    fireEvent.click(screen.getByLabelText("second child 위로 이동"));
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        children: [
          expect.objectContaining({ text: "second child" }),
          expect.objectContaining({ text: "first child" }),
        ],
      }),
      "current",
    );
  });
});

describe("todo list controls", () => {
  const renderTodoList = (defaultDataList: DataListItemType[] = []) => {
    const onDataListChange = jest.fn();
    render(
      <DataList
        title="Todo"
        name="오늘"
        defaultDataList={defaultDataList}
        onSaveDataList={jest.fn()}
        onDataListChange={onDataListChange}
        deferSave
        needCheckBox
        needDisableButton
        enableTodoDetails
      />,
    );
    return onDataListChange;
  };

  it("opens an add modal from the list header and creates a complete todo", () => {
    const onDataListChange = renderTodoList();

    fireEvent.click(screen.getByRole("button", { name: "투두 추가" }));
    fireEvent.change(screen.getByLabelText("투두 내용"), {
      target: { value: "new parent" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("상세한 설명, 참고 링크, 메모 등을 입력하세요."),
      { target: { value: "new description" } },
    );
    fireEvent.change(screen.getByPlaceholderText("하위 투두를 입력하세요"), {
      target: { value: "new child" },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    fireEvent.change(screen.getByLabelText("new child 설명"), {
      target: { value: "child description" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onDataListChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        text: "new parent",
        description: "new description",
        children: [
          expect.objectContaining({
            text: "new child",
            description: "child description",
          }),
        ],
      }),
    ]);
  });

  it("adds a section at the selected location", () => {
    const onDataListChange = renderTodoList([
      { id: 10, text: "morning", type: "section" },
      { id: 11, text: "mail", isDone: false, type: "todo" },
      { id: 12, text: "afternoon", type: "section" },
    ]);

    fireEvent.click(screen.getByRole("button", { name: "투두 추가" }));
    fireEvent.click(screen.getByRole("button", { name: "섹션" }));
    fireEvent.change(screen.getByLabelText("섹션 제목"), {
      target: { value: "evening" },
    });
    fireEvent.change(screen.getByLabelText("섹션 위치"), {
      target: { value: "section:10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onDataListChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 10 }),
      expect.objectContaining({ id: 11 }),
      expect.objectContaining({ text: "evening", type: "section" }),
      expect.objectContaining({ id: 12 }),
    ]);
  });

  it("moves a section and its grouped todos together", () => {
    const onDataListChange = renderTodoList([
      { id: 10, text: "morning", type: "section" },
      { id: 11, text: "mail", isDone: false, type: "todo" },
      { id: 12, text: "afternoon", type: "section" },
      { id: 13, text: "work", isDone: false, type: "todo" },
    ]);

    fireEvent.click(screen.getByText("morning"));
    fireEvent.change(screen.getByLabelText("섹션 위치"), {
      target: { value: "end" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onDataListChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 12 }),
      expect.objectContaining({ id: 13 }),
      expect.objectContaining({ id: 10 }),
      expect.objectContaining({ id: 11 }),
    ]);
  });

  it("moves a todo into the selected section from its detail modal", () => {
    const onDataListChange = renderTodoList([
      { id: 10, text: "morning", type: "section" },
      { id: 11, text: "mail", isDone: false, type: "todo" },
      { id: 12, text: "afternoon", type: "section" },
      { id: 13, text: "work", isDone: false, type: "todo" },
    ]);

    fireEvent.click(screen.getByText("work"));
    fireEvent.change(screen.getByLabelText("투두 위치"), {
      target: { value: "section:10" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onDataListChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 10 }),
      expect.objectContaining({ id: 11 }),
      expect.objectContaining({ id: 13 }),
      expect.objectContaining({ id: 12 }),
    ]);
  });

  it("copies a todo with its description and children", () => {
    const onDataListChange = renderTodoList([initialTodo]);

    fireEvent.click(screen.getByText("parent"));
    fireEvent.click(screen.getByRole("button", { name: "복사하기" }));

    expect(onDataListChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: initialTodo.id }),
      expect.objectContaining({
        text: initialTodo.text,
        description: initialTodo.description,
        children: expect.arrayContaining([
          expect.objectContaining({ text: "first child" }),
        ]),
      }),
    ]);
  });

  it("allows parent and child checkboxes to work even when the todo is locked", () => {
    const onDataListChange = renderTodoList([
      {
        ...initialTodo,
        isDisabled: true,
        children: [{ id: 2, text: "first child", isDone: false }],
      },
    ]);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeDisabled();
    expect(checkboxes[1]).not.toBeDisabled();

    fireEvent.click(checkboxes[0]);
    expect(onDataListChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        isDisabled: true,
        isDone: true,
        children: [expect.objectContaining({ isDone: true })],
      }),
    ]);

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    expect(onDataListChange).toHaveBeenLastCalledWith([
      expect.objectContaining({
        isDisabled: true,
        isDone: true,
        children: [expect.objectContaining({ isDone: true })],
      }),
    ]);
  });
});
