export const ROUTE = {
  HOME: "/home",
  LOGIN: "/login",
  SIGNUP: "/signup",
  TODO: "/todo",
  DIET: "/diet",
  LOG: "/log",
  ROUTINE: "/routine",
  POMODORO: "/pomodoro",
  STOCKS: "/stocks",
  PROFILE: "/profile",
  // ENGLISH: "/english",
};

export const MENU_LIST = [
  { id: "HOME", name: "🏠 홈", href: ROUTE.HOME },
  { id: "ROUTINE", name: "☀️ 루틴", href: ROUTE.ROUTINE },
  { id: "TODO", name: "📋 To-Do", href: ROUTE.TODO },
  { id: "LOG", name: "📓 로그", href: ROUTE.LOG },
  { id: "DIET", name: "📅 DIET", href: ROUTE.DIET },
  { id: "POMODORO", name: "⏱ 포모도로", href: ROUTE.POMODORO },
  { id: "STOCKS", name: "📈 주식", href: ROUTE.STOCKS },
  // { id: "ENGLISH", name: "🗽 ENGLISH", href: ROUTE.ENGLISH },
  { id: "PROFILE", name: "🪪 프로필", href: ROUTE.PROFILE },
];

export const IS_REDIRECTED = "is_redirected";
