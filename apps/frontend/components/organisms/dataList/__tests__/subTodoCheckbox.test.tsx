import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import CheckBox from "@/components/atoms/checkBox";
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
    expect(firstChild).toBeChecked();
    expect(secondChild).not.toBeChecked();
    expect(screen.getByTestId("parent-state")).toHaveTextContent("false");

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

describe("parent todo details", () => {
  it("saves a parent description while keeping its child todos", () => {
    const handleSave = jest.fn();

    render(
      <TodoDetailsModal
        item={initialTodo}
        isEditing
        onClose={jest.fn()}
        onSave={handleSave}
      />,
    );

    const description = screen.getByPlaceholderText(
      "상세한 설명, 참고 링크, 메모 등을 입력하세요.",
    );
    fireEvent.change(description, {
      target: { value: "updated parent description" },
    });
    fireEvent.click(screen.getByRole("button", { name: "적용" }));

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "updated parent description",
        children: initialTodo.children,
      }),
    );
  });
});
