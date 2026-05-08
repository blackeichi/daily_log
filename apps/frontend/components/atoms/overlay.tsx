"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export default function Overlay({
  onClick,
  isOpen = true,
  children,
  style = {},
  zIndex,
  ariaLabel = "대화상자",
}: {
  onClick: () => void;
  isOpen?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
  zIndex?: number;
  ariaLabel?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClick();
      return;
    }

    if (e.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => {
      return !element.hasAttribute("disabled") && element.offsetParent !== null;
    });

    // 내부에 버튼/input 같은 포커스 가능한 요소가 없으면 dialog 자체에 포커스 유지
    if (focusableElements.length === 0) {
      e.preventDefault();
      dialog.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: 첫 번째 요소에서 뒤로 가면 마지막 요소로 이동
      if (
        lastElement &&
        (document.activeElement === firstElement ||
          document.activeElement === dialog)
      ) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: 마지막 요소에서 앞으로 가면 첫 번째 요소로 이동
      if (firstElement && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  return (
    <div
      className={`fixed w-screen h-screen left-0 top-0 justify-center bg-[rgba(0,0,0,0.4)] items-center ${
        isOpen ? "flex" : "hidden"
      }`}
      style={{ zIndex: zIndex || 50 }}
      onMouseDown={onClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="p-1 bg-stone-100 rounded-md shadow-lg shadow-stone-600 max-h-[95vh] overflow-y-auto focus:outline-none"
        style={style}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
