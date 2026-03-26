"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Button from "@/components/atoms/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  enableLogging?: boolean; // onError 대신 로깅 활성화 플래그 사용
}

interface State {
  hasError: boolean;
  error?: Error | undefined;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // 로깅 활성화 시에만 추가 처리
    if (this.props.enableLogging) {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // 에러 추적 서비스 로직
    if (process.env.NODE_ENV === "development") {
      console.error("Logging error to external service:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
    // Production: Send to Sentry, LogRocket, etc.
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col h-screen items-center justify-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            문제가 발생했습니다
          </h2>
          <p className="text-red-600 mb-4 text-center">
            {this.state.error?.message || "알 수 없는 오류가 발생했습니다."}
          </p>
          <div className="flex gap-2">
            <Button
              text="다시 시도"
              onClick={this.handleReset}
              width={100}
              height={40}
            />
            <Button
              text="새로고침"
              onClick={() => window.location.reload()}
              contained={false}
              width={100}
              height={40}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
