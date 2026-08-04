import type { Metadata } from "next";
import TodoClient from "./TodoClient";

export const metadata: Metadata = {
  title: "투두 리스트",
};

export default function TodoPage() {
  return <TodoClient />;
}
