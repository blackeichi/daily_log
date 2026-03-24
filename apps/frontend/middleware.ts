import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAMES } from "./app/constants/cookie";

/**
 * Middleware: 인증 상태에 따른 페이지 접근 제어
 * - refreshToken이 있으면 로그인/회원가입 페이지 접근 차단
 * - refreshToken이 없으면 private 페이지 접근 차단
 */
export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN);
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === "/login" || pathname === "/signup";

  // 1. 쿠키가 있는데 로그인/회원가입 페이지 접근 시 홈으로 리다이렉트
  if (refreshToken && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. 쿠키가 없는데 private 페이지 접근 시 로그인으로 리다이렉트
  if (!refreshToken && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 미들웨어를 모든 경로에 적용 (static 파일 및 api 제외)
export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 경로에 적용:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더의 파일들
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
