"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBell,
  FaBellSlash,
  FaCoffee,
  FaPause,
  FaPlay,
  FaRedo,
  FaStop,
} from "react-icons/fa";
import { MdTimer } from "react-icons/md";

type TimerMode = "focus" | "break";
type TimerStatus = "idle" | "running" | "paused";
type NotificationState = "unsupported" | "default" | "granted" | "denied";

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;
const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

const STORAGE_KEY = "DAILY_LOG_POMODORO_SETTINGS";

function clampMinutes(value: number) {
  if (!Number.isFinite(value)) return MIN_MINUTES;
  return Math.min(Math.max(Math.floor(value), MIN_MINUTES), MAX_MINUTES);
}

function minutesToSeconds(minutes: number) {
  return minutes * 60;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function getNotificationState(): NotificationState {
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }

  return window.Notification.permission;
}

export default function PomodoroUI() {
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(
    minutesToSeconds(DEFAULT_FOCUS_MINUTES),
  );
  const [notificationState, setNotificationState] =
    useState<NotificationState>("default");

  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const serviceWorkerRegistrationRef =
    useRef<ServiceWorkerRegistration | null>(null);

  const currentDurationSeconds = useMemo(
    () => minutesToSeconds(mode === "focus" ? focusMinutes : breakMinutes),
    [breakMinutes, focusMinutes, mode],
  );

  const progress = useMemo(() => {
    if (currentDurationSeconds <= 0) return 0;
    return Math.min(
      Math.max(
        ((currentDurationSeconds - remainingSeconds) / currentDurationSeconds) *
          100,
        0,
      ),
      100,
    );
  }, [currentDurationSeconds, remainingSeconds]);

  const modeLabel = mode === "focus" ? "집중 시간" : "휴식 시간";
  const nextModeLabel = mode === "focus" ? "휴식 시간" : "집중 시간";

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const getServiceWorkerRegistration = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      return null;
    }

    if (serviceWorkerRegistrationRef.current) {
      return serviceWorkerRegistrationRef.current;
    }

    try {
      await navigator.serviceWorker.register(
        "/pomodoro-notification-sw.js",
      );
      const registration = await navigator.serviceWorker.ready;
      serviceWorkerRegistrationRef.current = registration;
      return registration;
    } catch {
      return null;
    }
  }, []);

  const showSystemNotification = useCallback(
    async (title: string, body: string) => {
      if (getNotificationState() !== "granted") return false;

      const registration = await getServiceWorkerRegistration();
      if (registration) {
        try {
          await registration.showNotification(title, {
            body,
            icon: "/icon.png",
            data: { url: "/pomodoro", createdAt: Date.now() },
            requireInteraction: true,
            silent: false,
          });
          return true;
        } catch {
          // Fall back to the page Notification API for older browsers.
        }
      }

      try {
        new window.Notification(title, {
          body,
          icon: "/icon.png",
          requireInteraction: true,
          silent: false,
        });
        return true;
      } catch {
        return false;
      }
    },
    [getServiceWorkerRegistration],
  );

  const sendNotification = useCallback(
    async (finishedMode: TimerMode) => {
      const nextLabel = finishedMode === "focus" ? "휴식" : "집중";
      const title =
        finishedMode === "focus" ? "집중 시간이 끝났어요" : "휴식 시간이 끝났어요";
      const body = `${nextLabel} 시간으로 전환할 차례입니다.`;

      if (await showSystemNotification(title, body)) {
        return;
      }

      if (document.visibilityState === "visible") {
        window.alert(`${title}\n${body}`);
      }
    },
    [showSystemNotification],
  );

  const completeTimer = useCallback((shouldNotify = true) => {
    const finishedMode = mode;
    const nextMode: TimerMode = finishedMode === "focus" ? "break" : "focus";
    const nextSeconds = minutesToSeconds(
      nextMode === "focus" ? focusMinutes : breakMinutes,
    );

    clearTimer();
    endTimeRef.current = null;
    setStatus("idle");
    setMode(nextMode);
    setRemainingSeconds(nextSeconds);
    if (shouldNotify) {
      void sendNotification(finishedMode);
    }
  }, [breakMinutes, clearTimer, focusMinutes, mode, sendNotification]);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;

    const nextRemaining = Math.max(
      Math.ceil((endTimeRef.current - Date.now()) / 1000),
      0,
    );

    setRemainingSeconds(nextRemaining);

    if (nextRemaining === 0) {
      completeTimer();
    }
  }, [completeTimer]);

  useEffect(() => {
    setNotificationState(getNotificationState());
    void getServiceWorkerRegistration();

    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (!savedSettings) return;

      const parsed = JSON.parse(savedSettings) as {
        focusMinutes?: number;
        breakMinutes?: number;
      };
      const savedFocusMinutes = clampMinutes(
        parsed.focusMinutes ?? DEFAULT_FOCUS_MINUTES,
      );
      const savedBreakMinutes = clampMinutes(
        parsed.breakMinutes ?? DEFAULT_BREAK_MINUTES,
      );

      setFocusMinutes(savedFocusMinutes);
      setBreakMinutes(savedBreakMinutes);
      setRemainingSeconds(minutesToSeconds(savedFocusMinutes));
    } catch {
      setFocusMinutes(DEFAULT_FOCUS_MINUTES);
      setBreakMinutes(DEFAULT_BREAK_MINUTES);
      setRemainingSeconds(minutesToSeconds(DEFAULT_FOCUS_MINUTES));
    }
  }, [getServiceWorkerRegistration]);

  useEffect(() => {
    const syncNotificationState = () => {
      setNotificationState(getNotificationState());
    };

    window.addEventListener("focus", syncNotificationState);
    document.addEventListener("visibilitychange", syncNotificationState);

    return () => {
      window.removeEventListener("focus", syncNotificationState);
      document.removeEventListener("visibilitychange", syncNotificationState);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ focusMinutes, breakMinutes }),
    );
  }, [breakMinutes, focusMinutes]);

  useEffect(() => {
    if (status === "idle") {
      setRemainingSeconds(currentDurationSeconds);
    }
  }, [currentDurationSeconds, status]);

  useEffect(() => {
    if (status !== "running") return;

    clearTimer();
    intervalRef.current = setInterval(tick, 250);
    tick();

    return clearTimer;
  }, [clearTimer, status, tick]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  useEffect(() => {
    if (status === "running") {
      document.title = `${formatTime(remainingSeconds)} ${modeLabel} - Daily Log`;
      return;
    }

    document.title = "Pomodoro - Daily Log";
  }, [modeLabel, remainingSeconds, status]);

  const startTimer = useCallback(() => {
    endTimeRef.current = Date.now() + remainingSeconds * 1000;
    setStatus("running");
  }, [remainingSeconds]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    endTimeRef.current = null;
    setStatus("paused");
  }, [clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    endTimeRef.current = null;
    setStatus("idle");
    setRemainingSeconds(currentDurationSeconds);
  }, [clearTimer, currentDurationSeconds]);

  const skipTimer = useCallback(() => {
    completeTimer(false);
  }, [completeTimer]);

  const requestNotificationPermission = useCallback(async () => {
    if (getNotificationState() === "unsupported") {
      setNotificationState("unsupported");
      return;
    }

    const permission =
      window.Notification.permission === "default"
        ? await window.Notification.requestPermission()
        : window.Notification.permission;
    setNotificationState(permission);
  }, []);

  const handleChangeFocusMinutes = useCallback(
    (value: string) => {
      const next = clampMinutes(Number(value));
      setFocusMinutes(next);

      if (status !== "running" && mode === "focus") {
        setRemainingSeconds(minutesToSeconds(next));
      }
    },
    [mode, status],
  );

  const handleChangeBreakMinutes = useCallback(
    (value: string) => {
      const next = clampMinutes(Number(value));
      setBreakMinutes(next);

      if (status !== "running" && mode === "break") {
        setRemainingSeconds(minutesToSeconds(next));
      }
    },
    [mode, status],
  );

  return (
    <div className="flex w-full max-w-[760px] flex-col gap-5 pt-4">
      <div className="flex items-center justify-between gap-3 border-b border-stone-300 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-700 text-white">
            <MdTimer size={22} aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">포모도로</h1>
            <span className="text-sm text-stone-500">
              {modeLabel} 진행 후 {nextModeLabel}으로 전환됩니다.
            </span>
          </div>
        </div>

        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-700 transition-colors hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500 disabled:cursor-not-allowed disabled:text-stone-400"
          onClick={requestNotificationPermission}
          disabled={
            notificationState === "granted" ||
            notificationState === "denied" ||
            notificationState === "unsupported"
          }
        >
          {notificationState === "granted" ? (
            <FaBell size={14} aria-hidden="true" />
          ) : (
            <FaBellSlash size={14} aria-hidden="true" />
          )}
          {notificationState === "granted"
            ? "알림 허용됨"
            : notificationState === "denied"
              ? "알림 차단됨"
              : notificationState === "unsupported"
                ? "알림 미지원"
                : "알림 허용"}
        </button>
      </div>

      <div className="flex flex-col gap-5 rounded-md bg-white p-4 shadow-sm shadow-stone-300 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-500">
            {mode === "focus" ? (
              <MdTimer size={18} aria-hidden="true" />
            ) : (
              <FaCoffee size={16} aria-hidden="true" />
            )}
            {modeLabel}
          </div>
          <span className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-500">
            {status === "running"
              ? "진행 중"
              : status === "paused"
                ? "일시정지"
                : "대기 중"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-4 py-5">
          <div className="font-mono text-6xl font-bold tabular-nums text-stone-800 sm:text-7xl">
            {formatTime(remainingSeconds)}
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-stone-200"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-stone-700 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {status === "running" ? (
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-stone-700 px-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
              onClick={pauseTimer}
            >
              <FaPause size={13} aria-hidden="true" />
              일시정지
            </button>
          ) : (
            <button
              type="button"
              className="flex h-11 items-center justify-center gap-2 rounded-md bg-stone-700 px-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
              onClick={startTimer}
            >
              <FaPlay size={13} aria-hidden="true" />
              시작
            </button>
          )}

          <button
            type="button"
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
            onClick={resetTimer}
          >
            <FaRedo size={13} aria-hidden="true" />
            초기화
          </button>

          <button
            type="button"
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-500"
            onClick={skipTimer}
          >
            <FaStop size={13} aria-hidden="true" />
            넘기기
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded-md bg-white p-4 shadow-sm shadow-stone-300 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
          집중 시간
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              value={focusMinutes}
              onChange={(event) => handleChangeFocusMinutes(event.target.value)}
              className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:border-stone-600 disabled:bg-stone-100 disabled:text-stone-400"
              disabled={status === "running"}
            />
            <span className="text-sm text-stone-500">분</span>
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
          휴식 시간
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              value={breakMinutes}
              onChange={(event) => handleChangeBreakMinutes(event.target.value)}
              className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:border-stone-600 disabled:bg-stone-100 disabled:text-stone-400"
              disabled={status === "running"}
            />
            <span className="text-sm text-stone-500">분</span>
          </div>
        </label>
      </div>

      {notificationState === "denied" && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          브라우저에서 알림이 차단되어 있습니다. Safari 또는 Chrome의 사이트
          설정에서 이 사이트의 알림을 허용해 주세요.
        </p>
      )}

      {notificationState === "unsupported" && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          이 환경에서는 시스템 알림을 사용할 수 없습니다. HTTPS 주소 또는
          localhost에서 최신 Safari나 Chrome으로 접속해 주세요.
        </p>
      )}

    </div>
  );
}
