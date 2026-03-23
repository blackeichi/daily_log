import { memo, useEffect, useState } from "react";
import { HeaderLogo } from "../../atoms/headerLogo";
import { MENU_LIST, ROUTE } from "@/app/constants/routes";
import Link from "next/link";
import { CiMenuKebab } from "react-icons/ci";

const MenuList = () => {
  const [hasScroll, setHasScroll] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      setHasScroll(currentScrollTop >= 30);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const [openMenu, setOpenMenu] = useState(false);
  return (
    <div
      className={`w-full fixed top-0 left-0 h-24 flex justify-center bg-stone-100/30 backdrop-blur-md select-none z-40 ${
        hasScroll ? "shadow-md" : ""
      }`}
    >
      <div className="w-full h-full flex justify-between items-center max-w-5xl px-2">
        <div className="cursor-pointer">
          <HeaderLogo to={ROUTE.HOME} />
        </div>
        <div
          className="relative"
          tabIndex={-1}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setOpenMenu(false);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setOpenMenu(!openMenu)}
            className="p-1 hover:bg-stone-200 rounded-full transition-colors"
            aria-label="메뉴 열기/닫기"
          >
            <CiMenuKebab
              className={`text-2xl sm:text-4xl ${openMenu ? "" : "rotate-90"} transition-transform duration-300`}
            />
          </button>
          <div
            className={`absolute top-8 p-2 sm:top-10 w-20 sm:w-32 right-0 min-w-max bg-white rounded-md overflow-hidden shadow-md shadow-stone-500 transition-all duration-300 origin-top-right ${openMenu ? "opacity-100 scale-100" : "opacity-0 scale-60 pointer-events-none"}`}
          >
            {MENU_LIST.map((menu) => (
              <Link
                key={menu.id}
                href={menu.href}
                className="block px-6 pl-2 py-2 sm:py-4 text-xs sm:text-sm text-stone-800 hover:bg-stone-100"
                onClick={() => setOpenMenu(false)}
                prefetch={false}
              >
                {menu.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MenuList);
