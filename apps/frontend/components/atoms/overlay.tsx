"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && isMounted) {
      dialogRef.current?.focus();
    }
  }, [isMounted, isOpen]);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted, isOpen]);

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

  if (!isMounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 h-dvh w-screen justify-center bg-black/55 p-3 backdrop-blur-[1px] items-center ${
        isOpen ? "flex" : "hidden"
      }`}
      style={{ zIndex: zIndex || 50 }}
      onMouseDown={onClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="max-h-[95vh] overflow-y-auto rounded-md bg-stone-100 p-1 shadow-2xl shadow-black/40 focus:outline-none"
        style={style}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
