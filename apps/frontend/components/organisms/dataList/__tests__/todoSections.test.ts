import type { DataListItemType } from "../dataList";
import {
  cloneTodoItem,
  insertAtPlacement,
  moveSectionToPlacement,
  moveTodoToPlacement,
} from "../todoSections";

const items: DataListItemType[] = [
  { id: 1, text: "morning", type: "section" },
  { id: 2, text: "mail", isDone: false, type: "todo" },
  { id: 3, text: "afternoon", type: "section" },
  { id: 4, text: "work", isDone: false, type: "todo" },
  { id: 5, text: "rest", isDone: false, type: "todo" },
];

const ids = (list: DataListItemType[]) => list.map((item) => item.id);

describe("todo section placement", () => {
  it("adds a todo at the end of its selected section", () => {
    expect(
      ids(
        insertAtPlacement(
          items,
          { id: 6, text: "meeting", isDone: false, type: "todo" },
          "section:1",
        ),
      ),
    ).toEqual([1, 2, 6, 3, 4, 5]);
  });

  it("moves a todo into the selected section", () => {
    expect(
      ids(
        moveTodoToPlacement(items, 4, { ...items[4], text: "moved rest" }, "section:1"),
      ),
    ).toEqual([1, 2, 5, 3, 4]);
  });

  it("places a todo at the selected order within a section", () => {
    expect(
      ids(
        moveTodoToPlacement(
          items,
          4,
          { ...items[4], text: "moved rest" },
          "section:1",
          0,
        ),
      ),
    ).toEqual([1, 5, 2, 3, 4]);
  });

  it("moves a section together with all items below it", () => {
    expect(
      ids(
        moveSectionToPlacement(items, 0, { ...items[0], text: "moved morning" }, "end"),
      ),
    ).toEqual([3, 4, 5, 1, 2]);
  });

  it("places a new section at the requested list boundary", () => {
    expect(
      ids(insertAtPlacement(items, { id: 6, text: "first", type: "section" }, "start")),
    ).toEqual([6, 1, 2, 3, 4, 5]);
  });

  it("copies a todo with its descriptions and children without sharing IDs", () => {
    const original: DataListItemType = {
      id: 7,
      text: "parent",
      isDone: false,
      description: "parent description",
      children: [
        {
          id: 8,
          text: "child",
          isDone: true,
          description: "child description",
        },
      ],
    };

    const copied = cloneTodoItem(original);

    expect(copied).toEqual(expect.objectContaining({
      text: original.text,
      description: original.description,
      children: [expect.objectContaining({
        text: "child",
        description: "child description",
      })],
    }));
    expect(copied.id).not.toBe(original.id);
    expect(copied.children?.[0]?.id).not.toBe(original.children?.[0]?.id);
  });
});
