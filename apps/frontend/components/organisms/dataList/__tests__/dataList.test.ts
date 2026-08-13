import { setChildTodoDone, setTodoTreeDone } from "../dataList";

const todo = {
  id: 1,
  text: "상위 투두",
  isDone: false,
  children: [
    { id: 2, text: "첫 번째", isDone: false },
    { id: 3, text: "두 번째", isDone: false },
  ],
};

describe("todo completion synchronization", () => {
  it("checks and unchecks every child with its parent", () => {
    const checked = setTodoTreeDone(todo, true);
    expect(checked.isDone).toBe(true);
    expect(checked.children?.every((child) => child.isDone)).toBe(true);

    const unchecked = setTodoTreeDone(checked, false);
    expect(unchecked.isDone).toBe(false);
    expect(unchecked.children?.every((child) => !child.isDone)).toBe(true);
  });

  it("checks the parent only after all children are checked", () => {
    const firstChecked = setChildTodoDone(todo, 0, true);
    expect(firstChecked.isDone).toBe(false);

    const allChecked = setChildTodoDone(firstChecked, 1, true);
    expect(allChecked.isDone).toBe(true);
  });

  it("unchecks the parent when any child is unchecked", () => {
    const checked = setTodoTreeDone(
      { ...todo, description: "parent description" },
      true,
    );
    const oneUnchecked = setChildTodoDone(checked, 0, false);
    expect(oneUnchecked.isDone).toBe(false);
    expect(oneUnchecked.description).toBe("parent description");
  });
});
